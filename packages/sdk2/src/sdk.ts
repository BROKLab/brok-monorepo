import { ethers, providers, Wallet } from 'ethers';
import { err, ok } from 'neverthrow';
import { BlockchainSDK } from './blockchain.js';
import { _createCapTable, _getCapTable, _transfer, _deleteCapTable, _updateShareholder } from './capTable.js';
import { CeramicSDK } from './ceramic.js';
import {
  CapTable,
  CapTableEthereumId,
  CreateCapTableInput,
  EthereumAddress,
  OperationResult,
  Shareholder,
  TransferInput,
  TransferRequest,
} from './types.js';
import { getDIDfromPrivateKey } from './utils/did.js';
import debug from 'debug';

export class SDK {
  protected _createCapTable = _createCapTable;
  protected _getCapTable = _getCapTable;
  protected _transfer = _transfer;
  protected _deleteCapTable = _deleteCapTable;
  protected _updateShareholder = _updateShareholder;
  private constructor(protected blockchain: BlockchainSDK, protected ceramic: CeramicSDK) {}

  public static async init(config: { ceramicUrl: string; ethereumRpc: string; theGraphUrl: string; secret: string; env: string }): Promise<SDK> {
    try {
      const signer = await SDK.initWallet(config.ethereumRpc, config.secret);
      if (signer.isErr()) {
        throw Error(signer.error);
      }
      const ceramic = new CeramicSDK(config.ceramicUrl);
      const blockchain = new BlockchainSDK(signer.value, config.theGraphUrl, config.env);
      const did = await getDIDfromPrivateKey(signer.value.privateKey);
      if (did.isErr()) {
        throw Error(did.error);
      }
      await ceramic.setDID(did.value);
      if (!ceramic.did) {
        throw Error('Could not set DID');
      }
      debug('brok:sdk:main')('SDK address', signer.value.address);
      debug('brok:sdk:main')('SDK did', ceramic.did.id);
      return new SDK(blockchain, ceramic);
    } catch (e) {
      debug('brok:sdk:main')('Could not init SDK. Error message:', e);
      throw Error(`Could not init SDK. Error: ${e}`);
    }
  }

  async close() {
    await this.ceramic.close();
  }

  async createCapTable(input: CreateCapTableInput): Promise<string> {
    const res = await this._createCapTable(input);
    if (res.isErr()) {
      throw Error(res.error);
    }
    return res.value;
  }

  async getCapTable(capTableAddress: EthereumAddress): Promise<CapTable> {
    const res = await this._getCapTable(capTableAddress);
    if (res.isErr()) {
      throw Error(res.error);
    }
    return res.value;
  }

  async transfer(capTableAddress: CapTableEthereumId, transfers: TransferInput[]): Promise<(OperationResult & TransferRequest)[]> {
    const res = await this._transfer(capTableAddress, transfers);
    if (res.isErr()) {
      throw Error(res.error);
    }
    return res.value;
  }
  async deleteCapTable(capTableAddress: CapTableEthereumId): Promise<boolean> {
    const res = await this._deleteCapTable(capTableAddress);
    if (res.isErr()) {
      throw Error(res.error);
    }
    return res.value;
  }
  async updateShareholder(capTableAddress: CapTableEthereumId, shareholder: Partial<Shareholder>): Promise<Shareholder> {
    const res = await this._updateShareholder(capTableAddress, shareholder);
    if (res.isErr()) {
      throw Error(res.error);
    }
    return res.value;
  }

  // private
  private static async initWallet(rpc: string, secret: string) {
    try {
      const provider = new providers.JsonRpcProvider(rpc);
      const signer = ethers.utils.isHexString(secret) ? new Wallet(secret, provider) : Wallet.fromMnemonic(secret).connect(provider);
      return ok(signer);
    } catch (e) {
      debug('brok:sdk:main')('Could not init wallet. Error message:', e);
      return err(`COuld not init wallet. Error: ${e} `);
    }
  }
}
