import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ethers } from 'ethers';
import {  err, ok, Result } from 'neverthrow';
import { CeramicSDK } from './ceramic/ceramic';
import { makeDID } from './ceramic/make-did';
import { Blockchain, CreateCapTableResult } from './ethereum/blockchain';
import { CapTableGraphQLTypes } from './ethereum/utils/CapTableGraphQL.utils';
import {
  CapTableCeramic,
  CapTableDetails,
  CreateCapTableInput,
  CreateCapTableRequestInput,
  OperatorTransferExistingShareholderInput,
  OperatorTransferNewShareholderInput,
  BlockchainOperationResponse,
  Shareholder,
  ShareholderCeramic,
  ShareholderRequest,
  ShareholderUnion,
} from './types';


export class SDK {
  private constructor(private blockchain: Blockchain, private ceramic: CeramicSDK) {}

  public static async init(config: { ceramicUrl: string; ethereumRpc: string; theGraphUrl: string; seed: string }) {
    const signer = await this.initWallet(config.ethereumRpc, config.seed);
    if (signer.isErr()) throw Error(signer.error);
    const ceramic = new CeramicSDK(config.ceramicUrl);
    const blockchain = new Blockchain(signer.value, config.theGraphUrl);

    await ceramic.setDID(await makeDID(ceramic, signer.value.privateKey));

    console.log("pk", signer.value.privateKey)
    console.log("seed", config.seed)
    console.log("DID", ceramic.did.id);
    return new SDK(blockchain, ceramic);
  }

  private static async initWallet(rpc: string, seed: string) {
    try {
      const provider = new JsonRpcProvider(rpc);
      return ok(Wallet.fromMnemonic(seed).connect(provider));
    } catch (e) {
      console.log('Could not init wallet. Error message:', e);
      return err(`COuld not init wallet. Error: ${e} `);
    }
  }

  parseShareholders(shareholders: ShareholderRequest[]): Shareholder[] {
    return shareholders.map((shareholder) => {
      const newAddress = this.blockchain.createRandomWallet().address.toLowerCase();
      return {
        blockchain: {
          ...shareholder.blockchain,
          ethAddress: newAddress,
        },
        ceramic: {
          ...shareholder.ceramic,
          ethAddress: newAddress,
        },
      };
    });
  }

  async confirmCreateCapTable(capTableRequestData: CreateCapTableRequestInput): Promise<Result<CreateCapTableResult, string>> {
    const capTableData = {
      ...capTableRequestData,
      shareholders: this.parseShareholders(capTableRequestData.shareholders),
    };
    // Check for existing capTable in registry
    try {
      const existingCapTableAddress = await this.blockchain.capTableRegistryContract().getAddress(capTableData.orgnr);
      if (existingCapTableAddress !== ethers.constants.AddressZero) {
        return err(`CapTable with orgnr ${capTableData.orgnr} allready exist`);
      }
    } catch (error) {
      return err('Could not check if captable exist in registry');
    }

    // TODO implement error handling and be meet ACID and this validityCheck function
    const isValid = this.validityCheck(capTableData);

    if (!isValid) {
      return err('Invalid input for capTable creation');
    } else {
      // 1. Do blockchain deploy
      const addresses: string[] = [];
      const amounts: string[] = [];

      for await (const shareholder of capTableData.shareholders) {
        addresses.push(shareholder.blockchain.ethAddress);
        amounts.push(shareholder.blockchain.amount);
      }

      const deployedCapTableResult = await this.blockchain.deployCapTable(capTableData.name, capTableData.orgnr, addresses, amounts);

      if (deployedCapTableResult.isErr()) {
        return err(`CapTable deploy failed. Reason: ${deployedCapTableResult.error}`);
      }
      try {
        // eslint-disable-next-line max-len
        const isFagsystem = await this.blockchain
          .capTableRegistryContract()
          .hasRole(ethers.utils.solidityKeccak256(['string'], ['FAGSYSTEM']), this.blockchain.signer.address);
        if (!isFagsystem) {
          return err('Must be fagsystem to deploy cap table');
        }
        const approveRes = await this.blockchain.capTableRegistryContract().approve(deployedCapTableResult.value.capTableAddress);
        await approveRes.wait();
      } catch (error) {
        if (error instanceof Error) {
          return err(error.message);
        }
        return err('Could not approve captable');
      }

      // 2. Insert shareholder public data on Ceramic
      const shareholderCeramicUrisWithEthAddress: Record<string, string> = {};
      const errors: string[] = [];

      for await (const shareholder of capTableData.shareholders) {
        const ceramicUri = await this.ceramic.insertPublicUserData(shareholder.ceramic);
        if (ceramicUri.isErr()) {
          errors.push(ceramicUri.error);
        } else {
          shareholderCeramicUrisWithEthAddress[shareholder.blockchain.ethAddress] = ceramicUri.value;
        }
      }

      // 3. Insert captable data on Ceramic for referencing eth address -> ceramic uri
      const deployedCapTableAddress = deployedCapTableResult.value.capTableAddress;
      const ceramicCapTable: CapTableCeramic = {
        orgnr: capTableData.orgnr,
        name: capTableData.name,
        shareholdersEthAddressToCeramicUri: shareholderCeramicUrisWithEthAddress,
      };

      const saveCeramicCapTableRes = await this.ceramic.insertCapTableData(deployedCapTableAddress, ceramicCapTable);

      if (saveCeramicCapTableRes.isErr()) {
        const errorMessage = `Save capTableData on ceramic failed. Reason, ${saveCeramicCapTableRes.error}`;
        return ok({
          capTableCeramicRes: {
            success: false,
            error: errorMessage,
          },
          deployBlockchainRes: deployedCapTableResult.value,
        });
      } else {
        return ok({
          capTableCeramicRes: {
            success: true,
            capTableUri: saveCeramicCapTableRes.value.id.toString(),
          },
          deployBlockchainRes: deployedCapTableResult.value,
        });
      }
    }
  }

