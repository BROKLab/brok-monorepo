import { ethers } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { SDK } from './sdk.js';
import { getCapTableGraph } from './theGraph.js';
import { CapTable, CeramicId, CreateCapTableInput, EthereumAddress } from './types.js';
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
      await approveRes.wait(1);
      const status = await this.blockchain.capTableRegistryContract().getStatus(deployedCapTableResult.value);
      log('captable approved, status: ', status.toNumber());
      if (status.toNumber() !== 2) {
        throw new Error(`CapTable had invalid status: ${status.toString()}`);
      }
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

export async function getCapTableSafe(this: SDK, capTableAddress: EthereumAddress): Promise<Result<CapTable, string>> {
  const log = debug('brok:sdk:captable');
  try {
    const capTableGraphData = await getCapTableGraph(this.blockchain.theGraphUrl, capTableAddress, { onlyApproved: true });
    if (capTableGraphData.isErr()) {
      return err(capTableGraphData.error);
    }
    log('capTableGraphData', capTableGraphData.value);
    const capTableFagsystemDid = capTableGraphData.value.fagsystemDid;
    const capTableCeramicData = await this.ceramic.getCapTable({
      capTableAddress: capTableAddress,
      capTableRegistryAddress: this.blockchain.capTableRegistryContract().address.toLowerCase(),
      fagsystemDID: capTableFagsystemDid,
    });
    if (capTableCeramicData.isErr()) {
      return err(capTableCeramicData.error);
    }
    log('capTableCeramicData', capTableCeramicData.value);
    const shareholderPromises = Object.entries(capTableCeramicData.value.shareholderEthToCeramic).map(async ([ethAddress, ceramicId]) => {
      const shareholder = await this.ceramic.getShareholder(ceramicId);
      if (shareholder.isErr()) {
        throw new Error(`Could not get shareholder ${ethAddress} and ${ceramicId}`);
      }
      log('Got shareholder', shareholder.value);
      const graphData = capTableGraphData.value.tokenHolders.find((tokenHolder) => tokenHolder.address === ethAddress);
      if (!graphData) {
        throw new Error(`Could not find shareholder ${ethAddress} in graph data`);
      }
      return {
        ...shareholder.value,
        ...graphData,
        ethAddress,
      };
    });
    const shareholders = await Promise.all(shareholderPromises);
    const capTable: CapTable = {
      name: capTableCeramicData.value.name,
      orgnr: capTableCeramicData.value.orgnr,
      shareholders: shareholders.map((shareholder) => {
        let data: any = {
          balances: shareholder.balances.map((bal) => ({ partition: bal.partition, amount: bal.amount })),
          ethAddress: shareholder.ethAddress,
          name: JSON.stringify(shareholder.name),
          countryCode: shareholder.countryCode,
          postalcode: shareholder.postalcode,
        };
        if ('birthDate' in shareholder) {
          data = {
            ...data,
            birthDate: shareholder.birthDate,
          };
        }
        if ('organizationIdentifier' in shareholder) {
          data = {
            ...data,
            organizationIdentifier: shareholder.organizationIdentifier,
            organizationIdentifierType: shareholder.organizationIdentifierType,
          };
        }
        return data;
      }),
    };
    return ok(capTable);
  } catch (error) {
    log(error);
    return err('Something unknown went wrong when creating the cap table. See logs or contact administrator.');
  }
}
