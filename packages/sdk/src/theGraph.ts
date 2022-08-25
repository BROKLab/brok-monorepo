import debug from 'debug';
import { err, ok, Result } from 'neverthrow';
import fetch from 'cross-fetch'; // REVIEW - Only works if a exclude this, else i would get this issue https://github.com/vercel/next.js/discussions/33982
import { GraphQLQueries, CapTableGraphQL, CapTableQuery, ListQuery } from './utils/CapTableGraphQL.utils.js';

const log = debug('brok:sdk:thegraph');

export async function getCapTableGraph(url: string, capTableAddress: string): Promise<Result<CapTableGraphQL, string>> {
  try {
    const sleep = (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };
    const getData = async () => {
      const query = GraphQLQueries.CAP_TABLE(capTableAddress);
      const getJson = async () => {
        const res = await fetch(url, {
          method: 'post',
          body: JSON.stringify({
            query: query,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
        return await res.json();
      };
      let json = await getJson();
      if (json.data && 'capTable' in json.data && json.data.capTable.status === 'APPROVED') {
        return json as { data: CapTableQuery };
      }
      log('json.data', json.data);
      await sleep(2000);
      debug('CapTable status NOT approved, sleeping 2 seconds and will try again');
      json = await getJson();
      if (json.data && 'capTable' in json.data && json.data.capTable.status === 'APPROVED') {
        return json as { data: CapTableQuery };
      }
      log('json.data', json.data);
      await sleep(3000);
      debug('CapTable status NOT approved, sleeping 3 seconds and will try again');
      json = await getJson();
      if (json.data && 'capTable' in json.data && json.data.capTable.status === 'APPROVED') {
        return json as { data: CapTableQuery };
      }
      log('json.data', json.data);
      if (json.data && 'capTable' in json.data && json.data.capTable.status) {
        throw new Error('CapTable is not approved on the graph, status is ' + json.data.capTable.status);
      }
      log('json.data', json.data);
      throw new Error('Could not find cap table data on the graph');
    };

    const data = await getData();
    log('got data', data);
    if ('data' in data && 'capTable' in data.data) {
      return ok(data.data.capTable);
    }
    debug('brok:sdk:thegraph')('invalid data from theGraph', data);
    return err(`Could not get capTable with address: ${capTableAddress} from theGraph`);
  } catch (e) {
    debug('brok:sdk:thegraph')('invalid response from theGraph', e);
    return err('Could not get capTable from theGraph');
  }
}

export async function getCapTableListGraph(url: string, skip?: number, limit?: number): Promise<Result<CapTableGraphQL[], string>> {
  try {
    const getData = async () => {
      const query = GraphQLQueries.LIST(skip, limit);
      const res = await fetch(url, {
        method: 'post',
        body: JSON.stringify({
          query: query,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return (await res.json()) as { data: ListQuery };
    };

    const data = await getData();
    if ('data' in data && 'capTables' in data.data) {
      return ok(data.data.capTables);
    }
    debug('brok:sdk:thegraph')('invalid data from theGraph', data);
    return err(`Could not get capTable list from theGraph`);
  } catch (e) {
    debug('brok:sdk:thegraph')('invalid response from theGraph', e);
    return err('Could not get capTable from theGraph');
  }
}
