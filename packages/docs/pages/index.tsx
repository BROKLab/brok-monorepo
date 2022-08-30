import { Card, Container, Grid, styled, Text, Navbar, Dropdown, Button, Link, Avatar, Spacer, Col } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { BankFinancial } from 'react-basicons'


const Home: NextPage = () => {
  const router = useRouter()


  return (
    <div>
      <Head>
        <title>BRØK docs</title>
        <meta name="description" content="BRØK Cap Table" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      {/* NAVBAR */}


      <Navbar variant="static" maxWidth={"fluid"}>
        <Navbar.Brand>
          <Text h1 >BRØK docs</Text>
        </Navbar.Brand>
        <Navbar.Content
          enableCursorHighlight
          activeColor="secondary"
          hideIn="xs"
          variant="underline"
        >

          <Navbar.Link isActive href="#">
            Getting stared
          </Navbar.Link>
          <Navbar.Link href="#">SDK</Navbar.Link>
          <Navbar.Link href="#">Contact</Navbar.Link>
        </Navbar.Content>
        <Navbar.Content>

          <Navbar.Item>
            <Avatar></Avatar>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>
      <Container
        as="main"
        display="flex"
        direction="column"
        justify="flex-start"
        style={{ minHeight: '100vh' }}
      >


        {/* HERO */}
        <Grid.Container  >
          <Spacer y={5}></Spacer>
          <Grid xs={12} justify="center">
            <Text h2>Base layer Cap table solution</Text>

          </Grid>
          <Spacer y={2}></Spacer>
          <Grid xs={12} justify="center">
            <Button>Getting started</Button>

          </Grid>
          <Spacer y={5}></Spacer>
        </Grid.Container>

        {/* FIRST */}
        <Grid.Container>
          <Grid xs={6}>
            <Text h3>Install</Text>
          </Grid>
          <Grid xs={6}>
            <Text h3>Install</Text>
          </Grid>
        </Grid.Container>

      </Container>
    </div >
  )
}

export default Home
