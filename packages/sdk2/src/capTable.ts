import { ethers } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { SDK } from './sdk.js';
import { getCapTableGraph } from './theGraph.js';
import { CeramicId, CreateCapTableInput, EthereumAddress } from './types.js';
import debug from 'debug';

export async function createCapTableSafe(this: SDK, input: CreateCapTableInput): Promise<Result<string, string>> {
  const log = debug('brok:sdk:captable');
  try {
    const shareholders = input.shareholders.map((shareholder) => ({
      ...shareholder,
      ethAddress: this.blockchain.createRandomWallet().address.toLowerCase(),
    }));
    // Check for existing capTable in registry
    try {
      const existingCapTableAddress = await this.blockchain.capTableRegistryContract().getAddress(input.orgnr);
      if (existingCapTableAddress !== ethers.constants.AddressZero) {
        return err(`CapTable with orgnr ${input.orgnr} already exists`);
      }
    } catch (error) {
      log(error);
      return err('Could not check if captable exist in registry');
    }
    // Check is fagsystem
    try {
      const isFagsystem = await this.blockchain
        .capTableRegistryContract()
        .hasRole(ethers.utils.solidityKeccak256(['string'], ['FAGSYSTEM']), this.blockchain.signer.address);
      if (!isFagsystem) {
        log(`Current signer (${this.blockchain.signer.address})does not have role fagsystem`);
        return err('Your signer does NOT have role fagsystem. Must be fagsystem to deploy cap table');
      }
    } catch (error) {
      log(error);
      return err('Could not check if your signer had role fagsystem');
    }
    // 1. Deploy captable on blockchain
    const addresses: string[] = [];
    const amounts: string[] = [];

    for await (const shareholder of shareholders) {
      addresses.push(shareholder.ethAddress);
      amounts.push(shareholder.amount);
    }
    const deployedCapTableResult = await this.blockchain.deployCapTable({
      addresses: addresses,
      amounts: amounts,
      name: input.name,
      orgnr: input.orgnr,
    });
    if (deployedCapTableResult.isErr()) {
      return err(deployedCapTableResult.error);
    }
    // 2. Insert shareholder public data on Ceramic
    const shareholderEthToCeramic: Record<EthereumAddress, CeramicId> = {};

    for await (const shareholder of shareholders) {
      const ceramicId = await this.ceramic.createShareholder(shareholder);
      if (ceramicId.isErr()) {
        return err(ceramicId.error);
      } else {
        shareholderEthToCeramic[shareholder.ethAddress] = ceramicId.value;
      }
    }

    // 3. Insert captable data on Ceramic for referencing eth address -> ceramic uri
    const ceramicCapTableRes = await this.ceramic.createCapTable({
      data: {
        orgnr: input.orgnr,
        name: input.name,
        shareholderEthToCeramic,
      },
      capTableAddress: deployedCapTableResult.value,
      capTableRegistryAddress: this.blockchain.capTableRegistryContract().address,
    });
    if (ceramicCapTableRes.isErr()) {
      return err(ceramicCapTableRes.error);
    }

    // X. Approve cap table on the blockchain
    try {
      const approveRes = await this.blockchain.capTableRegistryContract().approve(deployedCapTableResult.value);
      await approveRes.wait();
    } catch (error) {
      log(error);
      return err('Could not approve captable');
    }

    return ok(deployedCapTableResult.value);
  } catch (error) {
    log(error);
    return err('Something unknown went wrong when creating the cap table. See logs or contact administrator.');
  }
}

export async function getCapTableSafe(this: SDK, capTableAddress: EthereumAddress): Promise<Result<unknown, string>> {
  try {
    const log = debug('brok:sdk:captable');
    const capTableGraphData = await getCapTableGraph(this.blockchain.theGraphUrl, capTableAddress);
    if (capTableGraphData.isErr()) {
      return err(capTableGraphData.error);
    }
    const capTableFagsystemDid = capTableGraphData.value.fagsystemDid;
    log('Getting ceramic');
    const capTableCeramicData = await this.ceramic.getCapTable({
      capTableAddress: capTableAddress,
      capTableRegistryAddress: this.blockchain.capTableRegistryContract().address,
      fagsystemDID: capTableFagsystemDid,
    });
    if (capTableCeramicData.isErr()) {
      return err(capTableCeramicData.error);
    }
    log('ceramic', capTableCeramicData.value);
    return ok(capTableGraphData);
  } catch (error) {
    log(error);
    return err('Something unknown went wrong when creating the cap table. See logs or contact administrator.');
  }
}
