import { ethers, Wallet } from 'ethers';
import { readFile } from 'node:fs/promises';
import * as path from 'path';
import { CeramicSDK } from './ceramic';
import { makeDID } from './make-did';

export type Schema = 'shareholder' | 'captable';

export const publishSchema = async (type: Schema, version: number, seed: string, ceramicUrl: string = 'http://localhost:7007') => {
  let schemaPath;

  switch (type) {
    case 'captable':
      schemaPath = '../schemas/capTable.json';
      break;
    case 'shareholder':
      schemaPath = '../schemas/shareholder.json';
      break;
  }

  const bytes = await readFile(path.join(__dirname, schemaPath));
  const schema = JSON.parse(bytes.toString());

  const ceramic = new CeramicSDK(ceramicUrl);
  await ceramic.setDID(await makeDID(ceramic, Wallet.fromMnemonic(seed).privateKey));
  await ceramic.did.authenticate();

  const schemaTileRes = await ceramic.creatDeterministic(schema, {
    family: 'brokSchema',
    tags: [type, version.toString()],
  });

  console.log('schemaTile', schemaTileRes);
  if (schemaTileRes.isOk()) {
    return schemaTileRes.value.commitId.toString();
  } else {
    return `Noe gikk galt ved schema opprettelse. Feilmelding: ${schemaTileRes.error}`;
  }
};

async function main() {
  const params = process.argv.slice(2);
  if (params.length !== 3) {
    console.error(`ERROR: Missing/or too many arguments. Got: ${params.length}. Expected: 3`);
    return 0;
  }

  const type = params[0] as Schema;

  const version = parseInt(params[1]);
  if (isNaN(version)) {
    console.error(`ERROR: version argument is not a number. Recieved: ${params[1]}`);
    return;
  }

  const seed = params[2];
  if (!ethers.utils.isValidMnemonic(seed)) {
    console.error('ERROR: Seed is invalid');
    return;
  }

  console.log('type', type);
  console.log('params', params);
  const schemaUri = await publishSchema(type, version, seed);
  return schemaUri;
}
