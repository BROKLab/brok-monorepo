import React from 'react';
import { Box } from 'grommet';
import { Login } from '../components/Login';

interface Props {}

export const LoginView: React.FC<Props> = ({ ...props }) => {
    return (
        <Box>
            <h1>Login</h1>
            <Login></Login>
        </Box>
    );
};
