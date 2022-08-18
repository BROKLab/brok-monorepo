import { Button, Card, Container, Grid, Spacer, styled, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Search } from 'react-iconly';
import { Footer } from '../src/ui/Footer';
import { NavBar } from '../src/ui/NavBar';

const Home: NextPage = () => {
  const router = useRouter()

  const simulate = async () => {

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
          <Button>Start simulation</Button>
        </Grid.Container>

      </Container>
      <Footer></Footer>


    </Container >
  )
}

export default Home
