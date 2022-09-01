import { Button, Card, Col, Container, Grid, Image, Link, Row, Spacer, Text } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AccountUserPersonSquare, AlertOctagonError, Wallet } from 'react-basicons';
import { NavBar } from '../src/ui/NavBar';
import { Code } from '../src/utils/Code';
import { Copy } from '../src/utils/Copy';



const SDKDocumentation: NextPage = () => {
    const router = useRouter()


    return (
        <div>
            <Head>
                <title>BRØK - Contact</title>
                <meta name="description" content="BRØK Cap Table" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            {/* NAVBAR */}
            <NavBar></NavBar>
            <Container
                as="main"
                display="flex"
                direction="column"
            // justify="center"
            // style={{ minHeight: '100vh' }}
            >
                {/* HERO */}
                <Spacer y={5}></Spacer>
                <Grid.Container justify="center" gap={4}>
                    <Grid xs={12} style={{ maxWidth: "70rem" }} justify="center" >
                        <Text h1>Contact</Text>
                    </Grid>

                    <Grid xs={6}  >
                        <Card css={{ p: "$6", mw: "400px" }}>
                            <Card.Header>
                                <AccountUserPersonSquare size={50}></AccountUserPersonSquare>
                                <Grid.Container css={{ pl: "$6" }}>
                                    <Grid xs={12}>
                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                            Sverre
                                        </Text>
                                    </Grid>
                                    <Grid xs={12}>
                                        <Text css={{ color: "$accents8" }}>sverre (æt) brreg.no</Text>
                                    </Grid>
                                </Grid.Container>
                            </Card.Header>
                            <Card.Body css={{ py: "$2" }}>
                                <Text>
                                    Law
                                </Text>
                            </Card.Body>
                        </Card>
                    </Grid>

                    <Grid xs={6}  >
                        <Card css={{ p: "$6", mw: "400px" }}>
                            <Card.Header>
                                <AccountUserPersonSquare size={50}></AccountUserPersonSquare>
                                <Grid.Container css={{ pl: "$6" }}>
                                    <Grid xs={12}>
                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                            Andreas
                                        </Text>
                                    </Grid>
                                    <Grid xs={12}>
                                        <Text css={{ color: "$accents8" }}>andreas (æt) brreg.no</Text>
                                    </Grid>
                                </Grid.Container>
                            </Card.Header>
                            <Card.Body css={{ py: "$2" }}>
                                <Text>
                                    Business development
                                </Text>
                            </Card.Body>
                        </Card>
                    </Grid>

                    <Grid xs={6}  >
                        <Card css={{ p: "$6", mw: "400px" }}>
                            <Card.Header>
                                <AccountUserPersonSquare size={50}></AccountUserPersonSquare>
                                <Grid.Container css={{ pl: "$6" }}>
                                    <Grid xs={12}>
                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                            Jon
                                        </Text>
                                    </Grid>
                                    <Grid xs={12}>
                                        <Text css={{ color: "$accents8" }}>jon (æt) symfoni.dev</Text>
                                    </Grid>
                                </Grid.Container>
                            </Card.Header>
                            <Card.Body css={{ py: "$2" }}>
                                <Text>
                                    Architect
                                </Text>
                            </Card.Body>
                        </Card>
                    </Grid>

                    <Grid xs={6}  >
                        <Card css={{ p: "$6", mw: "400px" }}>
                            <Card.Header>
                                <AccountUserPersonSquare size={50}></AccountUserPersonSquare>
                                <Grid.Container css={{ pl: "$6" }}>
                                    <Grid xs={12}>
                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                            Stein
                                        </Text>
                                    </Grid>
                                    <Grid xs={12}>
                                        <Text css={{ color: "$accents8" }}>stein (æt) symfoni.dev</Text>
                                    </Grid>
                                </Grid.Container>
                            </Card.Header>
                            <Card.Body css={{ py: "$2" }}>
                                <Text>
                                    Business development
                                </Text>
                            </Card.Body>
                        </Card>
                    </Grid>


                    <Grid xs={6}  >
                        <Card css={{ p: "$6", mw: "400px" }}>
                            <Card.Header>
                                <AccountUserPersonSquare size={50}></AccountUserPersonSquare>
                                <Grid.Container css={{ pl: "$6" }}>
                                    <Grid xs={12}>
                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                            Robin
                                        </Text>
                                    </Grid>
                                    <Grid xs={12}>
                                        <Text css={{ color: "$accents8" }}>robin (æt) symfoni.dev</Text>
                                    </Grid>
                                </Grid.Container>
                            </Card.Header>
                            <Card.Body css={{ py: "$2" }}>
                                <Text>
                                    Developer
                                </Text>
                            </Card.Body>
                        </Card>
                    </Grid>

                </Grid.Container> {/* END FULL page */}

                <Spacer y={5}></Spacer>


            </Container >
            <Spacer y={12}></Spacer>
        </div >
    )
}

export default SDKDocumentation
