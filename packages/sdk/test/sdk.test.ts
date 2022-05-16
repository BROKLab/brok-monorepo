import { expect } from 'earljs';
import { config } from 'dotenv';
import { SDK } from '../src/sdk';

describe('sdk', () => {
  before(() => {
    config();
  });

  it('should load env variables', () => {
    expect(process.env.CERAMIC_URL).toBeA(String)
    expect(process.env.ETHEREUM_RPC).toBeA(String)
    expect(process.env.THE_GRAPH_URL).toBeA(String)
    expect(process.env.SEED).toBeA(String)
    expect(process.env.BROK_ENVIRONMENT).toBeA(String)
  })

  it('should deploy capTable',async  () => {
    const sdk = await SDK.init({
      ceramicUrl: process.env.CERAMIC_URL,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });
    const res = await sdk.confirmCreateCapTable({
      name: "Test company AS",
      orgnr: "987654321",
      shareholders: [
        {
          blockchain: {
            amount: "1000",
            partition: "ordinære",
          },
          ceramic: {
            countryCode: "NO",
            name: "Test Testesen",
            postalcode: "1234",
            birthDate: "01-01-1988",
          }
        }
      ]
    });
    console.log(res)
    expect(res.isOk()).toBeTruthy()
  });
});