  // This only set status of the given capTable to REMOVED in the CapTableRegistry. Everything else will persist
  async deleteCapTable(capTableAddress: string): Promise<Result<BlockchainOperationResponse, string>> {
    if (!ethers.utils.isAddress(capTableAddress)) return err('CapTable address is not valid');
    const deleteCapTableRes = await this.blockchain.deleteCapTable(capTableAddress);
    if (deleteCapTableRes.isOk()) {
      return ok({ transactionHash: deleteCapTableRes.value.transactionHash, success: true });
    } else {
      return err(deleteCapTableRes.error);
    }
  }

  async transferToNewShareholder(transferInput: OperatorTransferNewShareholderInput): Promise<Result<BlockchainOperationResponse, string>> {
    if (!ethers.utils.isAddress(transferInput.capTableAddress)) return err('CapTable address is not valid');
    if (!ethers.utils.isAddress(transferInput.from)) return err('from address is not valid');
    if (!(parseInt(transferInput.amount, 10) > 0)) return err('not a valid amount. Must be greater than 0');
    const ceramicCapTable = await this.ceramic.getPublicCapTableByCapTableAddress(transferInput.capTableAddress, 'TODO');
    if (ceramicCapTable.isErr()) return err(`Could not get ceramic captable for address ${transferInput.capTableAddress}`);

    // create wallet for user
    const address = ethers.Wallet.createRandom().address.toLocaleLowerCase();

    // Do shareholder transfer on blockchain after ceramic is successful

    const transferRes = await this.blockchain.operatorTransfer(
      transferInput.from,
      address,
      transferInput.amount,
      transferInput.capTableAddress,
      transferInput.partition,
    );

    if (transferRes.isErr()) {
      return err(transferRes.error);
    }

    // insert public data on ceramic
    const shareholderCeramic: ShareholderCeramic = {
      name: transferInput.name,
      countryCode: transferInput.countryCode,
      ethAddress: address,
      postalcode: transferInput.postalcode,
      birthDate: transferInput.birthDate,
      organizationIdentifier: transferInput.organizationIdentifier,
      organizationIdentifierType: transferInput.organizationIdentifierType,
    };

    const shareholderCeramicDataRes = await this.insertPublicUserData(shareholderCeramic);
    if (shareholderCeramicDataRes.isErr()) {
      return ok({ success: false, messages: 'Transfer is successful. Ceramic failed', transactionHash: transferRes.value.transactionHash });
    }

    const shareholderCeramicUri = shareholderCeramicDataRes.value;

    // update capTable tile on ceramic with mappings ethaddress -> ceramic uri
    const capTableEthAddressToCeramicUri = ceramicCapTable.value.content.shareholdersEthAddressToCeramicUri;
    capTableEthAddressToCeramicUri[shareholderCeramic.ethAddress] = shareholderCeramicUri;

    const updatedPublicCapTable = {
      ...ceramicCapTable.value.content,
      shareholdersEthAddressToCeramicUri: capTableEthAddressToCeramicUri,
    };

    const updatedCapTableCeramicRes = await this.ceramic.insertCapTableData(transferInput.capTableAddress, updatedPublicCapTable);

    if (updatedCapTableCeramicRes.isErr()) {
      return ok({ success: false, messages: 'Transfer is successful. Ceramic failed', transactionHash: transferRes.value.transactionHash });
    } else {
      return ok({ success: true, messages: 'Transfer and ceramic data failed', transactionHash: transferRes.value.transactionHash });
    }
  }

