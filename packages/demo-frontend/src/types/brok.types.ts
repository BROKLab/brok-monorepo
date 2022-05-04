export interface PrivateTokenTransferData {
  address: string;
  amount: string;
  partition: string;
  identifier: string;
  name: string;
  streetAddress: string;
  postalcode: string;
  email: string;
  id?: string;
  isBoardDirector: boolean;
  organizationIdentifier: string
  organizationIdentifierType: OrganizationIdentifierType
}
export type OrganizationIdentifierType = 'OrganizationNumber' | 'EUID' | 'LEI';
export type ROLE = 'BOARD_DIRECTOR' | 'PUBLIC' | 'SHAREHOLDER';

export type CapTableLegacyRespons = OrgData[];

export interface ERC1400TokenTransfer {
  amount: string;
  partition: string;
}
export interface PrivateERC1400TokenTransfer extends ERC1400TokenTransfer {
  identifier: string;
  isBoardDirector: boolean;
  email: string;
  name: string;
  postalcode: string;
  streetAddress: string;
}

export interface Shareholder {
  name: string;
  city: string;
  birthdate: string;
  address: string;
  id: string;
  postcode?: string;
  email?: string;
  identifier?: string;
}

export interface OrgData {
  aksjer: number;
  kapital: number;
  navn: string;
  orgnr: number;
  vedtektsdato: string;
}

export interface JobResponse {
  id: string;
  progress: number;
}

export interface CreateCapTableResponse extends JobResponse {}
export interface OperatorTransferResponse extends JobResponse {}
export interface DeleteCapTableResponse extends JobResponse {}

export type JobProgressResults = CreateCapTableJobProgressResponse | OperatorTransferJobProgressResponse | DeleteCapTableJobProgressResponse;

export interface JobProgressResponse {
  '@uri': string;
  id: string;
  jobStatus: string;
  progress: number;
  name: string;
  result?: JobProgressResults;
}

export type CreateCapTableJobProgressResponse = {
  data: {
    capTableCeramicRes: {
      success: boolean;
      capTableUri: string;
    };
    deployBlockchainRes: {
      capTableAddress: string;
      deployTranscactionHash: string;
    };
  };
  success: boolean;
};

export type OperatorTransferJobProgressResponse = {
  data: {
    transferTransactionHash: string;
    success: boolean;
  };
  success: boolean;
  error?: string;
};

export type DeleteCapTableJobProgressResponse = {
  success: boolean;
  error?: string;
  data: {
    transactionHash: string;
  };
};
