import { CreateCapTableRequestInput } from '@brok/sdk';
import { JobStatus } from 'bull';
import {
  OperatorTransferNewShareholderInput,
  OperatorTransferExistingShareholderInput,
} from '@brok/sdk';

export interface CreateCapTableWithBoardDirectorAddress {
  capTableInput: CreateCapTableRequestInput;
  loggedInUserAddress: string;
}

export interface TransferWithLoggedInUser {
  loggedInUserAddress: string;
  transfer:
    | OperatorTransferNewShareholderInput
    | OperatorTransferExistingShareholderInput;
}

export interface JobStatusRes {
  '@uri': string;
  id: string;
  name?: string;
  jobStatus: JobStatus | 'stuck';
  progress: number;
  result?: string;
}

export interface JobResult {
  success: boolean;
  capTableAddress?: string;
  message?: string;
}
