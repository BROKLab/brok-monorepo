import { CeramicDaemon, DaemonConfig } from '@ceramicnetwork/cli';
import { IpfsApi } from '@ceramicnetwork/common';
import Ceramic from '@ceramicnetwork/core';
import getPort from 'get-port';
import tmp from 'tmp-promise';
import { makeDID } from '../ceramic/make-did';
import { SDK } from '../sdk';
import { CreateCapTableInput } from './../types';
import { createIPFS } from './utils/create-ipfs';
import { ceramicShareholdersForCaptableResponse, selskaper, users } from './utils/dummydata';
import { makeCeramicCore } from './utils/test-utils';
import { ethers } from 'ethers';
require('dotenv').config({ path: '.env.test' });

describe('sdk', () => {
  let ipfs: IpfsApi;
  let tmpFolder: any;
  let core: Ceramic;
  let daemon: CeramicDaemon;
  let sdk: SDK;

  beforeAll(async () => {
    tmpFolder = await tmp.dir({ unsafeCleanup: true });
    ipfs = await createIPFS(tmpFolder.path);
    core = await makeCeramicCore(ipfs, tmpFolder.path);
    const port = await getPort();
    const apiUrl = 'http://localhost:' + port;
    daemon = new CeramicDaemon(core, DaemonConfig.fromObject({ 'http-api': { port } }));
    await daemon.listen();

    await core.setDID(await makeDID(core, ethers.Wallet.createRandom().privateKey));
    console.log('network', process.env.ETHEREUM_RPC);

    sdk = await SDK.init({
      ceramicUrl: apiUrl,
      ethereumRpc: process.env.ETHEREUM_RPC,
      theGraphUrl: process.env.THE_GRAPH_URL,
      seed: process.env.SEED,
    });
  });

  afterAll(async () => {
    await daemon.close();
    await core.close();
    await ipfs.stop();
    await tmpFolder.cleanup();
  });

  it('should work', async () => {
    expect(sdk).toBeDefined();
  });
  describe('operator transfer', () => {
    it('fagsystem should be able to do a transfer of shares from a shareholder to an eth address', async () => {
      const matfabrikkenLegacy = selskaper[0];
      const shareholders = Object.values(users).map((user) => {
        return {
          ceramic: {
            name: user.name,
            birthDate: user.birthDate,
            postalcode: user.postalcode,
            countryCode: user.countryCode,
            ethAddress: undefined,
            identifier: user.identifier,
            identifierType: user.identifierType,
          },
          blockchain: {
            ethAddress: undefined,
            amount: '10',
            partition: 'ordinære',
          },
        };
      });

      const fullCap: CreateCapTableInput = {
        name: matfabrikkenLegacy.navn,
        orgnr: matfabrikkenLegacy.orgnr,
        shareholders: shareholders,
      };

      const res = await sdk.confirmCreateCapTable(fullCap);
      const capTableAddress = res._unsafeUnwrap().deployBlockchainRes.capTableAddress;
      expect(res.isOk()).toBeTruthy();

      const capTableDetails = await sdk.getCapTableDetails(capTableAddress);
      expect(capTableDetails.isOk()).toBeTruthy();

      const shareholderOne = capTableDetails._unsafeUnwrap().shareholders[0];
      console.log('shareholder', JSON.stringify(shareholderOne));

      const transferRes = await sdk.transfer({
        capTableAddress: capTableAddress,
        from: shareholderOne.ethAddress,
        amount: '10',
        partition: 'ordinære',
        name: 'Fredrik',
        birthDate: '01.01.2000',
        postalcode: '2600',
        countryCode: 'NO',
      });

      expect(transferRes.isOk()).toBeTruthy();
    });
  });

  describe('deploy capTable with shareholders', () => {
    beforeAll(() => {
      // jest
      //   .spyOn(CeramicSDK.prototype, 'findUsersForCapTable')
      //   .mockImplementation((capTableAddress: string): Promise<Result<ShareholderCeramic[], string>> => {
      //     return Promise.resolve(ok(ceramicShareholdersForCaptableResponse));
      //   });
      // jest
      //   .spyOn(Blockchain.prototype, 'getCapTableTheGraph')
      //   .mockImplementation((capTableAddress: string): Promise<Result<CapTableGraphQLTypes.CapTableQuery.CapTable, string>> => {
      //     return Promise.resolve(ok(capTableQueryResponse));
      //   });
    });
    describe('deploy capTable with shareholders', () => {
      it('should deploy', async () => {
        const matfabrikkenLegacy = selskaper[0];
        const shareholders = Object.values(users).map((user) => {
          return {
            ceramic: {
              name: user.name,
              birthDate: user.birthDate,
              postalcode: user.postalcode,
              countryCode: user.countryCode,
              ethAddress: undefined,
              identifier: user.identifier,
              identifierType: user.identifierType,
            },
            blockchain: {
              ethAddress: undefined,
              amount: '10',
              partition: 'ordinære',
            },
          };
        });

        const fullCap: CreateCapTableInput = {
          name: matfabrikkenLegacy.navn,
          orgnr: matfabrikkenLegacy.orgnr,
          shareholders: shareholders,
        };

        const res = await sdk.confirmCreateCapTable(fullCap);
        expect(res.isOk()).toBeTruthy();
      });
      it('should deploy capTable and all shareholders should be retriavable from ceramic', async () => {
        const matfabrikkenLegacy = selskaper[0];
        const shareholders = Object.values(users).map((user) => {
          return {
            ceramic: {
              name: user.name,
              birthDate: user.birthDate,
              postalcode: user.postalcode,
              countryCode: user.countryCode,
              ethAddress: undefined,
              identifier: user.identifier,
              identifierType: user.identifierType,
            },
            blockchain: {
              ethAddress: undefined,
              amount: '10',
              partition: 'ordinære',
            },
          };
        });

        const fullCap: CreateCapTableInput = {
          name: matfabrikkenLegacy.navn,
          orgnr: matfabrikkenLegacy.orgnr,
          shareholders: shareholders,
        };

        const res = await sdk.confirmCreateCapTable(fullCap);
        console.log('res', res._unsafeUnwrap().capTableCeramicRes);
        expect(res.isOk()).toBeTruthy();

        const findUsersFromCeramicResult = await sdk.getCapTableDetails(res._unsafeUnwrap().deployBlockchainRes.capTableAddress);
        expect(findUsersFromCeramicResult.isOk()).toBeTruthy();

        console.log('captable', findUsersFromCeramicResult);

        const namesFromDetailsRes = findUsersFromCeramicResult._unsafeUnwrap().shareholders.map((shareholder) => shareholder.name);

        expect(namesFromDetailsRes).toContainEqual('Abe Aber');
        expect(namesFromDetailsRes).toContainEqual('Carl Clay');
        expect(namesFromDetailsRes).toContainEqual('Ben');
      });
    });

    describe('Zipping the graph and ceramic data', () => {
      describe('with invalid data', () => {
        beforeAll(() => {
          const wrongData = ceramicShareholdersForCaptableResponse.map((shareholder) => {
            return { ...shareholder, ethAddress: shareholder.ethAddress + '123' };
          });
          console.log('wrong data', wrongData);
          // jest
          //   .spyOn(CeramicSDK.prototype, 'findUsersForCapTable')
          //   .mockImplementation((capTableAddress: string): Promise<Result<ShareholderCeramic[], string>> => {
          //     return Promise.resolve(ok(wrongData));
          //   });

          // jest
          //   .spyOn(Blockchain.prototype, 'getCapTableTheGraph')
          //   .mockImplementation((capTableAddress: string): Promise<Result<CapTableGraphQLTypes.CapTableQuery.CapTable, string>> => {
          //     return Promise.resolve(ok(capTableQueryResponse));
          //   });
        });
        it('should return err with error message', async () => {
          const capTableDetails = await sdk.getCapTableDetails('0x1234');
          expect(capTableDetails.isErr()).toBeTruthy();
          expect(capTableDetails._unsafeUnwrapErr().length).toBe(3);
        });
      });
      describe('with valid data', () => {
        it('should be okay and return captable details', async () => {
          const capTableDetails = await sdk.getCapTableDetails('0x1234');
          expect(capTableDetails.isOk()).toBeTruthy();
          expect(capTableDetails._unsafeUnwrap().shareholders.length).toBe(3);
        });

        it('should be able to transfer to new shareholder as boarddirector', async () => {
          const matfabrikkenLegacy = selskaper[0];
          const shareholders = Object.values(users).map((user) => {
            return {
              ceramic: {
                name: user.name,
                birthDate: user.birthDate,
                postalcode: user.postalcode,
                countryCode: user.countryCode,
                ethAddress: undefined,
                identifier: user.identifier,
                identifierType: user.identifierType,
              },
              blockchain: {
                ethAddress: undefined,
                amount: '10',
                partition: 'ordinære',
              },
            };
          });

          const fullCap: CreateCapTableInput = {
            name: matfabrikkenLegacy.navn,
            orgnr: matfabrikkenLegacy.orgnr,
            shareholders: shareholders,
          };

          const deployRes = await sdk.confirmCreateCapTable(fullCap);
          expect(deployRes.isOk()).toBeTruthy();

          const capTableDetails = await sdk.getCapTableDetails(deployRes._unsafeUnwrap().deployBlockchainRes.capTableAddress);
          expect(capTableDetails.isOk()).toBeTruthy();
          const shareholder = capTableDetails._unsafeUnwrap().shareholders[0];
          console.log('details', capTableDetails._unsafeUnwrap());
          const transferRes = await sdk.transfer({
            capTableAddress: deployRes._unsafeUnwrap().deployBlockchainRes.capTableAddress,
            from: shareholder.ethAddress,
            amount: '10',
            partition: 'ordinære',
            name: 'Fredrik',
            birthDate: '01.01.2000',
            postalcode: '2600',
            countryCode: 'NO',
          });
          console.log('transferRes', transferRes);
          expect(transferRes.isOk()).toBeTruthy();
        });
      });

      describe('Get shareholders for capTable', () => {
        it('get all shareholder tile by ethAddress and capTableAddress', async () => {
          const matfabrikkenLegacy = selskaper[0];
          const shareholders = Object.values(users).map((user) => {
            return {
              ceramic: {
                name: user.name,
                birthDate: user.birthDate,
                postalcode: user.postalcode,
                countryCode: user.countryCode,
                ethAddress: undefined,
                identifier: user.identifier,
                identifierType: user.identifierType,
              },
              blockchain: {
                ethAddress: undefined,
                amount: '10',
                partition: 'ordinære',
              },
            };
          });

          const fullCap: CreateCapTableInput = {
            name: matfabrikkenLegacy.navn,
            orgnr: matfabrikkenLegacy.orgnr,
            shareholders: shareholders,
          };

          const deployRes = await sdk.confirmCreateCapTable(fullCap);
          expect(deployRes.isOk()).toBeTruthy();

          const capTableDetails = await sdk.getCapTableDetails(deployRes._unsafeUnwrap().deployBlockchainRes.capTableAddress);
          expect(capTableDetails.isOk()).toBeTruthy();
          const shareholdersFromDetails = capTableDetails._unsafeUnwrap().shareholders;

          expect(shareholders.length).toBe(3);
        });
      });
    });
  });
});
