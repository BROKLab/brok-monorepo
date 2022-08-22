import { SDK } from "@brok/sdk2";
import { Button, Container, Grid, Spacer, Text, Table } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Key, useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import NoSSR from "../src/components/utils/NoSSR";
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';
import { ethers } from "ethers"


const fetcher = (url: string) => fetch(url).then((res) => res.json());



const CapTable: NextPage = () => {
  const router = useRouter()
  const { pid } = router.query
  console.log(pid)
  const [capTable, setCapTable] = useState<Awaited<ReturnType<SDK["getCapTable"]>>>();
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);

  const getCapTable = async (address: string) => {
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
    return await sdk.getCapTable(address);
  }

  useEffect(() => {
    let subscribed = true
    const doAsync = async () => {
      if (typeof pid === "string") {
        const capTable = await getCapTable(pid)
        if (subscribed) {
          setCapTable(capTable)
        }
      } else {
        throw "Invalid cap table address"
      }

    };
    doAsync();
    return () => { subscribed = false }
  }, [pid])

  // const onSelect = (key: string) => {
  //   router.push("/cap-table/" + key)
  // }

  return (
    <Container >
      <Head>
        <title>BRØK - Cap table</title>
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
            <Text h3>Registry</Text>
          </Grid>
          <Grid xs={12}>
            <NoSSR>

            </NoSSR>
          </Grid>
          <Grid>
            <Button.Group>
              <Button disabled={skip === 0} onPress={() => setSkip(old => old - 10)}>Back</Button>
              <Button onPress={() => setSkip(old => old + 10)}>Forward</Button>
            </Button.Group>
          </Grid>
        </Grid.Container>

      </Container>
      <Footer></Footer>
      <ToastContainer position="top-right"
        hideProgressBar={true}
        closeOnClick
        pauseOnHover ></ToastContainer>

    </Container >
  )
}

export default CapTable
