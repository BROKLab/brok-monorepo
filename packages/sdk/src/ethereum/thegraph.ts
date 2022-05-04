import axios, { AxiosResponse } from 'axios';
import { ResultAsync } from 'neverthrow';
import { CapTableGraphQL, CapTableGraphQLTypes, CapTableQueryResponse, CAP_TABLES_QUERY } from './utils/CapTableGraphQL.utils';
import { TokenHolderGraphQL, TokenHoldersGraphQLTypes } from './utils/TokenHoldersGraphQL.utils';

function fetchResultAsync<T>(url: string, queryData: string, errorMapper: (e) => string, variables: any = {}) {
  return ResultAsync.fromPromise(
    axios
      .post<AxiosResponse<T>>(url, {
        query: queryData,
        variables: variables,
      })
      .then((res) => res.data.data),
    (e) => errorMapper(e),
  );
}

export function shareholderForCapTable(url: string, userEthAddress: string, capTableAddress) {
  return fetchResultAsync<TokenHoldersGraphQLTypes.TokenHolderQuery.Response>(url, capTableAddress, (e) => {
    return `Something went wrong when getting shareholder data from thegraph. Error: ${e}`;
  });
}

export function getTokenHolder(url: string, capTableAddress: string) {
  const query = TokenHolderGraphQL.TOKEN_HOLDER_QUERY(capTableAddress);
  return fetchResultAsync<TokenHoldersGraphQLTypes.TokenHolderQuery.Response>(url, query, (e) => {
    return `Something went wrong when getting shareholder data from thegraph. Error: ${e}`;
  }).map((data) => {
    console.log('tokenhi', data);
    return data.tokenHolders.at(0);
  });
}

export function getCapTable(url: string, capTableAddress: string) {
  const query = CapTableGraphQL.CAP_TABLE_QUERY(capTableAddress);
  return fetchResultAsync<CapTableGraphQLTypes.CapTableQuery.Response>(url, query, (e) => {
    return `Something went wrong when getting shareholder data from thegraph. Error: ${e}`;
  });
}

export function listCapTables(url: string, orgnr: string = '', name: string = '') {
  const query = CAP_TABLES_QUERY;
  return fetchResultAsync<CapTableQueryResponse>(
    url,
    query,
    (e) => {
      return 'Something went wrong when getting capTable list';
    },
    { orgnr, name },
  );
}
