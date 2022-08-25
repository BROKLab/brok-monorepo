import { expect } from 'earljs';
import { config } from 'dotenv';
import { SDK } from '../sdk';
import { ethers } from 'ethers';

describe('sdk', function () {
  // this.timeout(10000);
  before(() => {
    config();
  });

  it('should load env variables', () => {
    expect(process.env.CERAMIC_URL).toBeA(String);
    expect(process.env.ETHEREUM_RPC).toBeA(String);
    expect(process.env.THE_GRAPH_URL).toBeA(String);
    expect(process.env.SEED).toBeA(String);
    expect(process.env.BROK_ENVIRONMENT).toBeA(String);
  });

  it.skip('should deploy capTable', async () => {
    const sdk = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });
    const randomOrgNr = (Math.floor(Math.random() * 90000) + 10000).toString();
    const res = await sdk.confirmCreateCapTable({
      name: `Test ${randomOrgNr} AS`,
      orgnr: randomOrgNr,
      shareholders: [
        {
          blockchain: {
            amount: '1000',
            partition: 'ordinære',
          },
          ceramic: {
            countryCode: 'NO',
            name: 'Test Testesen',
            postalcode: '1234',
            birthDate: '01-01-1988',
          },
        },
      ],
    });
    expect(res.isOk()).toBeTruthy();
  }).timeout(4000);

  it('get cap table', async () => {
    const sdk = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });

    const capTableDetailsRes = await sdk.getCapTableDetails('0x5392a33f7f677f59e833febf4016cddd88ff9e67');
    console.log(capTableDetailsRes);
    expect(capTableDetailsRes.isOk()).toBeTruthy();
    if (capTableDetailsRes.isErr()) throw Error(capTableDetailsRes.error.join(', '));
  }).timeout(30000);

  it('should deploy capTable and fetch details', async () => {
    const sdk = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });
    const randomOrgNr = (Math.floor(Math.random() * 90000) + 10000).toString();
    const res = await sdk.confirmCreateCapTable({
      name: `Test ${randomOrgNr} AS`,
      orgnr: randomOrgNr,
      shareholders: [
        {
          blockchain: {
            amount: '1000',
            partition: 'ordinære',
          },
          ceramic: {
            countryCode: 'NO',
            name: 'Test Testesen',
            postalcode: '1234',
            birthDate: '01-01-1988',
          },
        },
      ],
    });
    if (res.isErr()) {
      return expect(res.error).toBeNullish();
    }
    const createCapTableDetails = res.value;

    const capTableDetailsRes = await sdk.getCapTableDetails(createCapTableDetails.deployBlockchainRes.capTableAddress);
    expect(capTableDetailsRes.isOk()).toBeTruthy();
    if (capTableDetailsRes.isErr()) throw Error(capTableDetailsRes.error.join(', '));
    const capTableDetails = capTableDetailsRes.value;
    expect(capTableDetails.name).toEqual(`Test ${randomOrgNr} AS`);
    expect(capTableDetails.shareholders).toBeAnArrayOfLength(1);
  }).timeout(30000);

  it('should deploy capTable and fetch data as another fagsystem', async () => {
    const sdk = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });
    const randomOrgNr = (Math.floor(Math.random() * 90000) + 10000).toString();
    const res = await sdk.confirmCreateCapTable({
      name: `Test ${randomOrgNr} AS`,
      orgnr: randomOrgNr,
      shareholders: [
        {
          blockchain: {
            amount: '1000',
            partition: 'ordinære',
          },
          ceramic: {
            countryCode: 'NO',
            name: 'Test Testesen',
            postalcode: '1234',
            birthDate: '01-01-1988',
          },
        },
      ],
    });
    if (res.isErr()) {
      return expect(res.error).toBeNullish();
    }
    const createCapTableDetails = res.value;

    const randomWallet = ethers.Wallet.createRandom();
    const sdk2 = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: randomWallet.mnemonic.phrase,
    });
    const capTableDetailsRes = await sdk2.getCapTableDetails(createCapTableDetails.deployBlockchainRes.capTableAddress);
    expect(capTableDetailsRes.isOk()).toBeTruthy();
    if (capTableDetailsRes.isErr()) throw Error(capTableDetailsRes.error.join(', '));
    const capTableDetails = capTableDetailsRes.value;
    expect(capTableDetails.name).toEqual(`Test ${randomOrgNr} AS`);
    expect(capTableDetails.shareholders).toBeAnArrayOfLength(1);
  }).timeout(30000);

  it('should close', async () => {
    const sdk = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });
    await sdk.close();
    // TODO expect
  }).timeout(30000);
});
