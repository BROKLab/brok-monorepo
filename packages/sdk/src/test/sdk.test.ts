import { expect } from 'earljs';
import { config } from 'dotenv';
import { SDK } from '../sdk';

describe('sdk', function() {
  this.timeout(5000); 
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
    const randomOrgNr = (Math.floor(Math.random()*90000) + 10000).toString();
    const res = await sdk.confirmCreateCapTable({
      name: `Test ${randomOrgNr} AS`,
      orgnr: randomOrgNr,
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
    expect(res.isOk()).toBeTruthy()
  });
});
