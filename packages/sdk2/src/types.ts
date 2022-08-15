// Operative types

export type CreateCapTableInput = Organisation & {
  shareholders: (ShareholderIndetifier & (ShareholderOrganization | ShareholderPerson) & PartitionAmount)[];
};

export type CapTable = Organisation & {
  shareholders: (ShareholderIndetifier & EthereumIdentifier & (ShareholderOrganization | ShareholderPerson) & ShareholderBalances)[];
};
// Models

export type Organisation = {
  orgnr: string;
  name: string;
};
export type ShareholderWithBalances = (ShareholderIndetifier &
  EthereumIdentifier &
  (ShareholderOrganization | ShareholderPerson) &
  ShareholderBalances)[];

export type Shareholder = ShareholderIndetifier & EthereumIdentifier & (ShareholderOrganization | ShareholderPerson);

export type ShareholderIndetifier = {
  name: string; // Personens fulle navn eller selskapsnavn
  postalcode: string;
  countryCode: string;
};

export type ShareholderOrganization = {
  organizationIdentifier: string; // Selskapets unike identifikator
  organizationIdentifierType: 'OrganizationNumber' | 'EUID' | 'LEI';
};

export type ShareholderPerson = {
  birthDate: string; // Fylles kun ut for personer
};

export type ShareholderBalances = {
  balances: PartitionAmount[];
};
export type Balance = EthereumIdentifier & PartitionAmount;
export type PartitionAmount = {
  amount: string;
  partition: string;
};

export type EthereumIdentifier = {
  ethAddress: EthereumAddress;
};

export type CapTableEthereumId = EthereumAddress;
export type ShareholderEthereumId = EthereumAddress;
export type EthereumAddress = string;

export type CeramicId = string;
export type CapTableCeramic = Organisation & {
  shareholderEthToCeramic: Record<EthereumAddress, CeramicId>;
};
