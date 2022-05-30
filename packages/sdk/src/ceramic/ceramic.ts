import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument, TileMetadataArgs } from '@ceramicnetwork/stream-tile';
import { err, ok, Result, ResultAsync } from 'neverthrow';
import { CapTableCeramic, ShareholderCeramic } from '../types';
const debug = require('debug')('brok:sdk:ceramic');


export class CeramicSDK extends CeramicClient {
  constructor(public readonly ceramicUrl: string) {
    super(ceramicUrl);
  }

  async insertPublicUserData(shareholderCeramic: ShareholderCeramic): Promise<Result<string, string>> {
    const res = await this.createDocument({ shareholder: shareholderCeramic });
    return res.map((streamId) => streamId.id.toString());
  }

  async insertCapTableData(capTableAddress: string, capTableCeramic: CapTableCeramic): Promise<Result<TileDocument, string>> {
    return await this.creatDeterministic(capTableCeramic, {
      family: 'capTable',
      tags: [capTableAddress],
    });
  }

  // unpins and set content in ceramic TileDocument to null
  async forgetUser(streamId: string): Promise<Result<boolean, string>> {
    return await this.setEmptyContentAndUnpin(streamId);
  }

  async findUsersForCapTable(capTableAddress: string, fagsystemDid: string): Promise<Result<ShareholderCeramic[], string>> {
    const capTableTile = await this.getPublicCapTableByCapTableAddress(capTableAddress, fagsystemDid);
    if (capTableTile.isErr()) return err(capTableTile.error);
    else {
      return await this.capTableTileToShareholders(capTableTile.value);
    }
  }

  async findUserForCapTable(capTableAddress: string, userEthAddress: string) {
    const capTableTileForCapTableAddress = await this.getPublicCapTableByCapTableAddress(capTableAddress, "TODO");
    if (capTableTileForCapTableAddress.isErr()) {
      return err(capTableTileForCapTableAddress.error);
    } else {
      const shareholderTileUri = capTableTileForCapTableAddress.value.content.shareholdersEthAddressToCeramicUri[userEthAddress];
      if (shareholderTileUri === undefined) return err(`Shareholder for ${userEthAddress} does not exist in capTable document`);

      const shareholderTile = await this.getContent<{ shareholder: ShareholderCeramic }>(shareholderTileUri);
      if (shareholderTile.isErr()) {
        return err(shareholderTile.error);
      } else {
        return ok(shareholderTile.value);
      }
    }
  }

  async getPublicCapTableByCapTableAddress(capTableAddress: string, fagsystemDid: string) {
    const detTileDoc = await this.loadDeterministicDocument<CapTableCeramic>({
      family: 'capTable',
      tags: [capTableAddress],
      deterministic: true,
      controllers: [fagsystemDid]
    });

    return detTileDoc;
  }

  async getContent<T>(streamId: string): Promise<Result<TileDocument<T>, string>> {
    try {
      const doc = await TileDocument.load<T>(this, streamId);
      return ok(doc);
    } catch (error: any) {
      const errorMessage = `Ceramic stream with id ${streamId} failed with error: ${error.message}`;
      return err(errorMessage);
    }
  }

  async updateContent(streamId: string, content: any): Promise<Result<string, string>> {
    try {
      const doc = await TileDocument.load(this, streamId);
      await doc.update(content);
      return ok(doc.id.toUrl());
    } catch (error: any) {
      return err(error.message);
    }
  }

  async createDocument(data: any, schema?: string, controllers: string[] = []): Promise<Result<TileDocument, string>> {
    try {
      const document = await TileDocument.create(
        this,
        {
          ...data,
        },
        {
          schema: schema,
          controllers: [...controllers],
        },
        {
          pin: true,
        },
      );
      return ok(document);
    } catch (error: any) {
      return err(error.message);
    }
  }

  async creatDeterministic<T>(content: T | undefined | null, metadata: TileMetadataArgs): Promise<Result<TileDocument, string>> {
    try {
      debug("Start creatDeterministic")
      debug("content", content)
      debug("metadatacontent", metadata)
      debug("controller", this.did.id)
      const schemaId = metadata.schema;
      delete metadata.schema;
      const deterministic = await TileDocument.deterministic(this, {
        ...metadata,
        controllers: [this.did.id],
      });
      await deterministic.update(content, { schema: schemaId });
      debug("End creatDeterministic")
      return ok(deterministic);
    } catch (error: any) {
      debug("Error in creatDeterministic", error)
      return err(error.message);
    }
  }

  loadDeterministicDocument<T>(metadata: TileMetadataArgs): ResultAsync<TileDocument<T>, string> {
    return ResultAsync.fromPromise(
      new Promise( (resolve, reject) => {
        TileDocument.deterministic<T>(this, {
          ...metadata,
        }).then(tile => {
          if (Object.keys(tile.content).length === 0)
          reject('No data is set in tileDocument. Probably because document has not been created for metadata');
          resolve(tile);
        })
      }),
      (e) => `Could not load deterministic document because of ${e}`,
    );
  }

  // Forget from persistant storage
  async setEmptyContentAndUnpin(streamId: string) {
    try {
      const tile = await TileDocument.load(this, streamId);
      /* const updateRes =  */await this.updateContent(streamId.toString(), {
        shareholder: null,
      });
      await this.pin.rm(tile.id);
      return ok(true);
    } catch (e: any) {
      return err(e);
    }
  }

  async listPinnedStreamIds() {
    return await this.pin.ls();
  }

  async capTableTileToShareholders(tile: TileDocument<CapTableCeramic>): Promise<Result<ShareholderCeramic[], string>> {
    const shareHolders: ShareholderCeramic[] = [];
    const errors: string[] = [];

    for await (const [ethAddress, ceramicUri] of Object.entries(tile.content.shareholdersEthAddressToCeramicUri)) {
      const shareholderTileDocument = await this.getPublicUserData(ceramicUri);
      if (shareholderTileDocument.isErr()) {
        errors.push(shareholderTileDocument.error);
      } else {
        shareHolders.push({
          ethAddress: ethAddress,
          ...shareholderTileDocument.value.shareholder,
        });
      }
    }
    // TODO how to handle invidual errors? Are they really "error able"?
    debug('errors in getPublicShareholdersFromCapTableTile:', errors);
    if (errors.length > 0) {
      return err(`Some errors when getting ceramic data: ${errors}`);
    }
    return ok(shareHolders);
  }

  async getPublicUserData(streamId: string) {
    const res = await this.getContent<{ shareholder: ShareholderCeramic }>(streamId)
     const content = res.map((sh) => sh.content);
     return content
  }
}
