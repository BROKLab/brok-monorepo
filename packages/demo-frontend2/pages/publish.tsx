import { Button, Container, Grid, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import type { Organisasjon } from './api/demo-data/companies.types';
import { RandomShareholder } from './api/random-shareholder';
import { SDK } from "@brok/sdk2";
import { toast, ToastContainer } from 'react-toastify';
import { ethers } from "ethers"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const router = useRouter()

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

  const simulate = async () => {
    console.log(await getRandomOrgs(2))
    console.log(await getRandomShareholders(4))

    // const sdk = await SDK.init({ ceramicUrl: "https://ceramic-clay.3boxlabs.com", ethereumRpc: "http://127.0.0.1:8545/", secret: "kid letter bicycle motion maid token change couch useless seven boost strategy", theGraphUrl: "http://localhost:8000/subgraphs/name/brok/captable", env: "brokLocal" });
    // const address = await sdk.createCapTable({
    //   name: "Test 535325",
    //   orgnr: "41412124",
    //   shareholders: [
    //     {
    //       amount: "6664444",
    //       birthDate: "230188",
    //       countryCode: "NO",
    //       name: "TES PERSON",
    //       partition: "ordinære",
    //       postalcode: "50553"
    //     }
    //   ]
    // })
    // console.log("CapTableAddress", address)
    // const capTable = await sdk.getCapTable(address)
    // console.log("capTable", capTable)
    // const transferResult = await sdk.transfer(address, [
    //   {
    //     amount: '100',
    //     partition: 'ordinære',
    //     from: capTable.shareholders[0].ethAddress,
    //     name: "Jon",
    //     birthDate: "202020",
    //     countryCode: "NO",
    //     postalcode: "0655",

    //   },
    // ]);
    // console.log("transferResult", transferResult)
  }

  const createCompany = async () => {
    if (!(process.env.NEXT_PUBLIC_BROK_ENVIRONMENT &&
      process.env.NEXT_PUBLIC_CERAMIC_URL &&
      process.env.NEXT_PUBLIC_ETHEREUM_RPC &&
      process.env.NEXT_PUBLIC_THE_GRAPH_URL &&
      process.env.NEXT_PUBLIC_SECRET)) {
      throw "Please set ENV variables"
    }
    const sdk = await SDK.init({
      ceramicUrl: process.env.NEXT_PUBLIC_CERAMIC_URL, ethereumRpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
      secret: process.env.NEXT_PUBLIC_SECRET, theGraphUrl: process.env.NEXT_PUBLIC_THE_GRAPH_URL, env: process.env.NEXT_PUBLIC_BROK_ENVIRONMENT
    });
    const orgs = await getRandomOrgs(1)
    const org = orgs[0]
    const amountShareholders = Math.random() * (5 + 1) + 0;
    const shareholders = await getRandomShareholders(amountShareholders)
    const capTableAddress = await sdk.createCapTable({
      name: org.navn,
      orgnr: org.organisasjonsnummer,
      // Skip last
      shareholders: shareholders.slice(0, -1).map((s, i, arr) => {
        const amount = Math.random() * 100_000 | 10;
        const amountRounded = Math.round(amount / 1000) * 1000
        console.log(amountRounded)
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
      birthDate: newShareholder.foedselsdato,
      postalcode: newShareholder.postalCode,
      countryCode: "NO",
    }]
    const transferResult = await sdk.transfer(capTableAddress, transferRequest);
    toast((t) => <Container>
      <Grid.Container>
        <Grid>
          {`Created cap table ${org.navn}`}
        </Grid>
        <Button onPress={() => router.push(`/cap-table/${capTableAddress}`)}></Button>
      </Grid.Container>
    </Container>, { type: "success" })
    transferResult.map(tr => {
      toast((t) => <Container>
        <Grid.Container>
          <Grid>
            {`Transfered ${tr.amount} from ${tr.from} to ${tr.to}`}
          </Grid>
          <Button onPress={() => router.push(`/cap-table/${capTableAddress}`)}>View cap table</Button>
        </Grid.Container>
      </Container>, { type: "success" })
    })

    console.log("transferResult", transferResult)
  }

  const test = () => {
    toast((t) => <Container>
      <Grid.Container>
        <Grid>
          {`Transfered`}
        </Grid>
        <Button onPress={() => router.push(`/cap-table/}`)}>YO</Button>
      </Grid.Container>
    </Container>, { type: "success" })
  }

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
            <Text h3>Dine selskaper</Text>
            <Button onPress={() => createCompany()}>Start simulation</Button>
            <Button onPress={() => test()}>Start 2</Button>
          </Grid>
        </Grid.Container>

      </Container>
      <Footer></Footer>
      <ToastContainer position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover />

    </Container >
  )
}

export default Home
