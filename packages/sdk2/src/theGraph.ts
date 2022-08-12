import debug from 'debug';
import { err, ok, Result } from 'neverthrow';
import fetch from 'node-fetch';
import { CapTableGraphQL, CapTableGraphQLTypes } from './utils/CapTableGraphQL.utils.js';

export async function getCapTableGraph(url: string, capTableAddress: string): Promise<Result<CapTableGraphQLTypes.CapTableQuery.CapTable, string>> {
  try {
    const query = CapTableGraphQL.CAP_TABLE_QUERY(capTableAddress);
    const res = await fetch(url, {
      method: 'post',
      body: JSON.stringify({
        query: query,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = (await res.json()) as { data: CapTableGraphQLTypes.CapTableQuery.Response };
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
