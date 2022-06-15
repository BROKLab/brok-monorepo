import { OperatorTransferExistingShareholderInput, OperatorTransferNewShareholderInput, OrganizationIdentifierType, TransferInput } from '@brok/sdk';
import { Box, Button, CheckBox, DateInput, FormField, Heading, Layer, RadioButtonGroup, TextInput } from 'grommet';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBrok } from '../context/useBrok';
import { JobProgressResults, OperatorTransferJobProgressResponse } from '../types/brok.types';
import { JobProgress } from './JobProgress';

type ToType = 'Privatperson' | 'Bedrift';
var debug = require('debug')('utils:TransferSharesModal');

interface Props {
  capTableAddress: string;
  from: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const TransferSharesModal: React.FC<Props> = ({ ...props }) => {
  const defaultValues = {
    capTableAddress: props.capTableAddress,
    from: props.from,
    to: '',
    amount: 0,
    partition: 'ordinære',
    birthDate: '01-01-2000',
    name: '',
    postalcode: '',
    countryCode: 'NO',
    organizationIdentifier: '',
    organizationIdentifierType: 'OrganizationNumber' as OrganizationIdentifierType,
  };

  const { transferShares } = useBrok();

  const { getValues, control, register } = useForm({ defaultValues });
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const [toNewShareholder, setToNewShareholder] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [toType, setToType] = useState<ToType>('Privatperson');
  const [organizationIdentifierType, setOrganizationIdentifierType] = useState<OrganizationIdentifierType>('OrganizationNumber');
  const [jobId, setJobId] = useState('');

  const handleIsDone = (jobResponse: JobProgressResults) => {
    const res = jobResponse as OperatorTransferJobProgressResponse;
    setIsTransferring(false);
    if (!res.success) {
      toast(res.error);
    } else {
      toast('Overføringen var velykket. Om den ikke er synlig i oversikten. Prøv med en oppdatering av siden');
    }
    navigateBack();
  };

  const navigateBack = async () => {
    const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));
    await delay(1500);
    navigate(-1)
  };

  const handleOnSubmit = async () => {
    const values = getValues();
    setIsTransferring(true);

    let input: TransferInput | OperatorTransferNewShareholderInput | OperatorTransferExistingShareholderInput = {
      from: values.from,
      partition: values.partition,
      amount: values.amount.toString(),
      capTableAddress: values.capTableAddress,
    };

    if (toNewShareholder) {
      input = {
        ...input,
        countryCode: values.countryCode,
        name: values.name,
        postalcode: values.postalcode,
      };

      if (toType === 'Privatperson') {
        input = {
          ...input,
          birthDate: values.birthDate,
        };
      } else {
        input = {
          ...input,
          organizationIdentifier: values.organizationIdentifier,
          organizationIdentifierType: values.organizationIdentifierType,
        };
      }
    } else {
      input = {
        ...input,
        to: values.to,
      };
    }

    const res = await transferShares(input);
    if (res.isErr()) {
      toast(res.error);
    } else {
      debug('res', res);
      setJobId(res.value.id);
    }
    console.log('transfer res', res);
    // TODO this will close modal. Should user do it themselves?
    // props.onConfirm();
  };

  const getLabelForOrgType = () => {
    switch (organizationIdentifierType) {
      case 'OrganizationNumber':
        return 'Organisasjonsnummer';
      case 'LEI':
        return 'LEI nummer';
      case 'EUID':
        return 'EUID numer';
      default:
        return 'Noe er galt. Ta kontakt med support';
    }
  };

  const formDateToIsoString = (date: string) => {
    try {
      const newDate = new Date(date);
      const dateInEpochMilliseconds = newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000 * -1;
      const time = new Date(dateInEpochMilliseconds);
      time.setHours(6);
      return time.toISOString();
    } catch (err) {
      debug('formatDateToString error', err);
    }
  };

  return (
    <Layer onEsc={() => props.onDismiss()} onClickOutside={() => props.onDismiss()} animation="slide" modal position="center">
      <Box margin="large" align="center" width={'xlarge'}>
        <Heading level="3">Overfører aksjer</Heading>
        <Box width={'large'}>
          <CheckBox toggle={true} label="Til ny aksjonær" checked={toNewShareholder} onChange={() => setToNewShareholder(!toNewShareholder)} />

          <FormField name="amount" label="Antall aksjer">
            <TextInput {...register('amount')} type="number" step={1} min={1}></TextInput>
          </FormField>

          <FormField name="from" label="Fra" placeholder={'ethereum addresse'}>
            <TextInput {...register('from')} type="string" placeholder={defaultValues.from}></TextInput>
          </FormField>

          {toNewShareholder ? (
            <Box gap="small">
              <FormField name="name" label="Navn">
                <TextInput {...register('name')} type="string" placeholder={defaultValues.name}></TextInput>
              </FormField>
              <FormField name="countryCode" label="Landskode">
                <TextInput {...register('countryCode')} type="string" placeholder={defaultValues.countryCode}></TextInput>
              </FormField>
              <FormField name="postalcode" label="Postnummer">
                <TextInput {...register('postalcode')} type="number" placeholder={defaultValues.postalcode}></TextInput>
              </FormField>
              <RadioButtonGroup
                name={'Er mottager bedrift eller person?'}
                options={['Privatperson', 'Bedrift']}
                value={toType}
                onChange={(event) => setToType(event.target.value as ToType)}
              />
              <Box style={{ display: toType === 'Privatperson' ? '' : 'none' }}>
                <FormField name="birthDate" label="Født">
                  <Controller
                    {...register('birthDate')}
                    control={control}
                    name="birthDate"
                    render={({ field }) => (
                      <DateInput
                        format="dd.mm.yyyy"
                        type="datetime"
                        ref={field.ref}
                        value={field.value ?? ''}
                        placeholder={defaultValues.birthDate ?? 'Ingen dato satt. Klikk for å velge'}
                        onChange={(date) => {
                          console.log('data', date);
                          field.onChange(formDateToIsoString(date.value as string));
                        }}
                      ></DateInput>
                    )}
                  />
                </FormField>
              </Box>

              <Box style={{ display: toType !== 'Privatperson' ? '' : 'none' }}>
                <Box gap="small">
                  <FormField name="organizationIdentifierType" label="Bedriftsidentifikasjontype">
                    <Controller
                      {...register('organizationIdentifierType')}
                      control={control}
                      name="organizationIdentifierType"
                      render={({ field }) => (
                        <RadioButtonGroup
                          name={'Type bedriftsidentifikasjon'}
                          options={['OrganizationNumber', 'EUID', 'LEI'] as OrganizationIdentifierType[]}
                          ref={field.ref}
                          direction="row"
                          margin={'medium'}
                          value={field.value}
                          onChange={(event) => {
                            field.onChange(event);
                            setOrganizationIdentifierType(event.target.value as OrganizationIdentifierType);
                          }}
                        />
                      )}
                    />
                  </FormField>
                  <FormField name="organizationIdentifier" label={getLabelForOrgType()}>
                    <TextInput {...register('organizationIdentifier')} type="number" placeholder={defaultValues.organizationIdentifier}></TextInput>
                  </FormField>
                </Box>
              </Box>
            </Box>
          ) : (
            <FormField name="to" label="Til" placeholder="ethereum addresse">
              <TextInput {...register('to')} type="string" placeholder={defaultValues.to}></TextInput>
            </FormField>
          )}
        </Box>

        {!jobId && (
          <Box margin="medium" direction="row" gap="medium">
            <Button size="small" label="Lukk" onClick={() => props.onDismiss()} />
            <Button color="black" label={'Send inn'} style={{ borderRadius: '0px' }} onClick={() => handleOnSubmit()}></Button>
          </Box>
        )}
        {jobId && <JobProgress jobIds={[jobId]} onDoneAction={handleIsDone} onDoneButtonText={'Ferdig'} />}
      </Box>
    </Layer>
  );
};
