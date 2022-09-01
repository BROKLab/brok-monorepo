import { Navbar, Avatar, Text, Container, Grid, Row, Col } from '@nextui-org/react';
import React from 'react';

interface Props {}

export const NavBar: React.FC<Props> = ({ ...props }) => {

    return (
        <Navbar variant="static" maxWidth={"fluid"}>
            <Navbar.Toggle showIn={"xs"} aria-label="toggle navigation" />
            <Navbar.Brand>
                <Text h1 >BRØK docs</Text>
            </Navbar.Brand>
            <Navbar.Content
                enableCursorHighlight
                activeColor="secondary"
                hideIn="xs"
                variant="underline"
            >
                <Navbar.Link href="/">
                    Home
                </Navbar.Link>
                <Navbar.Link href="/sdk-documentation">Documentation</Navbar.Link>
                <Navbar.Link href="/contact">Contact</Navbar.Link>
            </Navbar.Content>
            <Navbar.Content>

                <Navbar.Item>
                    <Avatar></Avatar>
                </Navbar.Item>
                <Navbar.Collapse >
                    <Container gap={3} justify="center">
                        <Navbar.Link href="/">
                            Home
                        </Navbar.Link>
                        <Navbar.Link href="/sdk-documentation">Documentation</Navbar.Link>
                        <Navbar.Link href="/contact">Contact</Navbar.Link>
                    </Container>
                </Navbar.Collapse>
            </Navbar.Content>
        </Navbar>
    )
}