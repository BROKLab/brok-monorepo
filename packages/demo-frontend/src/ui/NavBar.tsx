import React from 'react';
import { Container, Row, Grid, Col, Avatar, Image, Text } from '@nextui-org/react';
import Link from 'next/link';

interface Props {}

export const NavBar = () => {

    return (
        <Container as="header" style={{ minHeight: "10vh" }} fluid>
            <Row>
                <Grid.Container>
                    <Grid xs={4} justify="flex-start">
                        <Grid.Container>
                            <Grid>
                                <Link href="/">
                                    <Image
                                        showSkeleton
                                        height={80}
                                        src="/images/brreg_logo.svg"
                                        alt="Brønnøysundregistrene"
                                        objectFit="fill"
                                    />

                                </Link>

                            </Grid >
                            <Grid xs={0} sm={12}>
                                <Text h2 size={"small"}  >Cap Table registry sandbox</Text>
                            </Grid>
                        </Grid.Container>
                    </Grid>


                    <Grid xs={4} alignItems="center" justify="flex-end">

                        <Grid.Container justify="center" gap={1}>
                            <Grid>
                                <Link href="/search">Find</Link>
                            </Grid>
                            <Grid>
                                <Link href="/publish">Publish</Link>
                            </Grid>
                        </Grid.Container>
                    </Grid>
                    <Grid xs={2} alignItems="center" justify="flex-end">
                        <Avatar text='todo'></Avatar>

                    </Grid>
                </Grid.Container>
            </Row>
        </Container >
    )
}