/* eslint-disable @typescript-eslint/no-namespace */

export interface BalanceGraphQL {
  amount: string;
  id: string;
  partition: string;
}

export interface TokenHolderGraphQL {
  address: string;
  balances: BalanceGraphQL[];
  id: string;
}

export interface CapTableGraphQL {
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
  tokenHolders: TokenHolderGraphQL[];
  totalSupply: string;
}

export interface CapTableQuery {
  capTable: CapTableGraphQL;
}

export interface BalancesQuery {
  balances: BalanceGraphQL[];
  tokenHolder: {
    address: string;
  };
  capTable: {
    totalSupply: string;
    owner: string;
    partitions: string[];
  };
}

export interface ListQuery {
  capTables: CapTableGraphQL[];
}

export class GraphQLQueries {
  static CAP_TABLE(address: string, status = 'APPROVED') {
    return `{
      capTable(id: "${address.toLowerCase()}", where: {status: "${status}"}) {
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
  static BALANCES(address: string) {
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
  static LIST(skip = 0, limit = 10, status = 'APPROVED') {
    return `{
      capTables(skip: ${skip.toString()}, first: ${limit.toString()}, where: {status: "${status}"}) {
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
}
