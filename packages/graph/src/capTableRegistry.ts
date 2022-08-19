import { BigInt, DataSourceContext, log } from '@graphprotocol/graph-ts';
import { capTableQued, capTableRemoved, capTableDeclined, capTableApproved } from '../generated/CapTableRegistry/CapTableRegistry';
import { CapTableRegistry as CapTableRegistrySchema, CapTable as CapTableSchema } from '../generated/schema';
import { CapTable } from '../generated/templates';
import {
  CapTable as CapTable2,
} from '../generated/templates/CapTable/CapTable';

export function handleCapTableQued(event: capTableQued): void {
  log.info('######## START handleCapTableQued', []);
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let capTableRegistry = CapTableRegistrySchema.load(event.address.toHex());
  log.info('######## handleCapTableQued: capTableRegistry {}', [event.address.toHex()]);
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (capTableRegistry == null) {
    capTableRegistry = new CapTableRegistrySchema(event.address.toHex());

    // Entity fields can be set using simple assignments
    capTableRegistry.count = BigInt.fromI32(0);
    capTableRegistry.address = event.address;
  }

  capTableRegistry.count = capTableRegistry.count + BigInt.fromI32(1);
  log.info('######## handleCapTableQued: count {}', [capTableRegistry.count.toString()]);
  capTableRegistry.save();

  // let capTableQueContract = CapTableRegistry.bind(event.address);
  // let uuid = capTableQueContract.getUuid(event.address);

  // Start indexing the new capTable
  let context = new DataSourceContext();
  context.setString('capTableRegistryId', capTableRegistry.id);
  log.info('######## handleCapTableQued: capTableRegistryId {}', [capTableRegistry.id.toString()]);
  context.setString('capTableId', 'qued_' + event.params.id.toString());
  log.info('######## handleCapTableQued: capTableId {}', [event.params.id.toString()]);
  CapTable.createWithContext(event.params.capTableAddress, context);
  log.info('######## END handleCapTableQued', []);
}

export function handleCapTableApproved(event: capTableApproved): void {
  log.info('######## START handleCapTableApproved: {}', [event.params.capTableAddress.toHexString()]);
  let capTable = CapTableSchema.load(event.params.capTableAddress.toHexString());
  if (capTable == null) {
    log.critical('LOGICAL SMART CONTRACT ERROR {}', ['capTable in handleCapTableApproved should always exist.']);
    return;
  }
  log.info('######## END capTableAddress: {}',[event.params.capTableAddress.toHexString()]);
  let contract = CapTable2.bind(event.params.capTableAddress);
  let fagsystem = contract.getFagsystem();
  log.info('######## END fagsystem: {}', [fagsystem.toHexString()]);
  let did = contract.getFagsystemDid();
  log.info('######## END did: {}', [did.toString()]);
  let seperatorIndex = capTable.orgnr.indexOf('_') + 1;
  log.info('######## END seperatorIndex: {}', [seperatorIndex.toString()]);
  if (seperatorIndex) capTable.orgnr = capTable.orgnr.slice(seperatorIndex);
  log.info('######## END orgnr: {}', [capTable.orgnr.toString()]);
  capTable.status = 'APPROVED';
  capTable.fagsystem = fagsystem;
  capTable.fagsystemDid = did;
  capTable.save();
  log.info('######## END handleCapTableApproved: {}', [event.params.capTableAddress.toHexString()]);
}
export function handleCapTableRemoved(event: capTableRemoved): void {
  let capTable = CapTableSchema.load(event.params.capTableAddress.toHexString());
  if (capTable == null) {
    log.critical('LOGICAL SMART CONTRACT ERROR {}', ['capTable in handleCapTableApproved should always exist.']);
    return;
  }
  capTable.orgnr = 'REMOVED_' + capTable.orgnr;
  capTable.status = 'REMOVED';
  capTable.save();
}
export function handleCapTableDeclined(event: capTableDeclined): void {
  let capTable = CapTableSchema.load(event.params.capTableAddress.toHexString());
  if (capTable == null) {
    log.critical('LOGICAL SMART CONTRACT ERROR {}', ['capTable in handleCapTableApproved should always exist.']);
    return;
  }
  let seperatorIndex = capTable.orgnr.indexOf('_');
  capTable.orgnr = capTable.orgnr.slice(seperatorIndex);
  capTable.orgnr = 'DECLINED_' + capTable.orgnr;
  capTable.status = 'DECLINED';
  capTable.save();
}
