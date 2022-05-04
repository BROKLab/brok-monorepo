import { Box, Button, Grid, MaskedInput, Text, TextInput } from 'grommet';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OrgData } from '../types/brok.types';

interface Props {
  onSubmit: (orgData: OrgData) => void;
}

type FormData = OrgData;

var debug = require('debug')('component:CreateOrgForm');

export const CreateOrgForm: React.FC<Props> = ({ ...props }) => {
  const enviroment = process.env.NODE_ENV === 'development' ? 'test' : 'production';
  const isTest = enviroment !== 'production';
  const {
    control,
    handleSubmit,
    getValues,
    watch,
    register,
    setValue,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      aksjer: isTest ? 100 : 0,
      kapital: isTest ? 30000 : 0,
      navn: isTest ? 'Firma AS' : '',
      orgnr: isTest ? 999888777 : 0,
      vedtektsdato: isTest ? '30.01.1988' : '',
    },
  });
  const onSubmit = handleSubmit(async () => {
    const values = getValues();
    debug('onSubmit', values);
    props.onSubmit(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <Box gap="small">
        <Grid columns={['small', 'medium']} align="center">
          <Text>Aksjer</Text>
          <Box>
            <Controller
              render={({ field }) => <TextInput {...field} type="number" size="small" onChange={(e) => field.onChange(e.target.valueAsNumber)} />}
              name="aksjer"
              control={control}
              rules={{ required: true }}
            />
          </Box>
        </Grid>
        <Grid columns={['small', 'medium', 'xsmall']} align="center">
          <Text>Kapital</Text>
          <Box>
            <Controller
              render={({ field }) => <TextInput {...field} type="number" size="small" onChange={(e) => field.onChange(e.target.valueAsNumber)} />}
              name="kapital"
              control={control}
              rules={{ required: true }}
            />
          </Box>
        </Grid>
        <Grid columns={['small', 'medium', 'xsmall']} align="center">
          <Text>Navn</Text>
          <Box>
            <Controller
              render={({ field }) => <TextInput {...field} size="small" onChange={(e) => field.onChange(e.target.value)} />}
              name="navn"
              control={control}
              rules={{ required: true }}
            />
          </Box>
        </Grid>
        <Grid columns={['small', 'medium', 'xsmall']} align="center">
          <Text>Orgnr</Text>
          <Box>
            <Controller
              render={({ field }) => <TextInput {...field} type="number" size="small" onChange={(e) => field.onChange(e.target.value)} />}
              name="orgnr"
              control={control}
              rules={{ required: true }}
            />
          </Box>
        </Grid>
        <Grid columns={['small', 'medium', 'xsmall']} align="center">
          <Text>Vedteksdato</Text>
          <Box>
            <Controller
              render={({ field: { value, onChange } }) => (
                <MaskedInput
                  size="small"
                  mask={[
                    {
                      length: [1, 2],
                      options: Array.from(
                        {
                          length: 31,
                        },
                        (v, k) => k + 1,
                      ),
                      regexp: /^[1-2][0-9]$|^3[0-1]$|^0?[1-9]$|^0$/,
                      placeholder: 'dd',
                    },
                    { fixed: '.' },
                    {
                      length: [1, 2],
                      options: Array.from({ length: 12 }, (v, k) => k + 1),
                      regexp: /^1[0,1-2]$|^0?[1-9]$|^0$/,
                      placeholder: 'mm',
                    },
                    { fixed: '.' },
                    {
                      length: 4,
                      options: Array.from({ length: 100 }, (v, k) => 2019 - k),
                      regexp: /^[1-2]$|^19$|^20$|^19[0-9]$|^20[0-9]$|^19[0-9][0-9]$|^20[0-9][0-9]$/,
                      placeholder: 'yyyy',
                    },
                  ]}
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                />
              )}
              name="vedtektsdato"
              control={control}
              rules={{ required: true }}
            />
          </Box>
        </Grid>
        <Button
          margin={{ top: 'medium' }}
          fill="horizontal"
          size="small"
          type="submit"
          label={isSubmitting ? 'Lagrer...' : 'Lagre'}
          disabled={isSubmitting && isDirty}
        />
      </Box>
    </form>
  );
};
