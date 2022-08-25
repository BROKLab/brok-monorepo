import React from 'react';
import { Container, Text } from '@nextui-org/react';

interface Props {}

export const Footer: React.FC<Props> = ({ ...props }) => {

    return (
        <Container as="footer" style={{ minHeight: "10vh" }} >
            <Text>Part of Brønnøysundregistrene sandbox</Text>
        </Container>
    )
}