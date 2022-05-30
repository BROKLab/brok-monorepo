import { CeramicDaemon, DaemonConfig } from '@ceramicnetwork/cli';
import { IpfsApi } from '@ceramicnetwork/common';
import Ceramic from '@ceramicnetwork/core';
import { ethers } from 'ethers';
import getPort from 'get-port';
import tmp from 'tmp-promise';
import { CeramicSDK } from '../../src/ceramic/ceramic';
import { makeDID } from '../../src/ceramic/make-did';
import { publishSchema } from '../../src/ceramic/publish-schema';
import { CapTableCeramic } from '../../src/types';
import { createIPFS } from '../utils/create-ipfs';
import { selskaper, users } from '../utils/dummydata';
import { makeCeramicCore, makeShareholder } from '../utils/test-utils';
require('dotenv').config({ path: '.env.test' });

const errorMessage = 'Error: data/shareholder must';

describe('ceramic client', () => {
  let ipfs: IpfsApi;
  let tmpFolder: any;
  let core: Ceramic;
  let daemon: CeramicDaemon;
  let ceramic: CeramicSDK;
  let shareholderSchemaId: string;
  let capTableSchemaId: string;

  beforeAll(async () => {
    tmpFolder = await tmp.dir({ unsafeCleanup: true });
    ipfs = await createIPFS(tmpFolder.path);
    core = await makeCeramicCore(ipfs, tmpFolder.path);
    const port = await getPort();
    const apiUrl = 'http://localhost:' + port;
    daemon = new CeramicDaemon(
      core,
      DaemonConfig.fromObject({
        'http-api': { port },
        logger: { 'log-level': 3, 'log-to-files': false },
      }),
    );
    await daemon.listen();

    ceramic = new CeramicSDK(apiUrl);

    await core.setDID(await makeDID(core, ethers.Wallet.createRandom().privateKey));
    await core.did.authenticate();
    await ceramic.setDID(await makeDID(ceramic, ethers.Wallet.createRandom().privateKey));
    await ceramic.did.authenticate();
    console.log('ceramic before all', ceramic.did.authenticated);
    const schemaOwnerSeed = ethers.Wallet.createRandom().mnemonic.phrase;
    shareholderSchemaId = await publishSchema('shareholder', 1, schemaOwnerSeed, apiUrl);
    capTableSchemaId = await publishSchema('captable', 1, schemaOwnerSeed, apiUrl);

    console.log('capTAbleSchemaId', capTableSchemaId);
  });

  afterAll(async () => {
    await ceramic.close();
    await daemon.close();
    await core.close();
    await ipfs.stop();
    await tmpFolder.cleanup();
  });

  describe('When creating a shareholder document', () => {
    describe('should throw error when', () => {
      it('only provide name', async () => {
        const shareholderWithOnlyNae = makeShareholder({ only: ['name'] });
        const res = await ceramic.createDocument(shareholderWithOnlyNae, shareholderSchemaId);
        expect(res.isErr()).toBeTruthy();
        expect(res._unsafeUnwrapErr()).toContain(errorMessage);
      });

      it('missing ethAddress', async () => {
        const shareholderWithoutEthaddress = makeShareholder({
          omitFields: ['ethAddress'],
        });
        const res = await ceramic.createDocument(shareholderWithoutEthaddress, shareholderSchemaId);

        expect(res.isErr()).toBeTruthy();
        expect(res._unsafeUnwrapErr()).toContain(errorMessage);
      });

      it('missing countryCode', async () => {
        const shareholderWithoutCountryCode = makeShareholder({
          omitFields: ['countryCode'],
        });
        const res = await ceramic.createDocument(shareholderWithoutCountryCode, shareholderSchemaId);
        expect(res.isErr()).toBeTruthy();
        expect(res._unsafeUnwrapErr()).toContain(errorMessage);
      });
    });

    describe('should return streamId url when', () => {
      it('data match schema', async () => {
        const data = makeShareholder();
        const res = await ceramic.createDocument(data, shareholderSchemaId);
        expect(res.isOk()).toBeTruthy();
      });
    });

    describe('pinning list should', () => {
      it('include streamId when data match schema', async () => {
        const data = makeShareholder();
        const res = await ceramic.createDocument(data, shareholderSchemaId);
        expect(res.isOk()).toBeTruthy();

        const streamId = res._unsafeUnwrap().id.toString();
        const pinned = await ceramic.listPinnedStreamIds();

        let isPinned = false;
        for await (let val of pinned) {
          if (val === streamId) isPinned = true;
        }

        expect(isPinned).toBeTruthy();
      });

      it('increse in size when creating stream', async () => {
        const data = makeShareholder({
          customFields: { name: 'Make sure new' },
        });

        const pinnedListBefore = await ceramic.listPinnedStreamIds();
        let sizeBefore = 0;
        for await (let val of pinnedListBefore) {
          sizeBefore++;
        }

        await ceramic.createDocument(data, shareholderSchemaId);

        const pinnedListAfter = await ceramic.listPinnedStreamIds();
        let size = 0;
        for await (let val of pinnedListAfter) {
          size++;
        }

        expect(sizeBefore + 1 === size).toBeTruthy();
      });

      it('increase in size when creating two identical documents (same content), but metadata generated by ceramic is different', async () => {
        const data = makeShareholder();

        const pinnedListBefore = await ceramic.listPinnedStreamIds();
        let sizeBefore = 0;
        for await (let val of pinnedListBefore) {
          sizeBefore++;
        }

        const res = await ceramic.createDocument(data, shareholderSchemaId);
        const streamIdFirst = res._unsafeUnwrap().id.toString();

        const pinnedListAfter = await ceramic.listPinnedStreamIds();
        let sizeAfterFirstCreate = 0;
        for await (let val of pinnedListAfter) {
          sizeAfterFirstCreate++;
        }

        expect(sizeBefore + 1 === sizeAfterFirstCreate).toBeTruthy();

        const resFromSameData = await ceramic.createDocument(data, shareholderSchemaId);
        const streamIdSecond = resFromSameData._unsafeUnwrap().id.toString();

        expect(streamIdFirst).not.toBe(streamIdSecond);

        const pinnedListEnd = await ceramic.listPinnedStreamIds();
        let sizeEnd = 0;
        for await (let val of pinnedListEnd) {
          sizeEnd++;
        }

        expect(sizeAfterFirstCreate + 1).toBe(sizeEnd);
      });
    });

    describe('unpinning streamid should', () => {
      it('decrease pinning size', async () => {
        const data = makeShareholder();
        const res = await ceramic.createDocument(data, shareholderSchemaId);
        expect(res.isOk()).toBeTruthy();
        const tileDocument = res._unsafeUnwrap();
        const streamBefore = await ceramic.loadStream(tileDocument.id);

        const pinnedListBefore = await ceramic.listPinnedStreamIds();
        let sizeBefore = 0;
        for await (let val of pinnedListBefore) {
          sizeBefore++;
        }

        await ceramic.setEmptyContentAndUnpin(tileDocument.id.toString());

        const pinnedListAfter = await ceramic.listPinnedStreamIds();
        let sizeAfter = 0;
        for await (let val of pinnedListAfter) {
          sizeAfter++;
        }
        expect(sizeAfter + 1).toBe(sizeBefore);
        const streamAfter = await ceramic.loadStream(tileDocument.id);
      });
    });
  });

  describe('insert public', () => {
    it('should be retrivalble', async () => {
      const user = users['Abe'];
      const insertRes = await ceramic.insertPublicUserData(user);
      expect(insertRes.isOk()).toBeTruthy();
      const retrivedTileDoc = await ceramic.getPublicUserData(insertRes._unsafeUnwrap());
      expect(retrivedTileDoc.isOk()).toBeTruthy();
    });

    it('should be retrivalble and match input', async () => {
      const user = users['Ben'];
      const insertRes = await ceramic.insertPublicUserData(user);
      expect(insertRes.isOk()).toBeTruthy();
      const retrivedTileDoc = await ceramic.getPublicUserData(insertRes._unsafeUnwrap());
      expect(retrivedTileDoc.isOk()).toBeTruthy();
      expect(retrivedTileDoc._unsafeUnwrap().shareholder).toMatchObject(user);
    });
  });

  describe('insert and forget user', () => {
    it('should mirror in pinning list', async () => {
      const user = users['Ben'];
      const pinListBefore = await ceramic.listPinnedStreamIds();

      const insertRes = await ceramic.insertPublicUserData(user);
      expect(insertRes.isOk()).toBeTruthy();

      const pinListAfter = await ceramic.listPinnedStreamIds();

      let size = 0;
      for await (let val of pinListBefore) {
        size++;
      }

      let sizeAfter = 0;
      for await (let val of pinListAfter) {
        sizeAfter++;
      }

      expect(size + 1).toBe(sizeAfter);

      await ceramic.forgetUser(insertRes._unsafeUnwrap());
      const pinListAfterDelete = await ceramic.listPinnedStreamIds();

      let sizeAfterDelete = 0;
      for await (let val of pinListAfterDelete) {
        sizeAfterDelete++;
      }

      expect(size).toBe(sizeAfterDelete);
    });

    it('should reflect in content (shareholder should be null)', async () => {
      const user = users['Ben'];
      const insertRes = await ceramic.insertPublicUserData(user);
      expect(insertRes.isOk()).toBeTruthy();

      await ceramic.forgetUser(insertRes._unsafeUnwrap());

      const userContentAfterDeletion = await ceramic.getPublicUserData(insertRes._unsafeUnwrap());
      expect(userContentAfterDeletion._unsafeUnwrap().shareholder).toBeNull();
    });

    it('should insert public captable data on ceramic and make capTable queryAble', async () => {
      const matfabrikkenLegacy = selskaper[0];
      const dummyCapTableAddress = '0x1234';

      const fullCap: CapTableCeramic = {
        name: matfabrikkenLegacy.navn,
        orgnr: matfabrikkenLegacy.orgnr,
        shareholdersEthAddressToCeramicUri: { '0x456': 'ceramic://' },
      };

      const res = await ceramic.insertCapTableData(dummyCapTableAddress, fullCap);

      const loadedByTagAndFamily = await ceramic.getPublicCapTableByCapTableAddress(dummyCapTableAddress);

      expect(loadedByTagAndFamily.isOk()).toBeTruthy();
      expect(loadedByTagAndFamily._unsafeUnwrap().content).toMatchObject(fullCap);
    });

    it('should manage 1000 shareholdes', async () => {
      const matfabrikkenLegacy = selskaper[0];
      const dummyCapTableAddress = '0x55555';
      const shareholders = {};

      for (let i = 0; i < 1000; i++) {
        shareholders[`0x111${i}`] = `ceramic://${i}`;
      }
      const fullCap: CapTableCeramic = {
        name: matfabrikkenLegacy.navn,
        orgnr: matfabrikkenLegacy.orgnr,
        shareholdersEthAddressToCeramicUri: shareholders,
      };

      const res = await ceramic.insertCapTableData(dummyCapTableAddress, fullCap);

      const loadedByTagAndFamily = await ceramic.getPublicCapTableByCapTableAddress(dummyCapTableAddress);

      expect(loadedByTagAndFamily.isOk()).toBeTruthy();
      expect(Object.keys(loadedByTagAndFamily._unsafeUnwrap().content.shareholdersEthAddressToCeramicUri).length).toBe(1000);
    });

    it('will throw error with too many shareholders (commit size > 256000 is not allowed by ceramic)', async () => {
      const matfabrikkenLegacy = selskaper[0];
      const dummyCapTableAddress = '0x4444';
      const shareholders = {};

      for (let i = 0; i < 100000; i++) {
        shareholders[`0x111${i}`] = `ceramic://${i}`;
      }

      const fullCap: CapTableCeramic = {
        name: matfabrikkenLegacy.navn,
        orgnr: matfabrikkenLegacy.orgnr,
        shareholdersEthAddressToCeramicUri: shareholders,
      };

      const res = await ceramic.insertCapTableData(dummyCapTableAddress, fullCap);
      expect(res.isErr()).toBeTruthy();
    });

    it('is updateable and content reflects new state', async () => {
      const matfabrikkenLegacy = selskaper[0];
      const dummyCapTableAddress = '0x4444';
      const shareholders = {};

      for (let i = 0; i < 100; i++) {
        shareholders[`0x111${i}`] = `ceramic://${i}`;
      }

      const fullCap: CapTableCeramic = {
        name: matfabrikkenLegacy.navn,
        orgnr: matfabrikkenLegacy.orgnr,
        shareholdersEthAddressToCeramicUri: shareholders,
      };

      const res = await ceramic.insertCapTableData(dummyCapTableAddress, fullCap);
      console.log('res', res);
      expect(res.isOk()).toBeTruthy();

      const newShareholders = {};

      for (let i = 0; i < 100; i++) {
        newShareholders[`0x222${i}`] = `ceramic://${i}`;
      }

      const newStateCapTable: CapTableCeramic = {
        name: matfabrikkenLegacy.navn,
        orgnr: matfabrikkenLegacy.orgnr,
        shareholdersEthAddressToCeramicUri: newShareholders,
      };

      const resUpdated = await ceramic.insertCapTableData(dummyCapTableAddress, newStateCapTable);

      expect(resUpdated.isOk()).toBeTruthy();
      const loadedAfterUpdate = await ceramic.getPublicCapTableByCapTableAddress(dummyCapTableAddress);
      expect(Object.keys(loadedAfterUpdate._unsafeUnwrap().content.shareholdersEthAddressToCeramicUri).length).toBe(
        Object.keys(newShareholders).length,
      );
    });
  });

  describe('When updating a shareholder document', () => {
    let streamIdUrl: string;
    beforeAll(async () => {
      const data = makeShareholder();
      const res = await ceramic.createDocument(data, shareholderSchemaId);
      streamIdUrl = res._unsafeUnwrap().id.toString();
    });
    describe('should throw error when', () => {
      it('only provide name', async () => {
        const data = makeShareholder({
          only: ['name'],
          customFields: { name: 'new name' },
        });
        const res = await ceramic.updateContent(streamIdUrl, data);
        expect(res._unsafeUnwrapErr()).toContain(errorMessage);
        expect(res.isErr()).toBeTruthy();
      });

      it('missing ethAddress', async () => {
        const data = makeShareholder({ omitFields: ['ethAddress'] });
        const res = await ceramic.updateContent(streamIdUrl, data);
        expect(res._unsafeUnwrapErr()).toContain(errorMessage);
        expect(res.isErr()).toBeTruthy();
      });

      it('missing countryCode', async () => {
        const data = makeShareholder({ omitFields: ['countryCode'] });
        const res = await ceramic.updateContent(streamIdUrl, data);
        expect(res._unsafeUnwrapErr()).toContain(errorMessage);
        expect(res.isErr()).toBeTruthy();
      });
    });

    describe('should return streamId url when', () => {
      it('providing correct data', async () => {
        const data = makeShareholder();
        const res = await ceramic.updateContent(streamIdUrl, data);
        expect(res.isOk()).toBeTruthy();
      });
    });

    describe('deterministic documents', () => {
      it('should be retrivable by family', async () => {
        const data = makeShareholder();
        const res = await ceramic.creatDeterministic(data, {
          family: 'shareholders1',
          controllers: [ceramic.did.id],
        });
        expect(res.isOk()).toBeTruthy();

        const shareholderTile = await ceramic.loadDeterministicDocument({
          family: 'shareholders1',
          controllers: [ceramic.did.id],
        });

        expect(shareholderTile.isOk).toBeTruthy();
        expect(shareholderTile._unsafeUnwrap().content).toMatchObject(data);
      });

      it('should be updateable', async () => {
        const data = makeShareholder();
        const res = await ceramic.creatDeterministic(data, {
          family: 'sharehold',
          controllers: [ceramic.did.id],
        });
        expect(res.isOk()).toBeTruthy();

        const shareholderTile = await ceramic.loadDeterministicDocument({
          family: 'shareholders1',
          controllers: [ceramic.did.id],
        });

        expect(shareholderTile.isOk).toBeTruthy();
        expect(shareholderTile._unsafeUnwrap().content).toMatchObject(data);

        const updateRes = await shareholderTile._unsafeUnwrap().update({ address: 'New York 1' });

        const tileAfterUpdate = await ceramic.loadDeterministicDocument({
          family: 'shareholders1',
          controllers: [ceramic.did.id],
        });

        expect(tileAfterUpdate.isOk).toBeTruthy();
        expect(tileAfterUpdate._unsafeUnwrap().content).toMatchObject({
          address: 'New York 1',
        });
      });

      it('should be schema enforced', async () => {
        const data = { shareholder: { wrongData: 'Hello' } };
        const res = await ceramic.creatDeterministic(data, {
          family: 'shareholder',
          controllers: [ceramic.did.id],
          schema: shareholderSchemaId,
        });

        expect(res.isErr()).toBeTruthy();
        expect(res._unsafeUnwrapErr()).toContain('Error: data/shareholder must NOT have additional properties');
      });

      it('should be schema enforced for capTable mapping', async () => {
        const data = {
          name: 'test org',
          orgnr: 123456789,
          shareholders: [
            {
              ethAddress: '0x1234',
              ceramicUri: 'ceramic://12345',
            },
            {
              ethAddress: '5678',
              ceramicUri: 'ceramic://56789',
            },
          ],
        };
        const res = await ceramic.creatDeterministic(data, {
          family: 'captable',
          controllers: [ceramic.did.id],
          schema: capTableSchemaId,
        });

        console.log('res', res);

        expect(res.isOk()).toBeTruthy();

        await expect(res._unsafeUnwrap().update({ illage: 'hey this is not schema' })).rejects.toThrow();

        const loadedTileDocuemmtn = await ceramic.loadDeterministicDocument({
          family: 'captable',
          controllers: [ceramic.did.id],
        });
        console.log(loadedTileDocuemmtn);
        expect(loadedTileDocuemmtn.isOk()).toBeTruthy();
        expect(loadedTileDocuemmtn._unsafeUnwrap().content).toMatchObject(data);
      });
    });
  });

  describe('deterministic documents', () => {
    it('should be retrivable by family', async () => {
      const data = makeShareholder();
      const res = await ceramic.creatDeterministic(data, {
        family: 'shareholders1',
        controllers: [ceramic.did.id],
      });
      expect(res.isOk()).toBeTruthy();

      const shareholderTile = await ceramic.loadDeterministicDocument({
        family: 'shareholders1',
        controllers: [ceramic.did.id],
      });

      expect(shareholderTile.isOk).toBeTruthy();
      expect(shareholderTile._unsafeUnwrap().content).toMatchObject(data);
    });

    it('should be updateable', async () => {
      const data = makeShareholder();
      const res = await ceramic.creatDeterministic(data, {
        family: 'sharehold',
        controllers: [ceramic.did.id],
      });
      expect(res.isOk()).toBeTruthy();

      const shareholderTile = await ceramic.loadDeterministicDocument({
        family: 'shareholders1',
        controllers: [ceramic.did.id],
      });

      expect(shareholderTile.isOk).toBeTruthy();
      expect(shareholderTile._unsafeUnwrap().content).toMatchObject(data);

      const updateRes = await shareholderTile._unsafeUnwrap().update({ address: 'New York 1' });

      const tileAfterUpdate = await ceramic.loadDeterministicDocument({
        family: 'shareholders1',
        controllers: [ceramic.did.id],
      });

      expect(tileAfterUpdate.isOk).toBeTruthy();
      expect(tileAfterUpdate._unsafeUnwrap().content).toMatchObject({
        address: 'New York 1',
      });
    });

    it('should be schema enforced', async () => {
      const data = { shareholder: { wrongData: 'Hello' } };
      const res = await ceramic.creatDeterministic(data, {
        family: 'shareholder',
        controllers: [ceramic.did.id],
        schema: shareholderSchemaId,
      });

      expect(res.isErr()).toBeTruthy();
      expect(res._unsafeUnwrapErr()).toContain('Validation Error');
    });

    it('should be schema enforced for capTable mapping', async () => {
      const data = {
        name: 'test org',
        orgnr: 123456789,
        shareholders: [
          {
            ethAddress: '0x1234',
            ceramicUri: 'ceramic://12345',
          },
          {
            ethAddress: '5678',
            ceramicUri: 'ceramic://56789',
          },
        ],
      };
      const res = await ceramic.creatDeterministic(data, {
        family: 'captable',
        controllers: [ceramic.did.id],
        schema: capTableSchemaId,
      });

      console.log('res', res);

      expect(res.isOk()).toBeTruthy();

      await expect(res._unsafeUnwrap().update({ illage: 'hey this is not schema' })).rejects.toThrow();

      const loadedTileDocuemmtn = await ceramic.loadDeterministicDocument({
        family: 'captable',
        controllers: [ceramic.did.id],
      });
      console.log(loadedTileDocuemmtn);
      expect(loadedTileDocuemmtn.isOk()).toBeTruthy();
      expect(loadedTileDocuemmtn._unsafeUnwrap().content).toMatchObject(data);
    });
  });
});
