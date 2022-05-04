import { ethers } from 'ethers';
import { publishSchema, Schema } from './publish-schema';

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

main().then((uri) => console.log(`Schema uri for ${process.argv.slice(2)[0]} = ${uri}`));
