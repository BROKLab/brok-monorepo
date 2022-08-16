import anyTest, { TestFn } from 'ava';
import { SDK } from '../src/sdk.js';
import { config } from 'dotenv';

const test = anyTest as TestFn<{
  sdk: SDK;
}>;

export const initSDK = async () => {
  if (
    typeof process.env.BROK_ENVIRONMENT === 'string' &&
    typeof process.env.CERAMIC_URL === 'string' &&
    typeof process.env.ETHEREUM_RPC === 'string' &&
    typeof process.env.THE_GRAPH_URL === 'string' &&
    typeof process.env.SECRET === 'string'
  ) {
    return await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      env: process.env.BROK_ENVIRONMENT,
      ethereumRpc: process.env.ETHEREUM_RPC,
      secret: process.env.SECRET,
      theGraphUrl: process.env.THE_GRAPH_URL,
    });
  } else {
    throw new Error('env variables is not set');
  }
};

test.before('env variables is set', async (t) => {
  config();
  const sdk = await initSDK();
  t.context = {
    ...t.context,
    sdk,
  };
});

test.after(async (t) => {
  await t.context.sdk.close();
});

test('can init SDK', async (t) => {
  t.is(typeof t.context.sdk, 'object', 'sdk is an object');
});
