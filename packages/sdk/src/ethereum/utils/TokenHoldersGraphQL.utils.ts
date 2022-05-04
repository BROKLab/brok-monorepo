export declare module TokenHoldersGraphQLTypes {
    export module TokenHolderQuery {
        export interface CapTable {
            //address of captable
            id: string;
            name: string;
        }

        export interface Balance {
            amount: string;
            capTable: CapTable;
            id: string;
            partition: string;
        }

        export interface TokenHolder {
            address: string;
            balances: Balance[];
            id: string;
        }

        export interface Response {
            tokenHolders: TokenHolder[];
        }
    }
}

export class TokenHolderGraphQL {
    static TOKEN_HOLDER_QUERY(address: string) {
        return `
        {
      tokenHolders(where: {
          address: "${address.toLowerCase()}"
      }) {
        id
        balances {
          capTable {
            id
            name
          }
          amount
          partition
        }
        address
        }
    }`;
    }
}