  async transferToExistingShareholder(transferInput: OperatorTransferExistingShareholderInput): Promise<Result<BlockchainOperationResponse, string>> {
    if (!ethers.utils.isAddress(transferInput.capTableAddress)) return err('CapTable address is not valid');
    if (!ethers.utils.isAddress(transferInput.to) && transferInput.to !== undefined) return err('to address is not valid');
    if (!ethers.utils.isAddress(transferInput.from)) return err('from address is not valid');
    if (!(parseInt(transferInput.amount, 10) > 0)) return err('not a valid amount. Must be greater than 0');
    //1 . recipient should already be a shareholder on capTable. Lets check this
    // has public data for capTable (must have in order to be a shareholder)
    const publicUserData = await this.findUserForCapTable(transferInput.capTableAddress, transferInput.to);

    if (publicUserData.isErr()) {
      return err(publicUserData.error);
    } else {
      // 2. We have ceramic recipient for user already,so lets transfer
      const transferRes = await this.blockchain.operatorTransfer(
        transferInput.from,
        transferInput.to,
        transferInput.amount,
        transferInput.capTableAddress,
        transferInput.partition,
      );

      console.log('transfer res', transferRes);
      if (transferRes.isErr()) {
        return err(transferRes.error);
      } else {
        return ok({ success: true, transactionHash: transferRes.value.transactionHash });
      }
    }
  }

  async transfer(
    transferInput: OperatorTransferExistingShareholderInput | OperatorTransferNewShareholderInput,
  ): Promise<Result<BlockchainOperationResponse, string>> {
    console.log('Transfer input', transferInput);
    if ('to' in transferInput) {
      return await this.transferToExistingShareholder(transferInput);
    } else {
      return await this.transferToNewShareholder(transferInput);
    }
  }

  async getCapTableDetails(capTableAddress: string) {
    const capTableGraphData = await this.blockchain.getCapTableTheGraph(capTableAddress);
    if (capTableGraphData.isErr()) throw new Error(capTableGraphData.error);
    console.log("getCapTableDetails", capTableGraphData)
    const capTableFagsystemDid = capTableGraphData.value.fagsystemDid;
    const capTableCeramicData = await this.ceramic.findUsersForCapTable(capTableAddress, capTableFagsystemDid);
    if (capTableCeramicData.isErr()) throw new Error(capTableCeramicData.error);
    const merged = this.mergeTheGraphWithCeramic(capTableGraphData.value, capTableCeramicData.value);
    return merged;
  }

  async findUserForCapTable(capTableAddress: string, userEthAddress: string) {
    return await this.ceramic.findUserForCapTable(capTableAddress, userEthAddress);
  }

  async insertPublicUserData(shareholderCeramic: ShareholderCeramic) {
    return await this.ceramic.insertPublicUserData(shareholderCeramic);
  }

  async updatePublicUserData(streamId: string, shareholderCeramic: ShareholderCeramic): Promise<Result<string, string>> {
    const res = await this.ceramic.updateContent(streamId, { shareholder: shareholderCeramic });
    return res;
  }

  async updateCeramicData(capTableAddress: string, newData: ShareholderCeramic): Promise<Result<string, string>> {
    const shareholderTile = await this.findUserForCapTable(capTableAddress, newData.ethAddress);
    if (shareholderTile.isErr()) return err(shareholderTile.error);
    else {
      return this.updatePublicUserData(shareholderTile.value.id.toString(), newData);
    }
  }

  validityCheck(capTableData: CreateCapTableInput) {
    return true;
  }

  async listCapTables(orgnr?: string, name?: string) {
    return this.blockchain.listCapTables(orgnr, name);
  }

  private mergeTheGraphWithCeramic(
    capTableTheGraph: CapTableGraphQLTypes.CapTableQuery.CapTable,
    shCeramic: ShareholderCeramic[],
  ): Result<CapTableDetails, string[]> {
    const messages = [];
    const capTable = {
      name: capTableTheGraph.name,
      orgnr: capTableTheGraph.orgnr,
      partitions: capTableTheGraph.partitions,
      status: capTableTheGraph.status,
      fagsystem: capTableTheGraph.fagsystem,
      totalSupply: capTableTheGraph.totalSupply,
      owner: capTableTheGraph.owner,
    };

    const ceramicShareholders: Map<string, ShareholderCeramic> = new Map(shCeramic.map((sh) => [sh.ethAddress, sh]));
    const theGraphShareholders: Map<string, CapTableGraphQLTypes.CapTableQuery.Balance[]> = new Map(
      capTableTheGraph.tokenHolders.map((sh) => [sh.address, sh.balances]),
    );

    const shareholders: ShareholderUnion[] = [];

    for (const [address, theGraphSh] of theGraphShareholders.entries()) {
      const ceramicShareholder = ceramicShareholders.get(address);

      if (!ceramicShareholder) {
        const error = `Ceramic shareholder with address:${address} could not be found in ceramic`;
        console.debug(error);
        messages.push(error);
      }

      shareholders.push({
        ...ceramicShareholder,
        balances: theGraphSh,
      });
    }

    if (messages.length > 0) {
      console.debug(
        'merging data from thegraph with ceramic caused some messages. Could possible not match between ceramic and thegraph. Messages:',
        JSON.stringify(messages),
      );
    }

    return ok({
      ...capTable,
      shareholders,
    });
  }
}
