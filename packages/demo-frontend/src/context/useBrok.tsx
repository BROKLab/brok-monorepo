import {
  CapTableDetails,
  CapTableRegistryResponse,
  CreateCapTableRequestInput,
  OperatorTransferNewShareholderInput,
  ShareholderCeramic,
  TransferInput,
} from '@brok/sdk';
import axios from 'axios';
import { err, ok, Result } from 'neverthrow';
import React, { Dispatch, useContext, useMemo, useState } from 'react';
import {
  CapTableLegacyRespons,
  CreateCapTableResponse,
  DeleteCapTableResponse,
  JobProgressResponse,
  OperatorTransferResponse,
} from '../types/brok.types';
import { handleAxiosError } from '../utils/formatter';
import { useLocalStorage } from '../utils/useLocalstorage';

const REACT_APP_BROK_SERVER = process.env.REACT_APP_BROK_SERVER;
const REACT_APP_USE_LOCAL_ENVIROMENT = process.env.REACT_APP_USE_LOCAL_ENVIROMENT;
var debug = require('debug')('context:brok');
type Props = {
  children?: React.ReactNode;
};
const BrokContext = React.createContext<BrokContextInterface>(undefined!);
type BrokContextInterface = {
  isLoggedIn: boolean;
  createCapTableJobId: string;
  username: string;
  setUsername: Dispatch<string>;
};

export const BrokProvider: React.FC<Props> = ({ ...props }) => {
  const [createCapTableJobId, setCreateCapTableJobId] = useState('');
  const [username, setUsername] = useLocalStorage<string>('username', '');
  const isLoggedIn = useMemo(() => username !== '', [username]);

  const context: BrokContextInterface = {
    isLoggedIn,
    createCapTableJobId,
    username,
    setUsername,
  };
  return <BrokContext.Provider value={context}>{props.children}</BrokContext.Provider>;
};

export const useBrok = () => {
  const context = useContext(BrokContext);

  const createCaptable = async (captable: CreateCapTableRequestInput): Promise<Result<CreateCapTableResponse, string>> => {
    if (!context.isLoggedIn) {
      return err('Logg inn først');
    }
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    debug(`url ${url}`);
    try {
      const res = await axios
        .post<CreateCapTableResponse>(`${url}/captable`, { data: captable, username: context.username })
        .catch(handleAxiosError);
      if (res) return ok(res.data);
    } catch (error) {
      if (typeof error === 'string') return err(error);
      if (error instanceof Error) return err(error.message);
    }
    return err('Ukjent feilmelding');
  };

  const getCapTableDetails = async (capTableAddress: string): Promise<Result<CapTableDetails, string>> => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    // debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    // debug(`url ${url}`);
    try {
      const res = await axios.get<CapTableDetails>(`${url}/captable/${capTableAddress}`, {}).catch(handleAxiosError);
      if (res) return ok(res.data);
    } catch (error) {
      if (error instanceof Error) return err(error.message);
      if (typeof error === 'string') return err(error);
    }
    return err('Ukjent feilmelding');
  };

  const getProgressForJob = async (jobId: string): Promise<Result<JobProgressResponse, string>> => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    // debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    // debug(`url ${url}`);
    try {
      const res = await axios.get<JobProgressResponse>(`${url}/captable/status/${jobId}`, {}).catch(handleAxiosError);
      if (res) return ok(res.data);
    } catch (error) {
      if (error instanceof Error) return err(error.message);
      if (typeof error === 'string') return err(error);
    }
    return err('Ukjent feilmelding');
  };

  const updateShareholderCeramic = async (capTableAddress: string, updated: ShareholderCeramic): Promise<Result<boolean, string>> => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    // debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    // debug(`url ${url}`);
    const res = await axios
      .post<unknown>(`${url}/captable/public/`, { data: updated, capTableAddress: capTableAddress, username: context.username })
      .catch(handleAxiosError);
    if (res) {
      return ok(true);
    } else {
      return err('Ingen data returnert');
    }
  };

  const transferShares = async (
    input: TransferInput | OperatorTransferNewShareholderInput | OperatorTransferNewShareholderInput,
  ): Promise<Result<OperatorTransferResponse, string>> => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    // debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    // debug(`url ${url}`);
    try {
      const res = await axios
        .post<OperatorTransferResponse>(`${url}/captable/transfer/`, { data: input, username: context.username })
        .catch(handleAxiosError);
      console.log('transfer res', res);
      if (res) return ok(res.data);
    } catch (error) {
      console.log('in error', error);
      if (error instanceof Error) return err(error.message);
      if (typeof error === 'string') return err(error);
    }
    return err('Ukjent feilmelding');
  };

  const deleteCapTable = async (capTableAddress: string): Promise<Result<DeleteCapTableResponse, string>> => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    // debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    // debug(`url ${url}`);
    try {
      const res = await axios
        .post<DeleteCapTableResponse>(`${url}/captable/delete/`, { capTableAddress: capTableAddress, username: context.username })
        .catch(handleAxiosError);
      console.log('delete captable res', res);
      if (res) return ok(res.data);
    } catch (error) {
      console.log('in error', error);
      if (error instanceof Error) return err(error.message);
      if (typeof error === 'string') return err(error);
    }
    return err('Ukjent feilmelding');
  };

  const listDeployedCapTables = async (orgnr?: string, name?: string): Promise<Result<CapTableRegistryResponse, string>> => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    try {
      const res = await axios
        .get<CapTableRegistryResponse>(`${url}/captable/list/`, {
          params: {
            orgnr,
            name,
          },
        })
        .catch(handleAxiosError);
      console.log('list captables res', res);
      if (res) return ok(res.data);
    } catch (error) {
      if (error instanceof Error) return err(error.message);
      if (typeof error === 'string') return err(error);
    }
    return err('Ukjent feilmelding');
  };

  const getCaptableLegacy = async (search: string) => {
    const url = REACT_APP_USE_LOCAL_ENVIROMENT === 'true' ? 'http://localhost:3004' : REACT_APP_BROK_SERVER;
    debug(`REACT_APP_USE_LOCAL_ENVIROMENT ${REACT_APP_USE_LOCAL_ENVIROMENT === 'true'} - ${REACT_APP_USE_LOCAL_ENVIROMENT}`);
    debug(`url ${url}`);
    return await axios.get<CapTableLegacyRespons>(`${url}/captable/legacy`, {
      headers: {
        Accept: 'application/json',
      },
      params: {
        query: search,
      },
    });
  };
  return {
    ...context,
    getCaptableLegacy,
    getProgressForJob,
    createCaptable,
    listDeployedCapTables,
    getCapTableDetails,
    updateShareholderCeramic,
    transferShares,
    deleteCapTable,
  };
};
