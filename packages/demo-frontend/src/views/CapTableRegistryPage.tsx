import { CapTableRegistryResponse } from '@brok/sdk';
import { Box, Button, Grid, Heading, Paragraph, Spinner, TextInput } from 'grommet';
import React, { useState } from 'react';
import { CapTable, CapTableList } from '../components/CapTableList';
import { useBrok } from '../context/useBrok';

interface Props {}

export const CapTableRegistryPage: React.FC<Props> = ({ ...props }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [capTables, setCapTables] = useState<CapTable[]>();
  const [error, setError] = useState<string>();
  const [name, setName] = useState('');
  const [orgnr, setOrgnr] = useState<number>();
  const { listDeployedCapTables } = useBrok();

  const searchForCapTables = async () => {
    setLoading(true);
    const res = await listDeployedCapTables(orgnr?.toString(), name);
    if (res.isErr()) {
      setError(res.error);
    } else {
      setCapTables(res.value.capTables);
    }
    setLoading(false);
  };

  const handleNameChange = (e: any) => {
    setError('');
    setName(e.target.value);
  };

  const handleOrgnrChange = (e: any) => {
    setError('');
    const parsed = parseInt(e.target.value, 10);
    setOrgnr(parsed);
  };

  return (
    <Box>
      <Heading>Aksjeeierbokregisteret</Heading>
      <Heading level={2}>Søk etter aksjeeierbok</Heading>

      <Grid columns={['1/3']} gap="small">
        <TextInput onChange={handleNameChange} placeholder="Bedriftsnavn" />
        <TextInput type={'number'} onChange={handleOrgnrChange} placeholder="Organisasjonsnummer" />
        <Button disabled={loading} secondary label={'Søk'} onClick={() => searchForCapTables()}></Button>
      </Grid>

      <Box margin="small" align="center" height="small">
        {loading && <Spinner></Spinner>}
      </Box>

      {(capTables || error) && (
        <Grid columns={['1']} gap="small">
          <Heading level={2}>Resultat</Heading>
          {error && <Paragraph>Noe galt skjedde: {error}</Paragraph>}
          {capTables && <CapTableList capTables={capTables}></CapTableList>}
        </Grid>
      )}
    </Box>
  );
};
