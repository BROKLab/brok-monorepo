import { CapTableGraphQLTypes, CapTableQueryResponse } from './ethereum/utils/CapTableGraphQL.utils';

export type Organisation = {};
export type CapTable = {};
export type TransactionHash = {};

export type OrganizationIdentifierType = 'OrganizationNumber' | 'EUID' | 'LEI';

export type CapTableRegistryResponse = CapTableQueryResponse;

export type ShareholderUnion = ShareholderCeramic & { balances: CapTableGraphQLTypes.CapTableQuery.Balance[] };

export type CapTableDetails = {
  name: string;
  orgnr: string;
  totalSupply: string;
  status: string;
  owner: string;
  shareholders: ShareholderUnion[];
};

// Handled by BRØK. Immutable blockchain data. No personal info!
export interface ShareholderBlockchain {
  ethAddress?: string;
  amount: string;
  partition: string;
}

// Handled by BRØK. Stored in mutable "blockchain"
export type ShareholderCeramic = {
  name: string; // Personens fulle navn eller selskapsnavn
  birthDate?: string; // Fylles kun ut for personer
  postalcode: string;
  countryCode: string;
  ethAddress: string;
  organizationIdentifier?: string; // Selskapets unike identifikator
  organizationIdentifierType?: OrganizationIdentifierType;
};

export type Shareholder = {
  ceramic: ShareholderCeramic;
  blockchain: ShareholderBlockchain;
};

export type ShareholderRequest = {
  ceramic: Omit<ShareholderCeramic, 'ethAddress'>;
  blockchain: Omit<ShareholderBlockchain, 'ethAddress'>;
};

export type CreateCapTableRequestInput = {
  shareholders: ShareholderRequest[];
  orgnr: string;
  name: string;
};

export type CreateCapTableInput = {
  shareholders: Shareholder[];
  orgnr: string;
  name: string;
};

export type CeramicUriAndEthAddress = {
  ethAddress: string;
  ceramicUri: string;
};

export type CapTableCeramic = {
  orgnr: string;
  name: string;
  shareholdersEthAddressToCeramicUri: Record<string, string>;
};

export type TransferInput = {
  capTableAddress: string;
  from: string;
  amount: string;
  partition: string;
};

export type OperatorTransferNewShareholderInput = TransferInput & {
  name: string; // Personens fulle navn eller selskapsnavn
  birthDate?: string; // Fylles kun ut for personer
  postalcode: string;
  countryCode: string;
  organizationIdentifier?: string; // Selskapets unike identifikator
  organizationIdentifierType?: OrganizationIdentifierType;
};

export type OperatorTransferExistingShareholderInput = TransferInput & {
  to: string;
};

export type BlockchainOperationResponse = {
  success: boolean;
  transactionHash: string;
};
