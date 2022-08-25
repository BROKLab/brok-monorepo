import { Button, Container, Row, styled, Grid, Image, Text, Col, Avatar, Spacer, Card } from '@nextui-org/react'
import Head from 'next/head'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FunctionComponent, ReactElement, ReactNode } from 'react';
import { Search, Plus } from 'react-iconly'
import { Footer } from '../ui/Footer';
import { NavBar } from '../ui/NavBar';


interface Props {
    children: ReactNode
}
const DefaultLayout: FunctionComponent<Props> = (props) => {

    return (
        <Container>
            <Head>
                <title>BRØK aksjeeierbok</title>
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
                {props.children}

            </Container>
            <Footer></Footer>



        </Container >
    )
}
export default DefaultLayout