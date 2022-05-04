export type Name = 'Carl' | 'Abe' | 'Ben';

enum IdentifierType {
  OrganizationNumber,
  EUID,
  LEI,
}

export type User = {
  username: string;
  password: string;
  fnr: string;
  name: string;
  email: string;
  postalcode: string;
  birthDate: string;
  countryCode: string;
  ethAddress: string;
  identifier: string;
  identifierType: IdentifierType;
};

export type Selskap = {
  orgnr: string;
  navn: string;
};

export const users: Record<Name, User> = {
  Abe: {
    username: 'abel',
    password: '123',
    fnr: '23128212312',
    name: 'Abe Aber',
    birthDate: '01.02.1988',
    email: 'abe@mail.com',
    postalcode: '1234',
    countryCode: 'no',
    ethAddress: '0x1234',
    identifier: '1234567889',
    identifierType: IdentifierType.OrganizationNumber,
  },
  Carl: {
    username: 'carl12345',
    password: 'passord123',
    fnr: '01016612345',
    name: 'Carl Clay',
    email: 'carl@foodcorp.com',
    birthDate: '09.02.1966',
    postalcode: '1234',
    countryCode: 'no',
    ethAddress: '0x4567',
    identifier: '123456789',
    identifierType: IdentifierType.OrganizationNumber,
  },
  Ben: {
    username: 'benbenny',
    password: 'passord123',
    fnr: '02029812345',
    name: 'Ben',
    email: 'ben@mail.com',
    birthDate: '13.02.1971',
    postalcode: '4412',
    countryCode: 'no',
    ethAddress: '0x6789',
    identifier: '123456789',
    identifierType: IdentifierType.OrganizationNumber,
  },
};

export const selskaper: Selskap[] = [
  {
    navn: 'Matfabrikken AS',
    orgnr: '123456788',
  },
];

export const ceramicShareholdersForCaptableResponse = Object.values(users);

export const capTableQueryResponse = {
  controllers: [],
  id: '0x123',
  minter: '0x123',
  name: 'bedriftsnavn',
  fagsystem: 'fagsystem',
  orgnr: '123456789',
  owner: '0x123',
  partitions: [],
  status: '',
  symbol: 'sym',
  tokenHolders: [
    {
      id: '1',
      address: '0x1234',
      balances: [
        {
          amount: '100',
          id: 'id',
          partition: 'ord',
        },
      ],
    },
    {
      id: '1',
      address: '0x4567',
      balances: [
        {
          amount: '100',
          id: 'id',
          partition: 'ord',
        },
      ],
    },
    {
      id: '1',
      address: '0x6789',
      balances: [
        {
          amount: '200',
          id: 'id',
          partition: 'ord',
        },
      ],
    },
  ],
  totalSupply: '100',
};
