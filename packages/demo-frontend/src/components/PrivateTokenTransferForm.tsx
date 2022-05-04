import { yupResolver } from '@hookform/resolvers/yup';
import { BytesLike, ethers } from 'ethers';
import { Box, Button, Grid, Select, Text, TextInput } from 'grommet';
import { Trash } from 'grommet-icons';
import { validateNorwegianIdNumber } from 'norwegian-national-id-validator';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { PrivateTokenTransferData } from '../types/brok.types';
import { validateEmail } from '../utils/validator';
import { DEFAULT_CAPTABLE_PARTITION } from './../context/defaults';
var debug = require('debug')('component:PrivateTokenTransferForm');
const postalCodes = require('norway-postal-codes');

type PropsSingel = {
  children?: React.ReactNode;
  onSubmit: (batchIssueData: PrivateTokenTransferData) => void;
  resetForm?: number;
  submitLabel?: string;
  multiple?: never;
  createPartition?: boolean;
  selectPartiton?: boolean;
  requiredTotal?: number;
};
type PropsMultiple = {
  children?: React.ReactNode;
  onSubmit: (batchIssueData: PrivateTokenTransferData[]) => void;
  resetForm?: number;
  submitLabel?: string;
  multiple: true;
  createPartition?: boolean;
  selectPartiton?: boolean;
  requiredTotal?: number;
};
type Props = PropsSingel | PropsMultiple;

const defaultValues: Record<string, PrivateTokenTransferData[]> = {
  test: [
    {
      identifier: '11126138727',
      address: '',
      amount: '30000',
      partition: DEFAULT_CAPTABLE_PARTITION,
      name: 'Robin Testesen',
      streetAddress: 'Testveien 55',
      postalcode: '0654',
      email: 'rob@test.com',
      isBoardDirector: false,
      organizationIdentifier: '',
      organizationIdentifierType: 'OrganizationNumber',
    },
  ],
  production: [
    // {
    //     identifier: "",
    //     address: "",
    //     amount: "0",
    //     partition: DEFAULT_CAPTABLE_PARTITION,
    //     name: "",
    //     streetAddress: "",
    //     postalcode: "",
    //     email: "",
    //     isBoardDirector: true,
    // },
    {
      identifier: '',
      address: '',
      amount: '0',
      partition: DEFAULT_CAPTABLE_PARTITION,
      name: '',
      streetAddress: '',
      postalcode: '',
      email: '',
      isBoardDirector: false,
      organizationIdentifier: '',
      organizationIdentifierType: 'OrganizationNumber',
    },
  ],
};

const formSchema = {
  identifier: yup.string().required('Fødselsnummerer / Orgnr er påkrevd'),
  amount: yup.string().required('Antall aksjer er påkrevd').min(1, 'Må være 1 eller flere aksjer'),
  partition: yup.string().required('partition required'),
  name: yup.string().required('Navn er påkrevd felt').min(1, 'For kort navn'),
  streetAddress: yup.string().required('Veiaddresse er påkrevd felt').min(3, 'Ugyldig. Må være lengre enn 2').max(255, 'For langt'),
  postalcode: yup
    .string()
    .test('Ikke gyldig postkode', 'ikke gyldig postkode', (value) => postalCodes[value ?? ''] !== undefined)
    .required('postalcode required'),
  email: yup.string().test('Ikke gyldig epost', 'Ikke gyldig epost', (value) => validateEmail(value ?? '') === true),
  isBoardDirector: yup.boolean(),
};

const enviroment = process.env.NODE_ENV === 'development' ? 'test' : 'production';

const fieldsSchema = yup.object().shape({
  [enviroment]: yup.array().of(yup.object().shape(formSchema)),
});

