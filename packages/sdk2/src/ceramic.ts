import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import debug from 'debug';
import { err } from 'neverthrow';
import { ok } from 'neverthrow';
import { Result } from 'neverthrow';
import { CapTableCeramic, CeramicId, EthereumAddress, Shareholder } from './types';

export class CeramicSDK extends CeramicClient {
  constructor(public readonly ceramicUrl: string) {
    super(ceramicUrl);
  }

  async createShareholder(input: Shareholder): Promise<Result<CeramicId, string>> {
    const res = await this.createDocument({
      data: {
        shareholder: input,
      },
    });
    if (res.isErr()) {
      return err(res.error);
    }
    if (res.value && 'id' in res.value) {
      return ok(res.value.id.toString());
    } else {
      debug('brok:sdk:ceramic')('Tildocument value in createShareholder', res.value);
      return err('Something wrong with TileDocument in createShareholder');
    }
  }

  async createCapTable(input: {
    data: CapTableCeramic;
    capTableAddress: EthereumAddress;
    capTableRegistryAddress: EthereumAddress;
  }): Promise<Result<TileDocument, string>> {
    return await this.creatDeterministic(input.data, {
      family: 'capTable',
      tags: [input.capTableAddress, input.capTableRegistryAddress],
    });
  }

  async getCapTable(input: {
    capTableAddress: EthereumAddress;
    capTableRegistryAddress: EthereumAddress;
    fagsystemDID: string;
  }): Promise<Result<CapTableCeramic, string>> {
    try {
      const tile = await this.getDeterministic<CapTableCeramic>({
        family: 'capTable',
        deterministic: true,
        tags: [input.capTableAddress, input.capTableRegistryAddress],
        controllers: [input.fagsystemDID],
      });
      if (tile.isErr()) {
        return err(tile.error);
      }
      if (!tile.value.content) {
        debug('brok:sdk:ceramic')('getCapTable content is invalid', tile.value.content);
        return err('Could not find content for capTable on Ceramic');
      }
      return ok(tile.value.content);
    } catch (error) {
      return err('An error occured trying to find content for capTable on Ceramic');
    }
  }

  private async getDeterministic<T>(metadata: TileMetadataArgs): Promise<Result<TileDocument<T>, string>> {
    try {
      const tile = await TileDocument.deterministic<T>(this, metadata);
      if (tile.content) {
        return ok(tile);
      }
      throw new Error('TileDocument is empty');
    } catch (error) {
      debug('brok:sdk:ceramic')('error in getDeterministic', error);
      debug('brok:sdk:ceramic')('metadata', metadata);
      return err('Could not get deterministic document from Ceramic');
    }
  }

  private async creatDeterministic<T>(content: T, metadata: TileMetadataArgs): Promise<Result<TileDocument, string>> {
    try {
      // REVIEW: Dont know, aobut this delete metadata.schema, but il let it stand here and take a look at it later.
      // const schemaId = metadata.schema ? metadata.schema : undefined;
      // if (schemaId) {
      //     metadata.schema = undefined;
      // }
      if (!this.did) {
        return err('DID is not set, you must set DID to create on Ceramic.');
      }
      const deterministic = await TileDocument.deterministic<T>(this, {
        ...metadata,
        controllers: [this.did.id],
      });
      await deterministic.update(content);
      return ok(deterministic);
    } catch (error) {
      debug('brok:sdk:ceramic')('error in creatDeterministic', error);
      debug('brok:sdk:ceramic')('content', content);
      debug('brok:sdk:ceramic')('metadata', metadata);
      return err('Could not create deterministic document on Ceramic');
    }
  }

  private async createDocument(input: {
    data: Record<string, Shareholder | unknown>;
    schema?: string;
    controllers?: string[];
  }): Promise<Result<TileDocument, string>> {
    try {
      const { data, schema, controllers } = {
        controllers: [],
        ...input,
      };
      const document = await TileDocument.create(
        this,
        {
          ...data,
        },
        {
          schema,
          controllers,
        },
        {
          pin: true,
        },
      );
      return ok(document);
    } catch (error) {
      debug('brok:sdk:ceramic')(error);
      debug('brok:sdk:ceramic')('input was', input);
      return err('Could not create document on Ceramic');
    }
  }
}
