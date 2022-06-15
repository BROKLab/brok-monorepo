import axios, { AxiosResponse } from "axios";
import { err, ok, Result, ResultAsync } from "neverthrow";
import {
  CapTableGraphQL,
  CapTableGraphQLTypes,
  CapTableQueryResponse,
  CAP_TABLES_QUERY,
} from "./utils/CapTableGraphQL.utils";
import {
  TokenHolderGraphQL,
  TokenHoldersGraphQLTypes,
} from "./utils/TokenHoldersGraphQL.utils";
const debug = require('debug')('brok:sdk:thegraph');

function fetchResultAsync<T>(
  url: string,
  queryData: string,
  errorMapper: (e) => string,
  variables: any = {},
) {
  return ResultAsync.fromPromise(
    axios.post<AxiosResponse<T>>(
      url,
      {
        query: queryData,
        variables: variables,
      },
    ).then((res) => res.data.data),
    (e) => errorMapper(e),
  );
}

export function shareholderForCapTable(
  url: string,
  userEthAddress: string,
  capTableAddress,
) {
  return fetchResultAsync<TokenHoldersGraphQLTypes.TokenHolderQuery.Response>(
    url,
    capTableAddress,
    (e) => {
      return `Something went wrong when getting shareholder data from thegraph. Error: ${e}`;
    },
  );
}

export function getTokenHolder(url: string, capTableAddress: string) {
  const query = TokenHolderGraphQL.TOKEN_HOLDER_QUERY(capTableAddress);
  return fetchResultAsync<TokenHoldersGraphQLTypes.TokenHolderQuery.Response>(
    url,
    query,
    (e) => {
      return `Something went wrong when getting shareholder data from thegraph. Error: ${e}`;
    },
  ).map((data) => {
    console.log("tokenhi", data);
    return data.tokenHolders.at(0);
  },);
}

export async function getCapTable(url: string, capTableAddress: string) : Promise<Result<CapTableGraphQLTypes.CapTableQuery.CapTable, string>> {
  try {
    const query = CapTableGraphQL.CAP_TABLE_QUERY(capTableAddress);
    const res = await axios.post<AxiosResponse<CapTableGraphQLTypes.CapTableQuery.Response>>(
      url,
      {
        query: query,
      },
    );
    if (res.data.data) {
      return ok(res.data.data.capTable);
    }
    debug("invalid response from theGraph", res.data)
    throw new Error("Invalid response from thegraph");
  } catch (error) {
    debug("getCapTable failed with error:", error.message);
    return err(error.message);
  }
}

export function listCapTables(url: string, orgnr = "", name = "") {
  const query = CAP_TABLES_QUERY;
  return fetchResultAsync<CapTableQueryResponse>(
    url,
    query,
    (e) => {
      return "Something went wrong when getting capTable list";
    },
    { orgnr, name },
  );
}
