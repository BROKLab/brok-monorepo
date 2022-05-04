import { SDK, ShareholderCeramic } from '@brok/sdk';
import { Wallet } from '@ethersproject/wallet';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { err, ok } from 'neverthrow';
import { DbService } from '../auth/db.service';
import {
  CreateCapTableWithBoardDirectorAddress,
  TransferWithLoggedInUser,
} from './../types';

@Injectable()
export class CapTableService {
  private sdk: SDK;
  private wallet: Wallet;
  constructor(
    private configService: ConfigService,
    private dbService: DbService,
  ) {}

  async onModuleInit() {
    const ceramicUrl = this.configService.get('CERAMIC_URL');
    const seed = this.configService.get('SEED');
    const rpc = this.configService.get('ETHEREUM_RPC');
    const theGraphUrl = this.configService.get('THE_GRAPH_URL');
    console.log('ceramicUrl', ceramicUrl);

    this.sdk = await SDK.init({
      ceramicUrl: ceramicUrl,
      seed: seed,
      ethereumRpc: rpc,
      theGraphUrl: theGraphUrl,
    });
  }

  async createCapTable(input: CreateCapTableWithBoardDirectorAddress) {
    try {
      const res = await this.sdk.confirmCreateCapTable(input.capTableInput);
      if (res.isErr()) return err(res.error);

      await this.dbService.saveBdAddressToCapTableAddress(
        input.loggedInUserAddress,
        res.value.deployBlockchainRes.capTableAddress,
      );
      return ok(res.value);
    } catch (error) {
      return err(error);
    }
  }

  async deleteCapTable(address: string) {
    return await this.sdk.deleteCapTable(address);
  }

  async operatorTransfer(
    loggedInUserWithOperatorTransfer: TransferWithLoggedInUser,
  ) {
    const capTableWithBoardDirector =
      await this.dbService.findCapTableByAddress(
        loggedInUserWithOperatorTransfer.transfer.capTableAddress,
      );

    if (
      capTableWithBoardDirector.boardDirectorAddress !==
      loggedInUserWithOperatorTransfer.loggedInUserAddress
    )
      return err('Logged in user is not the same as the user that migrated');

    return await this.sdk.transfer(loggedInUserWithOperatorTransfer.transfer);
  }

  async getCapTableDetails(capTableAddress: string) {
    return await this.sdk.getCapTableDetails(capTableAddress);
  }

  async getCapTableShareholders(capTableAddress: string) {
    return await this.sdk.getCapTableDetails(capTableAddress);
  }

  async getPublicUserData(capTableAddress: string, userEthAddress: string) {
    return await this.sdk.findUserForCapTable(capTableAddress, userEthAddress);
  }

  async listCapTables(orgnr = '', name = '') {
    return await this.sdk.listCapTables(orgnr, name);
  }

  async updateShareholderCeramic(
    capTableAddress: string,
    updated: ShareholderCeramic,
    userAddress: string,
  ) {
    const capTableWithBoardDirector =
      await this.dbService.findCapTableByAddress(capTableAddress);

    if (capTableWithBoardDirector.boardDirectorAddress !== userAddress)
      return err('Logged in user is not the same as the user that migrated');

    return await this.sdk.updateCeramicData(capTableAddress, updated);
  }
}
