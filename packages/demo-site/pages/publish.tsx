import { Button, Card, Container, Grid, Loading, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import type { Organisasjon } from './api/demo-data/companies.types';
import { RandomShareholder } from './api/random-shareholder';
import { SDK } from "@brok/sdk";
import { toast, ToastContainer } from 'react-toastify';
import { ethers } from "ethers"
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const router = useRouter()
  const [randomOrgs, setRandomOrgs] = useState<Organisasjon[]>([]);
  const [publishing, setPublishing] = useState(false);

  const getRandomOrgs = async (amount: number) => {
    const company = await fetch(`/api/random-org?${new URLSearchParams({
      amount: amount.toString(),
    })}`)
    const json = await company.json()
    if ("data" in json) {
      return json.data as Organisasjon[]
    }
    throw "No data in response"
  }
  const getRandomShareholders = async (amount: number) => {
    const company = await fetch(`/api/random-shareholder?${new URLSearchParams({
      amount: amount.toString(),
    })}`)
    const json = await company.json()
    if ("data" in json) {
      return json.data as RandomShareholder[]
    }
    throw "No data in response"
  }

  const publishOrg = async (org: Organisasjon) => {
    try {
      setPublishing(true)
      if (!(process.env.NEXT_PUBLIC_BROK_ENVIRONMENT &&
        process.env.NEXT_PUBLIC_CERAMIC_URL &&
        process.env.NEXT_PUBLIC_ETHEREUM_RPC &&
        process.env.NEXT_PUBLIC_THE_GRAPH_URL &&
        process.env.NEXT_PUBLIC_SECRET)) {
        console.log("process.env", process.env)
        throw "Please set ENV variables"
      }
      const sdk = await SDK.init({
        ceramicUrl: process.env.NEXT_PUBLIC_CERAMIC_URL, ethereumRpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
        secret: process.env.NEXT_PUBLIC_SECRET, theGraphUrl: process.env.NEXT_PUBLIC_THE_GRAPH_URL, env: process.env.NEXT_PUBLIC_BROK_ENVIRONMENT
      });
      const amountShareholders = Math.floor(Math.random() * (6 - 3 + 1) + 3)
      console.log("amountShareholders", amountShareholders)
      const shareholders = await getRandomShareholders(amountShareholders)
      const issueShareholders = shareholders.slice(0, -1)
      const trasferShareholders = shareholders.slice(-1)
      console.log("shareholders", shareholders)
      console.log("iss", issueShareholders)
      console.log("tra", trasferShareholders)
      const capTableAddress = await sdk.createCapTable({
        name: org.navn,
        orgnr: org.organisasjonsnummer,
        // Skip last
        shareholders: issueShareholders.map((s, i, arr) => {
          const amount = Math.random() * 100_000 | 10;
          const amountRounded = Math.round(amount / 1000) * 1000
          return {
            name: s.visningnavn,
            birthDate: s.foedselsdato,
            postalcode: s.postalCode,
            countryCode: "NO",
            partition: "ordinære",
            amount: amountRounded.toString()
          }
        })
      })

      console.log("CapTableAddress", capTableAddress)
      const capTable = await sdk.getCapTable(capTableAddress)
      console.log(capTable)
      const transferAmount = ethers.utils.formatEther(capTable.shareholders[0].balances[0].amount)
      const newShareholder = shareholders.slice(-1)[0]
      const transferRequest = [{
        amount: Math.round(Math.max(parseInt(transferAmount) / 4, 1)).toString(),
        partition: 'ordinære',
        from: capTable.shareholders[0].ethAddress,
        to: capTable.shareholders[1].ethAddress
      }, {
        amount: Math.round(Math.max(parseInt(transferAmount) / 4, 1)).toString(),
        partition: 'ordinære',
        from: capTable.shareholders[0].ethAddress,
        name: newShareholder.visningnavn,
        organizationIdentifier: Math.floor(100000000 + Math.random() * 900000000).toString(),
        organizationIdentifierType: "EUID",
        postalcode: newShareholder.postalCode,
        countryCode: "NO",
      }]
      const transferResult = await sdk.transfer(capTableAddress, transferRequest);
      toast((t) => <Container>
        <Grid.Container>
          <Grid>
            <Text>{`Published cap table ${org.navn}`}</Text>
          </Grid>
          <Grid>
            <Button as='a' target="_blank" onPress={() => router.push(`/cap-table/${capTableAddress}`)}>View cap table</Button>
          </Grid>
        </Grid.Container>
      </Container>, { type: "success" })
      console.log("transferResult", transferResult)
      setPublishing(false)
    } catch (e) {
      if (e instanceof Error) {
        toast(e.message, { type: "error" })
      }
      console.error(e)
      setPublishing(false)
    }
  }


  useEffect(() => {
    let subscribed = true
    const doAsync = async () => {
      if (randomOrgs.length === 0) {
        const orgs = await getRandomOrgs(2).catch(() =>
          getRandomOrgs(1)
        )
        if (subscribed) {
          setRandomOrgs(orgs)
        }
      }
    };
    doAsync();
    return () => { subscribed = false }
  }, [randomOrgs])
  return (
    <Container >
      <Head>
        <title>BRØK - Publish cap table</title>
        <meta name="description" content="BRØK Cap Table" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <NavBar></NavBar>
      <Container
        as="main"
        display="flex"
        direction="column"
        alignItems="center"
        style={{ height: '80vh' }}
      >
        <Spacer y={4}></Spacer>
        <Grid.Container gap={2} css={{ p: '$sm' }} justify="center" >
          <Grid>
            <Text h3>Your companies ready for BRØK publish</Text>
            <Spacer y={2}></Spacer>
            <Text >Initial publish one of your companies cap tables to BRØK .</Text>
            <Spacer y={2}></Spacer>
            <Grid.Container gap={1}>

              {randomOrgs.map(org => (
                <Grid xs={12} sm={6} key={org.organisasjonsnummer}>
                  <Card>
                    <Card.Header>
                      <Text h4>{org.navn}</Text>
                    </Card.Header>
                    <Card.Body>
                      <Grid.Container gap={1}>
                        <Grid xs={6}>Orgnr:</Grid>
                        <Grid xs={6}>{org.organisasjonsnummer}</Grid>
                        <Grid xs={6}>Founded:</Grid>
                        <Grid xs={6}>{org.stiftelsesdato}</Grid>
                        <Grid xs={6}>Industry:</Grid>
                        <Grid xs={6}>{org.naeringskode1.beskrivelse}</Grid>
                      </Grid.Container>
                    </Card.Body>
                    <Card.Footer>
                      <Button flat size={"sm"} disabled={publishing} onPress={() => publishOrg(org)}>{publishing ? <Loading style={{ margin: 5 }}></Loading> : "Publish"}</Button>
                    </Card.Footer>
                  </Card>
                </Grid>
              ))}
            </Grid.Container>
          </Grid>
        </Grid.Container>

      </Container >
      <Footer></Footer>
      <ToastContainer position="top-right"
        hideProgressBar={true}
        closeOnClick
        pauseOnHover ></ToastContainer>

    </Container >
  )
}

export default Home
