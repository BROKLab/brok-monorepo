/* eslint-disable @typescript-eslint/no-namespace */
export declare namespace CapTableGraphQLTypes {
  export namespace CapTableQuery {
    export interface Balance {
      amount: string;
      id: string;
      partition: string;
    }

    export interface TokenHolder {
      address: string;
      balances: Balance[];
      id: string;
    }

    export interface CapTable {
      controllers: string[];
      id: string;
      minter: string;
      name: string;
      fagsystem: string;
      fagsystemDid: string;
      orgnr: string;
      owner: string;
      partitions: string[];
      status: string;
      symbol: string;
      tokenHolders: TokenHolder[];
      totalSupply: string;
    }

    export interface Response {
      capTable: CapTable;
    }
  }
  export namespace BalancesQuery {
    export interface CapTable {
      partitions: string[];
      totalSupply: string;
      owner: string;
    }

    export interface TokenHolder {
      address: string;
    }

    export interface Balance {
      amount: string;
      capTable: CapTable;
      partition: string;
      tokenHolder: TokenHolder;
    }

    export interface Response {
      balances: Balance[];
    }
  }
}

export class CapTableGraphQL {
  static CAP_TABLE_QUERY(address: string) {
    return `{
      capTable(id: "${address.toLowerCase()}") {
          id
          name
          orgnr
          fagsystem
          symbol
          status
          partitions
          owner
          minter
          controllers
          totalSupply
          fagsystemDid
          tokenHolders {
            id
            address
            balances {
              id
              amount
              partition
            }
          }
        }
    }`;
  }
  static BALANCES_QUERY(address: string) {
    return `
    {
        balances(where: {capTable: "${address.toLowerCase()}", amount_gt: 0}) {
          amount
          partition
          tokenHolder {
            address
          }
          capTable {
            totalSupply
            owner
            partitions
          }
        }
      }
      `;
  }
}

export const CAP_TABLES_QUERY = `
query MyQuery($name: String, $orgnr: String) {
  capTables(where: {
    name_contains_nocase: $name, 
    orgnr_contains_nocase: $orgnr
  }) {
    name
    orgnr
    status
    id
  }
}
`;

export type CapTableQueryResponse = {
  capTables: CapTable[];
};

export type CapTable = {
  name: string;
  orgnr: string;
  id: string;
  status: string;
};
