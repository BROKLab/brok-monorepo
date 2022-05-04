import { Box, Button, Grid, Heading, Paragraph, Spinner, Text } from 'grommet';
import { CaretDown, CaretUp, Checkmark } from 'grommet-icons';
import { validateNorwegianIdNumber } from 'norwegian-national-id-validator';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBrok } from '../context/useBrok';
import { JobProgressResults, OrgData, PrivateTokenTransferData } from '../types/brok.types';
import { useLocalStorage } from '../utils/useLocalstorage';
import { CreateOrgForm } from './CreateOrgForm';
import { JobProgress } from './JobProgress';
import { PrivateTokenTransferForm } from './PrivateTokenTransferForm';
import { SelectOrg } from './SelectOrg';
var debug = require('debug')('page:CreateCapTableForm');

interface Props {}
enum STEP {
  SELECT_COMPANY = 0,
  ISSUE_SHARES = 1,
  CONFIRM = 2,
}

export const CreateCapTableForm: React.FC<Props> = ({ ...props }) => {
  const [step, setStep] = useState(STEP.SELECT_COMPANY); // TEST - ISSUE_SHARES
  const { createCaptable, isLoggedIn } = useBrok();
  const history = useHistory();
  const [resetTokenTransferData, setResetTokenTransferData] = useState(0);
  const [useDefaultPartitions, setUseDefaultPartitions] = useState(true);
  const [orgData, setOrgData] = useState<OrgData>(); // TEST - DEFAULT_ORG_DATA[0]
  const [privateTokenTransfers, setPrivateTokenTransfers] = useState<PrivateTokenTransferData[]>();
  const [jobId, setJobId] = useState('');
  const [deploying, setDeploying] = useState<boolean>(false);
  const [selectOrg, setSelectOrg] = useLocalStorage('selectOrg', 'false');

  const handleOrgData = useCallback(
    (data: OrgData) => {
      setResetTokenTransferData((old) => old + 1);
      setStep(step + 1);
      setOrgData(data);
    },
    [step],
  );
  const handlePrivateTokenTransferData = useCallback(
    (data: PrivateTokenTransferData[]) => {
      debug('handlePrivateTokenTransferData', data);
      setStep(step + 1);
      setPrivateTokenTransfers(data);
    },
    [step],
  );
  const handleCreateCapTable = async () => {
    // 0. Validate input
    if (!orgData) {
      return toast('Du må velge selskap først');
    }
    if (!privateTokenTransfers) {
      return toast('Du må sette aksjonærer først');
    }

    setDeploying(true);

    debug(`creating org`, orgData);
    debug(`creating privateTokenTransfers`, privateTokenTransfers);

    // 1. Create
    const res = await createCaptable({
      name: orgData.navn,
      orgnr: orgData.orgnr.toString(),
      shareholders: privateTokenTransfers.map((ptt) => {
        return {
          ceramic: {
            countryCode: 'NO',
            birthDate: validateNorwegianIdNumber(ptt.identifier) ? ptt.identifier.slice(0, 5) : undefined,
            name: ptt.name,
            postalcode: ptt.postalcode,
            organizationIdentifier: !validateNorwegianIdNumber(ptt.identifier) ? ptt.identifier : undefined,
            organizationIdentifierType: !validateNorwegianIdNumber(ptt.identifier) ? ptt.organizationIdentifierType : undefined,
          },
          blockchain: {
            amount: ptt.amount,
            partition: ptt.partition,
          },
        };
      }),
    });

    if (res.isErr()) {
      toast(res.error);
    } else {
      debug('res', res);
      setJobId(res.value.id);
      setDeploying(false);
    }
    // // 2. Navigate
    // Should instead coming from jobId fetching response
    // if (createCapTableRespone?.data?.) {
    //   history.push('/captable/' + createCapTableRespone.data.capTableAddress);
    // }
  };

  const handleIsDone = (result: JobProgressResults) => {
    console.log('handleIsDone', result);
    if ('deployBlockchainRes' in result.data) {
      history.push(result.data.deployBlockchainRes.capTableAddress);
    }
  };

  return (
    <Box gap="small">
      <Heading onClick={() => setSelectOrg(selectOrg === 'true' ? 'false' : 'true')}>Opprett aksjeeierbok</Heading>
      {!isLoggedIn && <Box>Du er ikke logget inn, logg inn først.</Box>}
      {/* Select organization */}
      <Grid pad={{ vertical: 'small' }} columns={['2/3', '1/3']} onClickCapture={() => setStep(STEP.SELECT_COMPANY)} style={{ cursor: 'pointer' }}>
        <Text>1. Velg selskap</Text>
        <Box align="end">{step === STEP.SELECT_COMPANY ? <CaretUp></CaretUp> : <CaretDown></CaretDown>}</Box>
      </Grid>
      <Box pad="small" style={{ display: step === STEP.SELECT_COMPANY ? '' : 'none' }}>
        {selectOrg === 'true' ? (
          <SelectOrg onSubmit={(orgData) => handleOrgData(orgData)}></SelectOrg>
        ) : (
          <CreateOrgForm onSubmit={(orgData) => handleOrgData(orgData)}></CreateOrgForm>
        )}
      </Box>

      {/* Token issue */}
      <Grid pad={{ vertical: 'small' }} columns={['2/3', '1/3']} onClickCapture={() => setStep(STEP.ISSUE_SHARES)} style={{ cursor: 'pointer' }}>
        <Text>2. Utsted aksjer</Text>
        <Box align="end">{step === STEP.ISSUE_SHARES ? <CaretUp></CaretUp> : <CaretDown></CaretDown>}</Box>
      </Grid>
      <Box pad="medium" style={{ display: step === STEP.ISSUE_SHARES ? '' : 'none' }}>
        <PrivateTokenTransferForm
          submitLabel="Lagre og gå videre"
          multiple
          selectPartiton={useDefaultPartitions ? true : false}
          createPartition={useDefaultPartitions ? false : true}
          requiredTotal={orgData ? orgData.aksjer : undefined}
          onSubmit={handlePrivateTokenTransferData}
          resetForm={resetTokenTransferData}
        >
          <Box gap="small">
            <Grid columns="1" fill="horizontal" gap="small">
              <Text size="small" weight="bold" truncate>
                Har selskapet aksjeklasser?
              </Text>
            </Grid>
            <Box gap="small" direction="row-responsive">
              <Button
                size="small"
                hoverIndicator={false}
                focusIndicator={false}
                label="Ja, legg til aksjeklasser"
                onClick={() => setUseDefaultPartitions(false)}
                style={{
                  fontWeight: !useDefaultPartitions ? 'bold' : 'initial',
                }}
              ></Button>
              <Button
                size="small"
                hoverIndicator={false}
                focusIndicator={false}
                label="Nei, selskapet har kun ordinære aksjer"
                onClick={() => setUseDefaultPartitions(true)}
                style={{
                  fontWeight: useDefaultPartitions ? 'bold' : 'initial',
                }}
              ></Button>
            </Box>
          </Box>
        </PrivateTokenTransferForm>
      </Box>

      {/* Confirm */}
      <Grid
        columns={['2/3', '1/3']}
        pad={{ vertical: 'small' }}
        onClickCapture={() => setStep(STEP.CONFIRM)}
        style={{ cursor: step === STEP.CONFIRM ? 'inherit' : 'pointer' }}
      >
        <Text>3. Bekreft</Text>
        <Box align="end">{step === STEP.ISSUE_SHARES ? <CaretUp></CaretUp> : <CaretDown></CaretDown>}</Box>
      </Grid>
      <Box margin="small" style={{ display: step === STEP.CONFIRM ? '' : 'none' }}>
        <Paragraph fill={true}>
          Kun selskapets <strong>styreleder</strong> kan flytte aksjeeierboken til Brønnøysundregistrene Aksjeeierbok. Når selskapet bruker denne
          løsningen, vil dette være en offisielle aksjeeierboken, og den tidligere aksjeeierboken selskapet er ikke lengre gyldig.
        </Paragraph>

        <Paragraph fill={true}>
          Aksjonærer i selskapet vil kunne sende aksjene sine til andre uten styrets samtykke, og aksjeeierboken vil automatisk oppdateres
          fortløpende.
        </Paragraph>

        <Paragraph>
          <Text weight="bold">Ved å fortsette, bekrefter du følgende:</Text>
        </Paragraph>

        <Paragraph fill={true}>
          <Checkmark size="small"></Checkmark> Jeg er styreleder i selskapet jeg valgte i forrige steg.
        </Paragraph>
        <Paragraph fill={true}>
          <Checkmark size="small"></Checkmark> Jeg er inneforstått med at løsningen ikke automatisk innrapporterer noe til offentlig sektor, og at
          innrapportering forstatt må gjøres som før.
        </Paragraph>
        <Paragraph fill={true}>
          <Checkmark size="small"></Checkmark> Jeg er inneforstått med at løsningen er i Brønnøysundregistrene Sandkasse, som betyr at
          Brønnøysundregistrene kan slutte å drifte løsningen. Det vil da være mulig å laste need aksjeeierboken i csv-format.
        </Paragraph>
        <Paragraph fill={true}>
          <Checkmark size="small"></Checkmark> Jeg er inneforstått med at løsningen er i Brønnøysundregistrene Sandkasse, som betyr at det kan være
          feil i løsningen.
        </Paragraph>
        <Paragraph fill={true}>
          <Checkmark size="small"></Checkmark> Jeg er inneforstått med at aksjeeierboken blir liggende offentlig tilgjengelig på nett.
        </Paragraph>

        {/* <Paragraph fill>Det kreves {totalTransactions + 1} signereing for å opprette dette selskapet, utstede aksjene og godkjenne selskapet hos Brreg. Lommeboken vil forslå signering for deg.</Paragraph> */}
      </Box>

      <Button
        size="large"
        icon={deploying ? <Spinner /> : undefined}
        label={deploying ? 'Migrerer aksjeierbok.....' : 'Opprett aksjeeierbok'}
        disabled={step !== STEP.CONFIRM || !orgData || !privateTokenTransfers || deploying}
        onClick={() => handleCreateCapTable()}
      ></Button>
      {jobId && <JobProgress jobIds={[jobId]} onDoneAction={handleIsDone} onDoneButtonText={'Se akskjeeierbok'} />}
    </Box>
  );
};