export const PrivateTokenTransferForm: React.FC<Props> = ({ ...props }) => {
  const { control, watch, register, setValue, formState, reset } = useForm({
    resolver: yupResolver(fieldsSchema),
    mode: 'onChange',
    defaultValues,
  });

  const { fields, append, remove, prepend } = useFieldArray({
    control,
    name: enviroment,
  });
  const watchFieldArray = watch(enviroment);
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    };
  });
  const [partitions, setPartitions] = useState<BytesLike[]>([DEFAULT_CAPTABLE_PARTITION]);
  const [newPartition, setNewPartition] = useState('');

  useEffect(() => {
    debug('reset', props.resetForm);
    if (props.resetForm) {
      reset();
    }
  }, [props.resetForm, reset]);

  const handleOnSubmit = () => {
    if (props.requiredTotal) {
      const total = controlledFields.reduce((prev: number, curr: PrivateTokenTransferData) => {
        return prev + parseInt(curr.amount);
      }, 0);
      // if (total !== props.requiredTotal) {
      //   console.log('total', total, props.requiredTotal);
      //   toast(`Required total shares is ${props.requiredTotal}, but only assigning ${total}. Add ${props.requiredTotal - total}`);
      //   return;
      // }
    }
    if (props.multiple) {
      props.onSubmit(controlledFields);
    } else {
      props.onSubmit(controlledFields[0]);
    }
  };

  const checkForAddress = (identifier: string, index: number) => {
    if (identifier.substr(0, 2) === '0x') {
      if (ethers.utils.isAddress(identifier)) {
        console.log('Is address');
        setValue(`${enviroment}.${index}.address`, identifier);
      }
    }
  };

  const handleNewPartition = () => {
    if (partitions.indexOf(newPartition) === -1) {
      setPartitions((old) => [...old, ...[ethers.utils.formatBytes32String(newPartition)]]);
      setNewPartition('');
    }
  };

  const hasAddress = (index: number) => {
    if (controlledFields[index].address.substr(0, 2) === '0x') {
      if (ethers.utils.isAddress(controlledFields[index].address)) {
        return true;
      }
    }
    return false;
  };

  const columsCount = () => {
    let count = 8;
    if (props.selectPartiton) count++;
    if (props.multiple) count++;
    return count;
  };
  const testW = watch('organizationIdentifierType');
  useEffect(() => {
    debug('testW', testW);
  }, []);

  return (
    <Box gap="medium" width="large">
      {props.children}
      {props.createPartition && (
        <Box gap="small" elevation="medium" pad="small">
          <Grid columns={['medium', 'small']}>
            <TextInput
              size="small"
              value={newPartition}
              onChange={(e) => setNewPartition(e.target.value)}
              placeholder="Navn på partisjon feks. a-aksje"
            ></TextInput>
            <Button size="small" label="Foreslå partisjon" onClick={() => handleNewPartition()}></Button>
          </Grid>
          <Text size="xsmall">*Partisjoner blir først opprettet når du utsteder en aksje på den.</Text>
        </Box>
      )}

      <Box gap="small">
        <Grid columns={{ count: columsCount(), size: 'xsmall' }} gap="small">
          <Text size="small" weight="bold" truncate={'tip'}>
            Fnr / Orgnr
          </Text>
          <Text size="small" weight="bold" truncate={'tip'}>
            Bedriftsidentifikasjontype
          </Text>
          <Text size="small" weight="bold" truncate>
            Navn
          </Text>
          <Text size="small" weight="bold" truncate>
            Veiadresse
          </Text>
          <Text size="small" weight="bold" truncate>
            Postnummer
          </Text>
          <Text size="small" weight="bold" truncate>
            Epost
          </Text>
          <Text size="small" weight="bold" truncate>
            Antall aksjer
          </Text>
          <Text style={{ display: props.selectPartiton ? 'none' : 'inherit' }} size="small" weight="bold" truncate>
            Partisjon
          </Text>
          <Text style={{ display: props.multiple ? 'inherit' : 'none' }} size="small" weight="bold" truncate>
            Handlinger
          </Text>
        </Grid>

        {controlledFields.map((field, index) => (
          <Grid columns={{ count: columsCount(), size: 'xsmall' }} gap="small" key={field.id}>
            <Box>
              <TextInput
                {...register(`${enviroment}.${index}.identifier` as const)}
                onBlur={() => checkForAddress(field.identifier, index)}
                disabled={field.isBoardDirector}
                placeholder={field.isBoardDirector ? 'Styreleder' : 'Fødselsnummer'}
                size="small"
              ></TextInput>
              {formState.errors?.[enviroment]?.[index]?.identifier && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.identifier?.message}
                </Text>
              )}
            </Box>
            <Box>
              <Select
                disabled={validateNorwegianIdNumber(field.identifier)}
                options={['OrganizationNumber', 'EUID', 'LEI']}
                {...register(`${enviroment}.${index}.organizationIdentifierType` as const)}
                onChange={({ option }) => {
                  debug(option);
                  setValue(`${enviroment}.${index}.organizationIdentifierType` as const, option);
                }}
              ></Select>
              {formState.errors?.[enviroment]?.[index]?.organizationIdentifierType && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.identifier?.message}
                </Text>
              )}
            </Box>
            <Box>
              <TextInput
                {...register(`${enviroment}.${index}.name` as const)}
                disabled={field.isBoardDirector || hasAddress(index)}
                placeholder={field.isBoardDirector ? 'Hentes automatisk' : 'Navn'}
                size="small"
              ></TextInput>
              {formState.errors?.[enviroment]?.[index]?.name && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.name?.message}
                </Text>
              )}
            </Box>
            <Box>
              <TextInput
                {...register(`${enviroment}.${index}.streetAddress` as const)}
                disabled={hasAddress(index)}
                placeholder={'Veiadresse'}
                size="small"
              ></TextInput>
              {formState.errors?.[enviroment]?.[index]?.streetAddress && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.streetAddress?.message}
                </Text>
              )}
            </Box>
            <Box>
              <TextInput
                {...register(`${enviroment}.${index}.postalcode` as const)}
                disabled={hasAddress(index)}
                placeholder={'Postnummer'}
                size="small"
              ></TextInput>
              {formState.errors?.[enviroment]?.[index]?.postalcode && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.postalcode?.message}
                </Text>
              )}
            </Box>
            <Box>
              <TextInput
                {...register(`${enviroment}.${index}.email` as const)}
                disabled={hasAddress(index)}
                placeholder={'Epost'}
                size="small"
              ></TextInput>
              {formState.errors?.[enviroment]?.[index]?.email && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.email?.message}
                </Text>
              )}
            </Box>
            <Box>
              <TextInput {...register(`${enviroment}.${index}.amount` as const)} type="number" placeholder={'Antall'} size="small"></TextInput>
              {formState.errors?.[enviroment]?.[index]?.amount && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.amount?.message}
                </Text>
              )}
            </Box>
            <Box style={{ display: props.selectPartiton ? 'none' : 'inherit' }}>
              <Select
                {...register(`${enviroment}.${index}.partition` as const)}
                options={partitions}
                size="small"
                alignSelf="start"
                labelKey={(option) => ethers.utils.parseBytes32String(option)}
                emptySearchMessage={'Foreslå en partisjon ovenfor'}
                onChange={({ option }) => {
                  setValue(`${enviroment}.${index}.partition`, option);
                  return option;
                }}
              ></Select>
              {formState.errors?.[enviroment]?.[index]?.partition && (
                <Text color="red" size="xsmall">
                  {formState.errors?.[enviroment]?.[index]?.partition?.message}
                </Text>
              )}
            </Box>
            <Box style={{ display: props.multiple ? 'inherit' : 'none' }}>
              <Button onClick={() => remove(index)} disabled={field.isBoardDirector} icon={<Trash color="red"></Trash>}></Button>
            </Box>
          </Grid>
        ))}

        <Box gap="small" alignSelf="end" direction="row-responsive" align="end">
          {props.multiple && (
            <Button
              color="black"
              label="Legg til person"
              onClick={() => append(defaultValues[enviroment][0])}
              style={{ borderRadius: '0px' }}
            ></Button>
          )}
          <Button
            color="black"
            disabled={formState.errors?.[enviroment]?.length > 0}
            label={!!props.submitLabel ? props.submitLabel : 'Send inn'}
            style={{ borderRadius: '0px' }}
            // {...props.onSubmitButtonProps}
            onClick={() => handleOnSubmit()}
          ></Button>
        </Box>
      </Box>
    </Box>
  );
};
