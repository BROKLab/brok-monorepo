import { Card, Container, Grid, styled, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Search } from 'react-iconly';
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
        alignItems="center"
        style={{ height: '80vh' }}
      >
        <Grid.Container gap={2} css={{ p: '$sm' }} >
          <Grid xs={12} sm={6}>
            <Card isHoverable isPressable css={{ p: "$sm", maxWidth: "400px" }} onPress={() => router.push('/search')}>
              <Card.Header >
                <Search></Search>
                <Grid.Container css={{ pl: "$6" }}>
                  <Grid xs={12}>
                    <Text h4 css={{ lineHeight: "$xs" }}>
                      Search
                    </Text>
                  </Grid>
                  <Grid xs={12}>
                    <Text css={{ color: "$accents8" }}>Search for cap tables</Text>
                  </Grid>
                </Grid.Container>
              </Card.Header>
            </Card>
          </Grid>
          <Grid xs={12} sm={6}>
            <Card isHoverable isPressable css={{ p: "$sm", maxWidth: "400px" }} onClick={() => router.push('/publish')}>
              <Card.Header >
                <Plus></Plus>

                <Grid.Container css={{ pl: "$6" }}>
                  <Grid xs={12}>
                    <Text h4 css={{ lineHeight: "$xs" }}>
                      Publish
                    </Text>
                  </Grid>
                  <Grid xs={12}>
                    <Text css={{ color: "$accents8" }}>Publish cap tables (simulation)</Text>
                  </Grid>
                </Grid.Container>
              </Card.Header>
            </Card>
          </Grid>
        </Grid.Container>

      </Container>
      <Footer></Footer>


    </Container >
  )
}

export default Home
