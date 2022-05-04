import React from 'react';
import { Box, Spinner, Text } from 'grommet';

interface Props {
  message?: string;
}

export const Loading: React.FC<Props> = ({ ...props }) => {
  return (
    <Box align="center" margin={{ vertical: 'large' }}>
      <Spinner />
      {props.message && <Text>{props.message}</Text>}
    </Box>
  );
};
