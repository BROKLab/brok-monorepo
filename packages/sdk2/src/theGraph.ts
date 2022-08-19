import debug from 'debug';
import { err, ok, Result } from 'neverthrow';
import fetch from 'cross-fetch'; // REVIEW - Only works if a exclude this, else i would get this issue https://github.com/vercel/next.js/discussions/33982
import { GraphQLQueries, CapTableGraphQL, CapTableQuery, ListQuery } from './utils/CapTableGraphQL.utils.js';

const log = debug('brok:sdk:thegraph');

export async function getCapTableGraph(
  url: string,
  capTableAddress: string,
  options?: { onlyApproved: boolean },
): Promise<Result<CapTableGraphQL, string>> {
  try {
    const sleep = (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };
    const getData = async () => {
      const query = GraphQLQueries.CAP_TABLE(capTableAddress);
      const res = await fetch(url, {
        method: 'post',
        body: JSON.stringify({
          query: query,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      return (await res.json()) as { data: CapTableQuery };
    };

    const data = await getData();
    if ('data' in data && 'capTable' in data.data) {
      if (options && options.onlyApproved) {
        if (data.data.capTable.status !== 'APPROVED') {
          log('CapTable status NOT approved, sleep 2 seconds and try again');
          await sleep(2000);
          const dataRetry = await getData();
          if ('data' in dataRetry && 'capTable' in dataRetry.data) {
            log('CapTable status is now', dataRetry.data.capTable.status);
            if (dataRetry.data.capTable.status === 'APPROVED') {
              return ok(dataRetry.data.capTable);
            } else {
              return err('CapTable status NOT approved');
            }
          }
        }
        return ok(data.data.capTable);
      }
      return ok(data.data.capTable);
    }
    debug('brok:sdk:thegraph')('invalid data from theGraph', data);
    return err(`Could not get capTable with address: ${capTableAddress} from theGraph`);
  } catch (e) {
    debug('brok:sdk:thegraph')('invalid response from theGraph', e);
    return err('Could not get capTable from theGraph');
  }
}

export async function getCapTableListGraph(url: string): Promise<Result<CapTableGraphQL[], string>> {
  try {
    const getData = async () => {
      const query = GraphQLQueries.LIST();
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
    if ('data' in data && 'capTable' in data.data) {
      return ok(data.data.capTables);
    }
    debug('brok:sdk:thegraph')('invalid data from theGraph', data);
    return err(`Could not get capTable list from theGraph`);
  } catch (e) {
    debug('brok:sdk:thegraph')('invalid response from theGraph', e);
    return err('Could not get capTable from theGraph');
  }
}
