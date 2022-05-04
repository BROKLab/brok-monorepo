import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { CeramicApi } from '@ceramicnetwork/common';
import { Resolver } from 'did-resolver';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import KeyDidResolver from 'key-did-resolver';

export async function makeDID(ceramic: CeramicApi, privateKey?: string): Promise<DID> {
  const effectiveSeed = Uint8Array.from(Buffer.from(privateKey.substring(2), 'hex'));
  const provider = new Ed25519Provider(effectiveSeed);

  const keyDidResolver = KeyDidResolver.getResolver();
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic);
  const resolver = new Resolver({
    ...threeIdResolver,
    ...keyDidResolver,
  });

  const did = new DID({ provider, resolver });
  await did.authenticate();
  return did;
}
