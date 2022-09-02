import debug from 'debug';
import { ethers } from 'ethers';
import { err, ok, Result } from 'neverthrow';
import { SDK } from './sdk.js';
import { getCapTableGraph } from './theGraph.js';
import {
  CapTable,
  CapTableEthereumId,
  CeramicID,
  CreateCapTableInput,
  Encumbrance,
  EthereumAddress,
  IssueInput,
  IssueRequest,
  OperationResult,
  RedeemRequest,
  Shareholder,
  TransferInput,
  TransferRequest,
} from './types.js';

const log = debug('brok:sdk:encumbrance');

export async function _issueEcumbrance(this: SDK, shareholderCeramicID: CeramicID, encumbrance: Encumbrance) {
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
  // TODO - Check amount is not over current balance

  const oldShareholderRes = await this.ceramic.getShareholder(shareholderCeramicID);
  if (oldShareholderRes.isErr()) {
    return err(`Could not get current shareholder values for ceramicID:  ${shareholderCeramicID}`);
  }
  if (oldShareholderRes.value.encumbrance) {
    return err('This shareholder allready has encumbrance.');
  }
  const toUpdate = { ...oldShareholderRes.value };
  log('Final update object', toUpdate);
  const updatedShareholder = await this.ceramic.updateShareholder(shareholderCeramicID, {
    ...oldShareholderRes.value,
    encumbrance,
  });
  if (updatedShareholder.isErr()) {
    return err(`Error updating shareholder, cant update shareholder in Ceramic: ${updatedShareholder.error}`);
  }

  return ok(updatedShareholder.value);
}
