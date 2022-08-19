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

const Search: NextPage = () => {
  const router = useRouter()

  const fetchCapTables = () => {

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
