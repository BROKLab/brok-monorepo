import anyTest, { TestFn } from 'ava';
import { SDK } from '../src/sdk.js';
import { config } from 'dotenv';
import { ethers } from 'ethers';

const test = anyTest as TestFn<{
  ceramicUrl: string;
  ethereumRpc: string;
  theGraphUrl: string;
  secret: string;
  env: string;
}>;

test.before('env variables is set', async (t) => {
  config();
  if (
    typeof process.env.BROK_ENVIRONMENT === 'string' &&
    typeof process.env.CERAMIC_URL === 'string' &&
    typeof process.env.ETHEREUM_RPC === 'string' &&
    typeof process.env.THE_GRAPH_URL === 'string' &&
    typeof process.env.SECRET === 'string'
  ) {
    t.context = {
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      secret: process.env.SECRET,
      env: process.env.BROK_ENVIRONMENT,
    };
    t.pass('env variables is set');
  } else {
    t.fail('env variables is not set');
  }
});

test('can init SDK', async (t) => {
  const sdk = await SDK.init({
    ceramicUrl: t.context.ceramicUrl,
    env: t.context.env,
    ethereumRpc: t.context.ethereumRpc,
    secret: t.context.secret,
    theGraphUrl: t.context.theGraphUrl,
  });
  t.is(typeof sdk, 'object', 'sdk is an object');
});

test('create capTable', async (t) => {
  const sdk = await SDK.init({
    ceramicUrl: t.context.ceramicUrl,
    env: t.context.env,
    ethereumRpc: t.context.ethereumRpc,
    secret: t.context.secret,
    theGraphUrl: t.context.theGraphUrl,
  });
  const randomOrgNr = (Math.floor(Math.random() * 90000) + 10000).toString();
  const capTableAddress = await sdk.createCapTable({
    name: `Test ${randomOrgNr} AS`,
    orgnr: randomOrgNr,
    shareholders: [
      {
        amount: '1000',
        birthDate: '01-01-1988',
        countryCode: 'NO',
        name: 'Test Testesen',
        postalcode: '1234',
        partition: 'ordinære',
      },
    ],
  });
  t.assert(ethers.utils.isAddress(capTableAddress));
});

test.only('get capTable', async (t) => {
  const sdk = await SDK.init({
    ceramicUrl: t.context.ceramicUrl,
    env: t.context.env,
    ethereumRpc: t.context.ethereumRpc,
    secret: t.context.secret,
    theGraphUrl: t.context.theGraphUrl,
  });
  const randomOrgNr = (Math.floor(Math.random() * 90000) + 10000).toString();
  const capTableAddress = await sdk.createCapTable({
    name: `Test ${randomOrgNr} AS`,
    orgnr: randomOrgNr,
    shareholders: [
      {
        amount: '1000',
        birthDate: '01-01-1988',
        countryCode: 'NO',
        name: 'Test Testesen',
        postalcode: '1234',
        partition: 'ordinære',
      },
    ],
  });
  const capTable = await sdk.getCapTable(capTableAddress);
  t.is(typeof capTable, 'object', 'capTable is an object');
  t.truthy(capTable, 'CapTable is not empty');
  t.is(capTable.name, `Test ${randomOrgNr} AS`, 'name is correct');
});
