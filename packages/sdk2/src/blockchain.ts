import { CapTableFactory, CapTableFactory__factory, CapTableRegistry, CapTableRegistry__factory, Deployments } from '@brok/captable';
import debug from 'debug';
import { ContractReceipt, ethers, Wallet } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { CapTableEthereumId } from './types';

export type ACCEPTED_BROK_ENVIROMENTS = 'brokLocal' | 'brokDev' | 'brokTest' | 'brokProd';

export class BlockchainSDK {
  private static logger = debug('brok:sdk:blockchain');
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

  async deployCapTable(input: { name: string; orgnr: string; addresses: string[]; amounts: string[] }): Promise<Result<CapTableEthereumId, string>> {
    try {
      const { name, orgnr, addresses, amounts } = input;
      const deployTX = await this.capTableFactory().createCapTable(name, orgnr, addresses, amounts);
      const reciept = await deployTX.wait();
      const capTableAddress = this.getDeployedCapTableFromEventReceipt(reciept);
      if (capTableAddress.isOk()) {
        return ok(capTableAddress.value.toLowerCase());
      } else {
        return err(capTableAddress.error);
      }
    } catch (error) {
      BlockchainSDK.logger(error);
      return err(`Error while deploying captable ${input.name} on blockchain, input was`);
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
        BlockchainSDK.logger('Address array was:', address);
        return err('Could not find capTable address for deployed capTable from logs. Could be empty contract');
      }
    } catch (error) {
      BlockchainSDK.logger(error);
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
