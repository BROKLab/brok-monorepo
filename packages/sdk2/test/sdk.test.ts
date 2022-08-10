import { test } from 'tap';
import { SDK } from '../src/sdk';
import { config } from 'dotenv';

test('env variables is set', async (t) => {
  config();
  t.type(process.env.CERAMIC_URL, 'string', 'CERAMIC_URL is set as string');
  t.type(process.env.ETHEREUM_RPC, 'string', 'ETHEREUM_RPC is set as string');
  t.type(process.env.THE_GRAPH_URL, 'string', 'THE_GRAPH_URL is set as string');
  t.type(process.env.SECRET, 'string', 'SECRET is set as string');
  t.type(process.env.BROK_ENVIRONMENT, 'string', 'BROK_ENVIRONMENT is set as string');
  t.context.CERAMIC_URL = process.env.CERAMIC_URL;
  t.context.ETHEREUM_RPC = process.env.ETHEREUM_RPC;
  t.context.THE_GRAPH_URL = process.env.THE_GRAPH_URL;
  t.context.SECRET = process.env.SECRET;
  t.context.BROK_ENVIRONMENT = process.env.BROK_ENVIRONMENT;

  t.test('can init SDK', async (t) => {
    const sdk = await SDK.init({
      ceramicUrl: t.context.CERAMIC_URL,
      ethereumRpc: t.context.ETHEREUM_RPC,
      theGraphUrl: t.context.THE_GRAPH_URL,
      secret: t.context.SECRET,
    });
    t.type(sdk, 'object', 'sdk is an object');
  });
  t.end();
});
