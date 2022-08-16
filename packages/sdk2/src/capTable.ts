import { ethers } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { SDK } from './sdk.js';
import { getCapTableGraph } from './theGraph.js';
import {
  CapTable,
  CapTableEthereumId,
  CeramicId,
  CreateCapTableInput,
  EthereumAddress,
  OperationResult,
  Shareholder,
  TransferInput,
  TransferRequest,
} from './types.js';
import debug from 'debug';
const log = debug('brok:sdk:captable');

export async function _createCapTable(this: SDK, input: CreateCapTableInput): Promise<Result<string, string>> {
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

export async function _getCapTable(this: SDK, capTableAddress: EthereumAddress): Promise<Result<CapTable, string>> {
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

export async function _transfer(
  this: SDK,
  capTableAddress: CapTableEthereumId,
  transferInputs: TransferInput[],
): Promise<Result<(OperationResult & TransferRequest)[], string>> {
  try {
    // Prepare possible ceramic updates
    const shareholderEthToCeramic: Record<EthereumAddress, CeramicId> = {};
    let transferRequests: TransferRequest[] = [];
    let operationResult: (OperationResult & TransferRequest)[] = [];
    for await (const transferInput of transferInputs) {
      // if transfer to exisisting, we dont need to do much.
      if ('to' in transferInput) {
        transferRequests = [
          ...transferRequests,
          { to: transferInput.to, amount: transferInput.amount, from: transferInput.from, partition: transferInput.partition },
        ];
      } else {
        // is transfer to new shareholder, if so we need to create an address and update ceramic.
        const shareholder = {
          ethAddress: this.blockchain.createRandomWallet().address.toLowerCase(),
          ...transferInput,
        };
        const ceramicId = await this.ceramic.createShareholder(shareholder);
        if (ceramicId.isErr()) {
          log(ceramicId.error);
          // Return err here because we havent done any blockchain tx yet.
          return err(`Could not create shareholder data for ${transferInput.name} in Ceramic. Shareholder data: ${JSON.stringify(shareholder)}`);
        }
        shareholderEthToCeramic[shareholder.ethAddress] = ceramicId.value;
        transferRequests = [
          ...transferRequests,
          { to: shareholder.ethAddress, amount: transferInput.amount, from: transferInput.from, partition: transferInput.partition },
        ];
      }
    }

    const capTableGraphData = await getCapTableGraph(this.blockchain.theGraphUrl, capTableAddress, { onlyApproved: true });
    if (capTableGraphData.isErr()) {
      return err(capTableGraphData.error);
    }

    for await (const transferRequest of transferRequests) {
      try {
        const res = await this.blockchain.operatorTransfer(capTableAddress, transferRequest);
        if (res.isErr()) {
          throw new Error(res.error);
        }
        operationResult = [...operationResult, { ...transferRequest, success: true, message: 'Deployed to blockchain.' }];
      } catch (error) {
        log('error from operatorTransfer', error);
        operationResult = [...operationResult, { ...transferRequest, success: false, message: 'Error deploying to blockchain.' }];
      }
    }
    // TODO : Remove possible keys where blockhain transaction was not success
    // Do updates to Ceramic
    if (Object.keys(shareholderEthToCeramic).length > 0) {
      const ceramicCapTableRes = await this.ceramic.updateCapTable({
        data: {
          shareholderEthToCeramic,
        },
        capTableAddress: capTableAddress,
        capTableRegistryAddress: this.blockchain.capTableRegistryContract().address,
      });
      if (ceramicCapTableRes.isErr()) {
        log('Could not update transfers in ceramic. Changed values: ', shareholderEthToCeramic);
        // REVIEW - Unsound, if not sync.
        Object.keys(shareholderEthToCeramic).forEach((ethAddress) => {
          operationResult = operationResult.map((or) => {
            if (or.to === ethAddress) {
              return { ...or, message: 'Could not update Ceramic data.', success: false };
            }
            return or;
          });
        });
      }
    }
    return ok(operationResult);
  } catch (error) {
    log(error);
    return err('Something unknown went wrong when transfering shares. See logs or contact administrator.');
  }
}

export async function _deleteCapTable(this: SDK, capTableAddress: CapTableEthereumId): Promise<Result<boolean, string>> {
  try {
    // Just check if capTable address is valid
    if (!ethers.utils.isAddress(capTableAddress)) {
      return err(`CapTable address ${capTableAddress} is not valid Ethereum address`);
    }

    const deleteCapTableRes = await this.blockchain.deleteCapTable(capTableAddress);
    if (deleteCapTableRes.isErr()) {
      return err(deleteCapTableRes.error);
    }
    // TODO : remove ceramic data
    return ok(true);
  } catch (error) {
    log(error);
    return err('Something unknown went wrong when deleting the cap table. See logs or contact administrator.');
  }
}

export async function _updateShareholder(
  this: SDK,
  capTableAddress: CapTableEthereumId,
  shareholderValuesToUpdate: Partial<Shareholder>,
): Promise<Result<Shareholder, string>> {
  try {
    // TODO : Make a version of this function that only requires ceramic id on shareholder. Massiv perf boost.
    if (!shareholderValuesToUpdate.ethAddress) {
      return err('ethAddress is required on shareholder to update it');
    }
    // Check is fagsystem, Only fagsystem can update shareholders.
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
    if (!this.ceramic.did) {
      return err('DID is not set, you must set DID to update on Ceramic.');
    }
    // get capTableData because we need shareholder ceramicId
    const capTableCeramicData = await this.ceramic.getCapTable({
      capTableAddress: capTableAddress,
      capTableRegistryAddress: this.blockchain.capTableRegistryContract().address,
      fagsystemDID: this.ceramic.did.id,
    });
    if (capTableCeramicData.isErr()) {
      log;
      return err(`Error updating shareholder, cant get capTable from Ceramic: ${capTableCeramicData.error}`);
    }
    // find shareholder ceramic id
    const ceramicId = Object.entries(capTableCeramicData.value.shareholderEthToCeramic).find(
      (ethToCeramic) => ethToCeramic[0] === shareholderValuesToUpdate.ethAddress,
    )?.[1];
    if (!ceramicId) {
      log(`Lookign for ${shareholderValuesToUpdate.ethAddress}`);
      log('shareholderEthToCeramic', capTableCeramicData.value.shareholderEthToCeramic);
      return err('Could not find shareholder in Ceramic.');
    }
    const oldShareholderRes = await this.ceramic.getShareholder(ceramicId);
    if (oldShareholderRes.isErr()) {
      throw new Error(`Could not get current shareholder values for ceramicID:  ${ceramicId}`);
    }
    log('Got shareholder to update', oldShareholderRes.value);
    log('Updating with', shareholderValuesToUpdate);
    const toUpdate = { ...oldShareholderRes.value, ...shareholderValuesToUpdate };
    log('Final update object', toUpdate);
    const updatedShareholder = await this.ceramic.updateShareholder(ceramicId, toUpdate);
    if (updatedShareholder.isErr()) {
      return err(`Error updating shareholder, cant update shareholder in Ceramic: ${updatedShareholder.error}`);
    }

    return ok(updatedShareholder.value);
  } catch (error) {
    log(error);
    return err('Something unknown went wrong when deleting the cap table. See logs or contact administrator.');
  }
}
