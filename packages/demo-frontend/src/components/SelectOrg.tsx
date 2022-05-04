import { AxiosError } from 'axios';
import { Box, Button, Grid, Select, Spinner, Text } from 'grommet';
import { Search } from 'grommet-icons';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useBrok } from '../context/useBrok';
import { OrgData } from '../types/brok.types';
import { formatCurrency } from './../utils/formatter';

var debug = require('debug')('component:SelectOrg');

interface Props {
  onSubmit: (orgData: OrgData) => void;
}

interface FormData {
  org: OrgData | null;
}

interface ApiRespons {
  result: OrgData[];
}

export const DEFAULT_ORG_DATA: OrgData[] = [
  {
    orgnr: 911724758,
    navn: 'BLOCKCHAIN BROKERS AS',
    kapital: 30000,
    aksjer: 200,
    vedtektsdato: '28.02.2018',
  },
  {
    orgnr: 915772137,
    navn: 'BLOCKCHANGERS AS',
    kapital: 40378,
    aksjer: 40378,
    vedtektsdato: '10.12.2018',
  },
  {
    orgnr: 915912028,
    navn: 'BLOCKBONDS AS',
    kapital: 18455512,
    aksjer: 18455512,
    vedtektsdato: '06.12.2019',
  },
  {
    orgnr: 918917160,
    navn: 'BLOCKBRIDGE AS',
    kapital: 30000,
    aksjer: 30000,
    vedtektsdato: '08.05.2017',
  },
  {
    orgnr: 919437235,
    navn: 'BLOCKTRADE AS',
    kapital: 30000,
    aksjer: 30000,
    vedtektsdato: '01.08.2017',
  },
  {
    orgnr: 919526696,
    navn: 'BLOCKCHAIN AS',
    kapital: 30000,
    aksjer: 300000,
    vedtektsdato: '22.08.2017',
  },
  {
    orgnr: 920415296,
    navn: 'BLOCKCHAIN INVEST AS',
    kapital: 30000,
    aksjer: 30000,
    vedtektsdato: '19.04.2018',
  },
  {
    orgnr: 920596908,
    navn: 'BLOCKANDINAVIA AS',
    kapital: 30000,
    aksjer: 300,
    vedtektsdato: '20.02.2018',
  },
  {
    orgnr: 920876501,
    navn: 'BLOCKCHAIN SOLUTIONS AS',
    kapital: 30000,
    aksjer: 200,
    vedtektsdato: '02.05.2018',
  },
  {
    orgnr: 921209347,
    navn: 'CLOCKCHAIN TECHNOLOGY AS',
    kapital: 900000,
    aksjer: 90,
    vedtektsdato: '10.05.2018',
  },
];

export const SelectOrg: React.FC<Props> = ({ ...props }) => {
  const { handleSubmit, watch, control, formState, setError } = useForm<FormData>({
    defaultValues: {
      org: null,
    },
  });
  const [orgList, setOrgList] = useState<OrgData[]>(DEFAULT_ORG_DATA);
  const [isSearchingBrreg, setIsSearchingBrreg] = useState(false);
  const { getCaptableLegacy } = useBrok();
  const orgWatch = watch('org');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        debug(`Search ${searchQuery}`);
        if (!searchQuery) return;
        setIsSearchingBrreg(true);
        const isOrgName = isNaN(+searchQuery);
        const _searchQuery = isOrgName ? searchQuery : searchQuery.replace(/\s/g, '');

        const res = await getCaptableLegacy(_searchQuery).catch((err: AxiosError<ApiRespons>) => {
          throw Error('Søk etter navn ga ingen resultater.');
        });
        if (res.data) {
          setOrgList(res.data);
        } else {
          throw Error(`getCaptableLegacy gave unvalid result`);
        }

        setIsSearchingBrreg(false);
      } catch (error) {
        // setError("org", { message: error.message })
        setOrgList([]);
        setIsSearchingBrreg(false);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      setIsSearchingBrreg(false);
    };
  }, [getCaptableLegacy, searchQuery, setError]);

  const onSubmit = async (data: FormData) => {
    if (!data.org) {
      throw Error('Data not defined.');
    }

    if (props.onSubmit) {
      return props.onSubmit(data.org);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box gap="medium">
          <Box gap="small">
            <Text>Søk</Text>
            <Grid columns={['flex', 'auto']}>
              <Controller
                render={({ field: { value, onChange } }) => (
                  <Select
                    options={orgList}
                    value={value ? value : ''} // TODO - FIX
                    size="small"
                    placeholder="Velg et selskap"
                    emptySearchMessage={isSearchingBrreg ? 'Søker...' : 'Søk etter selskap med navn eller org nr.'}
                    focusIndicator={false}
                    onSearch={(query) => setSearchQuery(query)}
                    labelKey={(option: OrgData) => option.navn + ' | ' + option.orgnr}
                    onChange={({ option }) => onChange(option)}
                    disabled={isSearchingBrreg}
                  />
                )}
                defaultValue={null}
                name="org"
                control={control}
                rules={{ required: true }}
              />

              <Button size="small" icon={isSearchingBrreg ? <Spinner></Spinner> : <Search></Search>}></Button>
            </Grid>

            {orgWatch && !isSearchingBrreg && (
              <Box background="brand" pad="small">
                <Grid columns={['1/3', '2/3']} fill="horizontal" gap="small">
                  <Text size="xsmall">Org nr.</Text>
                  <Text size="small" weight="bold">
                    {orgWatch.orgnr}
                  </Text>

                  <Text size="xsmall">Navn</Text>
                  <Text size="small" weight="bold">
                    {orgWatch.navn}
                  </Text>

                  <Text size="xsmall">Kapital</Text>
                  <Text size="xsmall">{formatCurrency(orgWatch.kapital)}</Text>

                  <Text size="xsmall">Pålydene</Text>
                  <Text size="xsmall">{formatCurrency(orgWatch.kapital / orgWatch.aksjer)}</Text>

                  <Text size="xsmall">Aksjer</Text>
                  <Text size="xsmall">{orgWatch.aksjer}</Text>

                  <Text size="xsmall">Vedtektsdato</Text>
                  <Text size="xsmall">{orgWatch.vedtektsdato}</Text>
                </Grid>
              </Box>
            )}
          </Box>

          {orgWatch && (
            <Button
              type="submit"
              disabled={formState.isSubmitting /* || Object.keys(formState.touched).length === 0 */}
              color="brand"
              label="Velg selskap"
              margin={
                {
                  /* top: "medium" */
                }
              }
              size="large"
            ></Button>
          )}
        </Box>
      </form>
    </Box>
  );
};
