import { ShareholderCeramic } from '@brok/sdk';
import { Box, Button, DateInput, FormField, Heading, Layer, TextInput } from 'grommet';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useBrok } from '../context/useBrok';
import { Loading } from './Loading';

var debug = require('debug')('utils:EditShareholderModal');

interface Props {
  updateShareholderData: ShareholderCeramic;
  capTableAddress: string;
  onFinished: () => void;
  onDismiss: () => void;
}

export const EditShareholderModal: React.FC<Props> = ({ ...props }) => {
  const defaultValues = props.updateShareholderData;
  const [loading, setLoading] = useState(false);
  const { updateShareholderCeramic } = useBrok();
  const { getValues, control, register } = useForm({ defaultValues });

  const handleOnSubmit = async () => {
    // e.preventDefault();
    // setLoading(true);
    const birthDate = getValues().birthDate;

    let updated: ShareholderCeramic;
    if (birthDate !== undefined && birthDate !== null) {
      updated = {
        ...getValues(),
        birthDate: birthDate,
      };
    } else {
      updated = {
        ...getValues(),
      };
    }

    try {
      const res = await updateShareholderCeramic(props.capTableAddress, updated);
      setLoading(false);
      props.onFinished();
    } catch (err) {
      if (err instanceof Error) {
        console.log('received error:', err);
        toast(err.message as string, { type: 'error' });
      }
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
      <Box margin="large" align="center">
        <Heading level="3">Rediger informasjon</Heading>
        {loading ? <Loading message="Venter på oppdatering" /> : null}
        <Box>
          <FormField name="name" label="Navn">
            <TextInput {...register('name')} type="string" placeholder={defaultValues.name}></TextInput>
          </FormField>
          <FormField name="birthDate" label="Født">
            <Controller
              {...register('birthDate')}
              control={control}
              name="birthDate"
              render={({ field }) => (
                <DateInput
                  format="dd.mm.yyyy"
                  type="datetime"
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
          <FormField name="postalcode" label="Postkode">
            <TextInput {...register('postalcode')} type="number" placeholder={defaultValues.postalcode}></TextInput>
          </FormField>
          <FormField name="countryCode" label="Landskode">
            <TextInput {...register('countryCode')} type="string" placeholder={defaultValues.countryCode}></TextInput>
          </FormField>
          <FormField name="ethAddress" label="Ethereum addresse">
            <TextInput {...register('ethAddress')} type="string" disabled={true} placeholder={defaultValues.ethAddress}></TextInput>
          </FormField>
        </Box>

        <Box margin="medium" direction="row" gap="medium">
          <Button size="small" label="Lukk" onClick={() => props.onDismiss()} />
          <Button color="black" label={'Send inn'} style={{ borderRadius: '0px' }} onClick={() => handleOnSubmit()}></Button>
        </Box>
      </Box>
    </Layer>
  );
};
