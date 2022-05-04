import { Box, Grid, Text } from 'grommet';
import React from 'react';

interface Props {
  data: {
    name: string;
    organizationNumber: string;
    controller: string;
    totalSupply: string;
  };
}

export const Details: React.FC<Props> = ({ data, ...props }) => {
  return (
    <Box gap="small">
      <Grid columns={['small', 'flex']}>
        <Text>Foretaksnavn</Text>
        <Text weight="bold">{data.name}</Text>
      </Grid>

      <Grid columns={['small', 'flex']}>
        <Text>Organisasjonsnummer</Text>
        <Text weight="bold">{data.organizationNumber}</Text>
      </Grid>

      {/* <Grid columns={['small', 'flex']}>
        <Text>Fagsystem</Text>
        <Text weight="bold">{data.controller}</Text>
      </Grid> */}

      <Grid columns={['small', 'flex']}>
        <Text>Antall aksjer</Text>
        <Text weight="bold">{parseInt(data.totalSupply)}</Text>
      </Grid>
    </Box>
  );
};
