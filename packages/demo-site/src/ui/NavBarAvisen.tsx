import React from 'react';
import { Container, Row, Grid, Col, Avatar, Image, Text, Link } from '@nextui-org/react';

interface Props {}

export const NavBarAvisenNo = () => {

    return (
        <Container as="header" style={{ minHeight: "10vh" }} fluid>
            <Row>
                <Grid.Container>
                    <Grid xs={6} justify="flex-start">
                        <Grid.Container>
                            <Grid>
                                <Link href="/">
                                    <Text color='red' h1>NewsPage.com</Text>
                                </Link>
                            </Grid >
                            <Grid xs={0} sm={12}>
                                <Text h2 size={"small"}>World of information </Text>
                            </Grid>
                        </Grid.Container>
                    </Grid>


                    <Grid xs={6} alignItems="center" justify="flex-end">

                        <Grid.Container justify="center" gap={1}>
                            <Grid>
                                <Link href="/" color="text">Go to Brreg</Link>
                            </Grid>

                        </Grid.Container>
                    </Grid>

                </Grid.Container>
            </Row>
        </Container >
    )
}