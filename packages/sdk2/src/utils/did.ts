import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver as getResolverKey } from 'key-did-resolver';
import { Result, ok, err } from 'neverthrow';
// import { getResolver as getResolver3id } from '@ceramicnetwork/3id-did-resolver';
// import { CeramicApi } from '@ceramicnetwork/common';
// import { Resolver } from 'did-resolver';

export async function getDIDfromPrivateKey(privateKey: string): Promise<Result<DID, string>> {
  try {
    const seed = Uint8Array.from(Buffer.from(privateKey.substring(2), 'hex'));
    const provider = new Ed25519Provider(seed);

    // const keyDidResolver = getResolverKey();
    // // const threeIdResolver = getResolver3id(ceramic);
    // const resolver = new Resolver({
    //   ...keyDidResolver,
    // });

    const did = new DID({ provider, resolver: getResolverKey() });
    await did.authenticate();
    return ok(did);
  } catch (error) {
    return err('Could not create DID from private key');
  }
}
