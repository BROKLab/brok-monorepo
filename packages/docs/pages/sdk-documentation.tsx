import { Card, Container, Grid, styled, Text, Navbar, Dropdown, Button, Link, Avatar, Spacer, Col, Row, Image } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BankFinancial } from 'react-basicons'
import NoSSR from '../src/NoSSR';
import { TSCode } from '../src/utils/Code';



const SDKDocumentation: NextPage = () => {
    const router = useRouter()


    return (
        <div>
            <Head>
                <title>BRØK - SDK docs</title>
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
            // justify="center"
            // style={{ minHeight: '100vh' }}
            >
                {/* HERO */}
                <Grid.Container  >
                    <Spacer y={5}></Spacer>
                    <Grid xs={12} justify="center">
                        <Col>
                            <Row justify="center">
                                <Text h2>SDK</Text>
                            </Row>

                        </Col>

                    </Grid>
                </Grid.Container>
                <Spacer y={12}></Spacer>

                <Spacer y={5}></Spacer>

            </Container>
        </div >
    )
}

export default SDKDocumentation
