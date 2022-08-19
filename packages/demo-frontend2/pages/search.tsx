import { SDK } from "@brok/sdk2";
import { Button, Container, Grid, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Search: NextPage = () => {
  const router = useRouter()

  const fetchCapTables = async () => {
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
    const list = await sdk.getCapTableList();
    console.log(list)
  }

  return (
    <Container >
      <Head>
        <title>BRØK - Search cap tables</title>
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
            <Button onPress={() => fetchCapTables()}>Hent</Button>
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

export default Search
