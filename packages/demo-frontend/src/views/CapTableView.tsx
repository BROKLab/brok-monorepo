import { CapTableDetails } from '@brok/sdk';
import { Box, Text, Button, Heading, Grid } from 'grommet';
import { Trash } from 'grommet-icons';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CapTableBalances } from '../components/CapTableBalances';
import { Details } from '../components/Details';
import { JobProgress } from '../components/JobProgress';
import { Loading } from '../components/Loading';
import { useBrok } from '../context/useBrok';
import { DeleteCapTableJobProgressResponse, JobProgressResults } from '../types/brok.types';

var debug = require('debug')('page:CapTableView');

interface Props {}

interface RouteParams {
  address: string;
}

export const CapTableView: React.FC<Props> = ({ ...props }) => {
  const history = useHistory();
  const { address } = useParams<RouteParams>();
  const { getCapTableDetails, deleteCapTable } = useBrok();
  const [capTable, setCapTable] = useState<CapTableDetails>();
  const [error, setError] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobId, setJobId] = useState('');

  useEffect(() => {
    let subscribed = true;
    const doAsync = async () => {
      const res = await getCapTableDetails(address);
      console.log('res', res);
      if (res.isErr()) {
        setError('Kunne ikke hente aksjeeierboken');
        debug(res.error);
      } else if (subscribed) {
        debug(res.value);
        setCapTable(res.value);
      }
    };
    doAsync();
    return () => {
      subscribed = false;
    };
  }, []);

  const onDeleteCapTable = async (capTableAddress: string) => {
    setIsDeleting(true);
    const res = await deleteCapTable(capTableAddress);
    if (res.isErr()) {
      toast(res.error);
    } else {
      debug('res', res);
      setJobId(res.value.id);
    }
  };

  const handleIsDone = (jobResponse: JobProgressResults) => {
    const res = jobResponse as DeleteCapTableJobProgressResponse;
    setIsDeleting(false);
    if (!res.success) {
      toast(res.error);
    } else {
      toast('sletter var velykket');
    }
    history.go(0);
  };

  const getStatusMessageForStatus = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '';
      case 'QUED':
        return 'Advarsel: Denne aksjeeierboken er ikke godkjent av Brønnøysundregistrene. Kontakt selskapet for å få tilgang til selskapets aksjeeierbok';
      case 'DECLINED':
        return 'Advarsel: Denne aksjeeierboken er ikke aktiv';
      case 'REMOVED':
        return 'Advarsel: Denne aksjeeierboken er slettet. Kontakt selskapet for mer informasjon';
      case 'UNKNOWN':
        return 'Advarsel: Denne aksjeeierboken har ukjent status';
      default:
        console.warn('captable status is not defined here. Please investigate', status);
        return '';
    }
  };

  return (
    <Box>
      <Heading level={2}>Aksjeeierboken</Heading>
      {error && (
        <Heading color={'red'} level={4}>
          {error}
        </Heading>
      )}
      {!error && !capTable && <Loading message="Henter aksjeeierboken"></Loading>}
      {!!capTable ? (
        <>
          <Heading level={3}>Nøkkelopplysninger</Heading>

          {capTable.status !== 'APPROVED' ? <Text color={'red'}>{getStatusMessageForStatus(capTable.status)}</Text> : null}

          {jobId && <JobProgress jobIds={[jobId]} onDoneAction={handleIsDone} onDoneButtonText={'Ferdig'} />}

          <Details
            data={{
              controller: capTable.owner,
              name: capTable?.name,
              organizationNumber: capTable.orgnr,
              totalSupply: capTable.totalSupply,
            }}
          />
          {!jobId && (
            <Box pad={{ vertical: 'small' }}>
              {capTable.status === 'APPROVED' ? (
                <Grid columns={['small', 'flex']}>
                  <Text>Slette</Text>
                  <Box justify="start" width={'small'}>
                    <Button title="Slette aksjeeierbok" label="Slett" size="small" onClick={() => onDeleteCapTable(address)}></Button>
                  </Box>
                </Grid>
              ) : null}
            </Box>
          )}
          <CapTableBalances
            balances={capTable.shareholders.flatMap((sh) =>
              sh.balances.map((bal) => {
                return { ...sh, ...bal };
              }),
            )}
            name={capTable.name}
            boardDirectorName={'jens'}
            capTableAddress={address}
          />
        </>
      ) : null}
    </Box>
  );
};
