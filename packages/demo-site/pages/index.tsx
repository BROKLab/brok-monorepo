import { Card, Col, Container, Grid, Spacer, styled, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Search, TwoUsers, User } from 'react-iconly';
import { ToastContainer } from 'react-toastify';
import { Footer } from './../src/ui/Footer';
import { NavBar } from './../src/ui/NavBar';

const Home: NextPage = () => {
  const router = useRouter()


  return (
    <Container >
      <Head>
        <title>BRØK cap table registry</title>
        <meta name="description" content="BRØK Cap Table" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <NavBar></NavBar>
      <Container
        as="main"
        display="flex"
        direction="column"
        justify="center"
        style={{ height: '80vh' }}
      >


        <Grid.Container gap={2} >
          <Grid sm></Grid>

          <Grid xs={12} sm={4}>
            <Col>
              <Text h3>Fagsystem</Text>
              <Spacer y={2}></Spacer>

              <Card isHoverable isPressable css={{ p: "$xs", maxWidth: "400px", maxHeight: "200px" }} onClick={() => router.push('/publish')}>
                <Card.Header >
                  <Plus></Plus>
                  <Grid.Container css={{ pl: "$6" }} gap={1}>
                    <Grid xs={12}>
                      <Text h4 css={{ lineHeight: "$xs" }}>
                        Publish cap table
                      </Text>
                    </Grid>
                    <Grid xs={12}>
                      <Text css={{ color: "$accents8" }}>Publish one of your organization cap tables to BRØK</Text>
                    </Grid>
                  </Grid.Container>
                </Card.Header>
              </Card>
              <Spacer y={1}></Spacer>

              <Card isHoverable isPressable css={{ p: "$xs", maxWidth: "400px" }} onClick={() => router.push('/publish')}>
                <Card.Header >
                  <TwoUsers></TwoUsers>
                  <Grid.Container css={{ pl: "$6" }} gap={1}>
                    <Grid xs={12}>
                      <Text h4 css={{ lineHeight: "$xs" }}>
                        Publish transfer
                      </Text>
                    </Grid>
                    <Grid xs={12}>
                      <Text css={{ color: "$accents8" }}>Publish a requested transfer of shares from Fagsystem to BRØK</Text>
                    </Grid>
                  </Grid.Container>
                </Card.Header>
              </Card>
              <Spacer y={1}></Spacer>

              <Card isHoverable isPressable css={{ p: "$xs", maxWidth: "400px" }} onClick={() => router.push('/publish')}>
                <Card.Header >
                  <User></User>
                  <Grid.Container css={{ pl: "$6" }} gap={1}>
                    <Grid xs={12}>
                      <Text h4 css={{ lineHeight: "$xs" }}>
                        Publish shareholder information change
                      </Text>
                    </Grid>
                    <Grid xs={12}>
                      <Text css={{ color: "$accents8" }}>Publish a requested information change on a shareholder to BRØK</Text>
                    </Grid>
                  </Grid.Container>
                </Card.Header>
              </Card>

            </Col>
          </Grid>
          <Grid xs={12} sm={4}>
            <Col>
              <Text h3>Insights </Text>
              <Spacer y={2}></Spacer>
              <Card isHoverable isPressable css={{ p: "$xs", maxWidth: "400px" }} onPress={() => router.push('/search')}>
                <Card.Header >
                  <Search></Search>
                  <Grid.Container css={{ pl: "$6" }} >
                    <Grid xs={12}>
                      <Text h4 css={{ lineHeight: "$xs" }}>
                        Find
                      </Text>
                    </Grid>
                    <Grid xs={12}>
                      <Text css={{ color: "$accents8" }}>Find cap tables</Text>
                    </Grid>
                  </Grid.Container>
                </Card.Header>
              </Card>
            </Col>

          </Grid>
          <Grid sm></Grid>
        </Grid.Container>

      </Container>
      <Footer></Footer>


    </Container >
  )
}

export default Home
