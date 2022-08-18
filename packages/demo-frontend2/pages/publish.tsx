import { Button, Card, Container, Grid, Spacer, styled, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Search } from 'react-iconly';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import { SDK } from "@brok/sdk2";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const router = useRouter()

  const getRandomOrgs = async (amount: number) => {
    const company = await fetch(`/api/random-company?${new URLSearchParams({
      amount: amount.toString(),
    })}`)
    const json = await company.json()
    if ("data" in json) {
      return json.data
    }
    throw "No data in response"
  }

  const simulate = async () => {
    console.log(await getRandomOrgs(2))

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
          <Button onPress={() => simulate()}>Start simulation</Button>
        </Grid.Container>

      </Container>
      <Footer></Footer>


    </Container >
  )
}

export default Home
