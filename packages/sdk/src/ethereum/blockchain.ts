import { CapTableFactory__factory, CapTableRegistry__factory, CapTable__factory, Deployments } from '@brok/captable';
import { Wallet } from '@ethersproject/wallet';
import { BigNumber, ContractReceipt, ethers } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { TokenHoldersGraphQLTypes } from '../ethereum/utils/TokenHoldersGraphQL.utils';
import { getCapTable, getTokenHolder, listCapTables } from './thegraph';
import { CapTableGraphQLTypes, CapTableQueryResponse } from './utils/CapTableGraphQL.utils';
const debug = require('debug')('brok:sdk:blockchain');

export interface DeployCapTableResult {
  capTableAddress: string;
  deployTranscactionHash: string;
}

export interface SaveCapTableResult {
  success: boolean;
  error?: string;
  capTableUri?: string;
}

export interface CreateCapTableResult {
  deployBlockchainRes: DeployCapTableResult;
  capTableCeramicRes: SaveCapTableResult;
}

export class Blockchain {
  constructor(readonly signer: Wallet, readonly theGraphUrl: string) {}

  async deployCapTable(name: string, orgnr: string, addresses: string[], amounts: string[]): Promise<Result<DeployCapTableResult, string>> {
    try {
      const deployTX = await this.capTableFactory().createCapTable(name, orgnr, addresses, amounts);
      const reciept = await deployTX.wait();
      const capTableAddress = this.getDeployedCapTableFromEventReceipt(reciept);
      if (capTableAddress.isOk()) {
        return ok({
          capTableAddress: capTableAddress.value.toLowerCase(),
          deployTranscactionHash: reciept.transactionHash,
        });
      } else {
        return err(capTableAddress.error);
      }
    } catch (error) {
      
      debug("deployCapTable failed", error.message);
      return err(`Could not deploy capTable`);
    }
  }

  async deleteCapTable(capTableAddress: string) {
    try {
      const capTableStatus = await this.capTableRegistryContract().getStatus(capTableAddress);
      if (capTableStatus.toNumber() !== 2) return err(`CapTable must be active in order to be removed. Status is now: ${capTableStatus.toNumber()}`);
      const deleteCapTable = await this.capTableRegistryContract().remove(capTableAddress);
      const tx = await deleteCapTable.wait();
      return ok({
        transactionHash: tx.transactionHash,
      });
    } catch (error) {
      debug('capTable removal failed with error:', error);
      return err(`Could not delete capTable. Error: ${error}`);
    }
  }

  async operatorTransfer(from: string, to: string, amount: string, capTableAddress: string, partition: string) {
    try {
      const balance = await this.captableContract(capTableAddress).balanceOfByPartition(ethers.utils.formatBytes32String(partition), from);
      if (BigNumber.from(amount).gt(balance)) throw Error(`Balance is insufficient for transfer of ${amount}`);

      const operatorTransferTX = await this.captableContract(capTableAddress).operatorTransferByPartition(
        ethers.utils.formatBytes32String(partition),
        from,
        to,
        ethers.utils.parseUnits(ethers.utils.formatEther(amount)),
        '0x11',
        ethers.utils.formatBytes32String('OperatorTransfer'),
      );
      const reciept = await operatorTransferTX.wait();
      return ok({
        transactionHash: reciept.transactionHash,
      });
    } catch (e) {
      debug('operatorTransfer failed with error:', e);
      return err(`Could not do operatorTransfer: Error: ${e}`);
    }
  }

  async getCapTableTheGraph(capTableAddress: string): Promise<Result<CapTableGraphQLTypes.CapTableQuery.CapTable, string>> {
    return this.getCapTableWithShareholders(capTableAddress);
  }

  getDeployedCapTableFromEventReceipt(receipt: ContractReceipt): Result<string, string> {
    // Get correct event using event signature
    const eventSignature = 'NewCapTable(string,address)';
    const eventFingerprint = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(eventSignature));
    const address = receipt.logs.filter((log) => log.topics[0] === eventFingerprint).map((log) => log.address);
    if (address.length > 0) {
      return ok(address[0]);
    } else {
      return err('Could not find capTable address for deployed capTable from logs. Could be empty contract');
    }
  }

  // The Graph
  async getTokenHolder(capTableAddress: string): Promise<Result<TokenHoldersGraphQLTypes.TokenHolderQuery.TokenHolder, string>> {
    return getTokenHolder(this.theGraphUrl, capTableAddress);
  }

  // The Graph
  async getCapTableWithShareholders(capTableAddress: string): Promise<Result<CapTableGraphQLTypes.CapTableQuery.CapTable, string>> {
    return getCapTable(this.theGraphUrl, capTableAddress).map((res) => res.capTable);
  }

  async listCapTables(orgnr: string, name: string): Promise<Result<CapTableQueryResponse, string>> {
    return listCapTables(this.theGraphUrl, orgnr, name);
  }

  async getAllCapTables() {
    const BROK_ENVIRONMENT = process.env.BROK_ENVIRONMENT;
    if (!BROK_ENVIRONMENT) throw Error('Please set BROK_ENVIRONMENT');
    return new CapTableRegistry__factory(this.signer).attach(Deployments[BROK_ENVIRONMENT].contracts.CapTableRegistry.address).getList();
  }

  capTableFactory() {
    const BROK_ENVIRONMENT = process.env.BROK_ENVIRONMENT;
    if (!BROK_ENVIRONMENT) throw Error('Please set BROK_ENVIRONMENT');
    return new CapTableFactory__factory(this.signer).attach(Deployments[BROK_ENVIRONMENT].contracts.CapTableFactory.address);
  }

  capTableRegistryContract() {
    const BROK_ENVIRONMENT = process.env.BROK_ENVIRONMENT;
    if (!BROK_ENVIRONMENT) throw Error('Please set BROK_ENVIRONMENT');
    return new CapTableRegistry__factory(this.signer).attach(Deployments[BROK_ENVIRONMENT].contracts.CapTableRegistry.address);
  }

  captableContract(address: string) {
    return new CapTable__factory(this.signer).attach(address);
  }

  createRandomWallet() {
    return ethers.Wallet.createRandom();
  }
}
