import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import { TileDocument } from '@ceramicnetwork/stream-tile';
import debug from 'debug';
import { err } from 'neverthrow';
import { ok } from 'neverthrow';
import { Result } from 'neverthrow';
import { CapTableCeramic, CeramicId, EthereumAddress, Shareholder } from './types';

const log = debug('brok:sdk:ceramic');
export class CeramicSDK extends CeramicClient {
  constructor(public readonly ceramicUrl: string) {
    super(ceramicUrl);
  }

  async createShareholder(shareholder: Shareholder): Promise<Result<CeramicId, string>> {
    const res = await this.createDocument({
      data: shareholder,
    });
    if (res.isErr()) {
      return err(res.error);
    }
    if (res.value && 'id' in res.value) {
      return ok(res.value.id.toString());
    } else {
      log('Tildocument value in createShareholder', res.value);
      return err('Something wrong with TileDocument in createShareholder');
    }
  }

  async updateShareholder(ceramicId: CeramicId, shareholder: Shareholder): Promise<Result<Shareholder, string>> {
    const res = await this.getDocument<Shareholder>(ceramicId);
    if (res.isErr()) {
      return err(res.error);
    }
    if (res.value.isReadOnly) {
      return err('Document is read only');
    }
    await res.value.update(shareholder);
    const res2 = await this.getDocument<Shareholder>(ceramicId);
    if (res2.isErr()) {
      return err(res2.error);
    }
    if (res2.value && 'content' in res2.value) {
      return ok(res2.value.content);
    } else {
      log('Tildocument value in updateShareholder', res.value);
      return err('Something wrong with TileDocument in updateShareholder');
    }
  }

  async createCapTable(input: {
    data: CapTableCeramic;
    capTableAddress: EthereumAddress;
    capTableRegistryAddress: EthereumAddress;
  }): Promise<Result<TileDocument, string>> {
    return await this.creatDeterministic(input.data, {
      family: 'capTable',
      tags: [input.capTableAddress.toLowerCase(), input.capTableRegistryAddress.toLowerCase()],
    });
  }

  async updateCapTable(input: {
    data: Partial<CapTableCeramic>;
    capTableAddress: EthereumAddress;
    capTableRegistryAddress: EthereumAddress;
  }): Promise<Result<TileDocument, string>> {
    if (!this.did) {
      return err('DID is not set, you must set DID to update on Ceramic.');
    }
    const current = await this.getCapTable({
      capTableAddress: input.capTableAddress,
      capTableRegistryAddress: input.capTableRegistryAddress,
      fagsystemDID: this.did.id,
    });
    if (current.isErr()) {
      return err(`Could not get current captable to update it, error: ${current.error}`);
    }
    const updated: CapTableCeramic = {
      name: input.data.name ?? current.value.name,
      orgnr: input.data.orgnr ?? current.value.orgnr,
      shareholderEthToCeramic: { ...current.value.shareholderEthToCeramic, ...input.data.shareholderEthToCeramic },
    };
    console.log('updated########', updated);
    return await this.creatDeterministic(updated, {
      family: 'capTable',
      tags: [input.capTableAddress.toLowerCase(), input.capTableRegistryAddress.toLowerCase()],
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
        tags: [input.capTableAddress.toLowerCase(), input.capTableRegistryAddress.toLowerCase()],
        controllers: [input.fagsystemDID],
      });
      if (tile.isErr()) {
        return err(tile.error);
      }
      return ok(tile.value.content);
    } catch (error) {
      return err('An error occured trying to find content for capTable on Ceramic');
    }
  }

  async getShareholder(streamId: string): Promise<Result<Shareholder, string>> {
    try {
      const tile = await this.getDocument<Shareholder>(streamId);
      if (tile.isErr()) {
        return err(tile.error);
      }
      return ok(tile.value.content);
    } catch (error) {
      log(error);
      return err('An error occured trying to find content for shareholder on Ceramic');
    }
  }

  async getDocument<T>(streamId: string): Promise<Result<TileDocument<T>, string>> {
    try {
      const tile = await TileDocument.load<T>(this, streamId);
      if (!!tile.content && Object.keys(tile.content).length > 0) {
        return ok(tile);
      }
      log('TileDocument content is empty', tile.content);
      throw new Error('TileDocument is empty');
    } catch (error) {
      log('getDocument streamId', streamId);
      return err('Could not get document from Ceramic');
    }
  }

  private async getDeterministic<T>(metadata: TileMetadataArgs): Promise<Result<TileDocument<T>, string>> {
    try {
      const tile = await TileDocument.deterministic<T>(this, metadata);

      if (!!tile.content && Object.keys(tile.content).length > 0) {
        return ok(tile);
      }
      log('TileDocument content is empty', tile.content);
      throw new Error('TileDocument is empty');
    } catch (error) {
      log('getDeterministic metadata', metadata);
      log('getDeterministic', error);
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
      log('create deterministic metadata:', { ...metadata, controllers: [this.did.id] });
      log('create deterministic content:', content);
      return ok(deterministic);
    } catch (error) {
      log('error in creatDeterministic', error);
      log('content', content);
      log('metadata', metadata);
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
      log(error);
      log('input was', input);
      return err('Could not create document on Ceramic');
    }
  }
}
