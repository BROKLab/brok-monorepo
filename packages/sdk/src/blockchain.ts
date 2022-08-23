import {
  CapTableFactory,
  CapTableFactory__factory,
  CapTableRegistry,
  CapTableRegistry__factory,
  CapTable__factory,
  Deployments,
} from '@brok/captable';
import debug from 'debug';
import { ContractReceipt, ethers, Wallet } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { CapTableEthereumId, TransferRequest } from './types';

export type ACCEPTED_BROK_ENVIROMENTS = 'brokLocal' | 'brokDev' | 'brokTest' | 'brokProd';
const log = debug('brok:sdk:blockchain');

export class BlockchainSDK {
  private BROK_ENVIRONMENT: ACCEPTED_BROK_ENVIROMENTS;
  constructor(readonly signer: Wallet, readonly theGraphUrl: string, brokEnviroment: string) {
    if (!BlockchainSDK.acceptedEnviroment(brokEnviroment)) {
      throw Error('Please set env variable BROK_ENVIRONMENT to one of the following: brokLocal, brokDev, brokTest, brokProd');
    }
    this.BROK_ENVIRONMENT = brokEnviroment;
  }

  createRandomWallet(): Wallet {
    return ethers.Wallet.createRandom();
  }

  private captableContract(address: string) {
    return new CapTable__factory(this.signer).attach(address);
  }
  async operatorTransfer(capTableAddress: string, transferRequest: TransferRequest): Promise<Result<{ transactionHash: string }, string>> {
    try {
      const balance = await this.captableContract(capTableAddress).balanceOfByPartition(
        ethers.utils.formatBytes32String(transferRequest.partition),
        transferRequest.from,
      );
      if (ethers.BigNumber.from(transferRequest.amount).gt(balance)) {
        return err(`Balance ${balance.toString()}for address ${transferRequest.from} is insufficient for transfer of ${transferRequest.amount}`);
      }

      const operatorTransferTX = await this.captableContract(capTableAddress).operatorTransferByPartition(
        ethers.utils.formatBytes32String(transferRequest.partition),
        transferRequest.from,
        transferRequest.to,
        ethers.utils.parseEther(transferRequest.amount),
        '0x11',
        '0x',
      );
      const reciept = await operatorTransferTX.wait();
      return ok({
        transactionHash: reciept.transactionHash,
      });
    } catch (e) {
      log('operatorTransfer failed with error:', e);
      return err(
        `Error while transferring ${transferRequest.amount} from ${transferRequest.from} to ${transferRequest.to} on capTable ${capTableAddress}`,
      );
    }
  }

  async deployCapTable(input: { name: string; orgnr: string; addresses: string[]; amounts: string[] }): Promise<Result<CapTableEthereumId, string>> {
    try {
      const { name, orgnr, addresses, amounts } = input;
      const deployTX = await this.capTableFactory().createCapTable(
        name,
        orgnr,
        addresses,
        amounts.map((a) => ethers.utils.parseEther(a)),
      );
      const reciept = await deployTX.wait();
      const capTableAddress = this.getDeployedCapTableFromEventReceipt(reciept);
      if (capTableAddress.isOk()) {
        return ok(capTableAddress.value.toLowerCase());
      } else {
        return err(capTableAddress.error);
      }
    } catch (error) {
      log(error);
      return err(`Error while deploying captable ${input.name} on blockchain, input was`);
    }
  }

  async deleteCapTable(capTableAddress: string) {
    try {
      const capTableStatus = await this.capTableRegistryContract().getStatus(capTableAddress);
      if (capTableStatus.toNumber() !== 2) {
        return err(`CapTable must be active in order to be removed. Status is now: ${capTableStatus.toNumber()}`);
      }
      const deleteCapTable = await this.capTableRegistryContract().remove(capTableAddress);
      const tx = await deleteCapTable.wait();
      return ok({
        transactionHash: tx.transactionHash,
      });
    } catch (error) {
      log('capTable removal failed with error:', error);
      return err(`Could not delete capTable ${capTableAddress}`);
    }
  }

  private getDeployedCapTableFromEventReceipt(receipt: ContractReceipt): Result<string, string> {
    try {
      // Get correct event using event signature
      const eventSignature = 'NewCapTable(string,address)';
      const eventFingerprint = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(eventSignature));
      const address = receipt.logs.filter((log) => log.topics[0] === eventFingerprint).map((log) => log.address);
      if (address && Array.isArray(address) && address.length > 0 && typeof address[0] === 'string' && address[0].length > 0) {
        return ok(address[0]);
      } else {
        log('Address array was:', address);
        return err('Could not find capTable address for deployed capTable from logs. Could be empty contract');
      }
    } catch (error) {
      log(error);
      return err(`Error while getting deployed capTable from event receipt ${receipt}`);
    }
  }

  capTableFactory(): CapTableFactory {
    if (!BlockchainSDK.acceptedEnviroment(this.BROK_ENVIRONMENT)) {
      throw Error('Please set env variable BROK_ENVIRONMENT');
    }
    return new CapTableFactory__factory(this.signer).attach(
      Deployments[this.BROK_ENVIRONMENT as keyof typeof Deployments].contracts.CapTableFactory.address,
    );
  }

  capTableRegistryContract() {
    if (!BlockchainSDK.acceptedEnviroment(this.BROK_ENVIRONMENT)) {
      throw Error('Please set env variable BROK_ENVIRONMENT');
    }
    return new CapTableRegistry__factory(this.signer).attach(
      Deployments[this.BROK_ENVIRONMENT as keyof typeof Deployments].contracts.CapTableRegistry.address,
    ) as CapTableRegistry;
  }

  private static acceptedEnviroment(value: string): value is ACCEPTED_BROK_ENVIROMENTS {
    return ['brokLocal', 'brokDev', 'brokTest', 'brokProd'].includes(value);
  }
}
