import anyTest, { TestFn, SerialFn } from 'ava';
import { SDK } from '../src/sdk.js';
import { config } from 'dotenv';
import { ethers } from 'ethers';
import { initSDK } from './sdk.test.js';
import { NewShareholder, PartitionAmount } from '../src/types.js';
const test = anyTest as TestFn<{
  sdk: SDK;
  capTableAddress: string;
  orgNr: string;
  orgName: string;
  shareholders: (NewShareholder & PartitionAmount)[];
}>;

test.before('env variables is set', async (t) => {
  config();
  const sdk = await initSDK();
  const orgNr = (Math.floor(Math.random() * 90000) + 10000).toString();
  const orgName = `Test ${orgNr} AS`;
  const shareholders: (NewShareholder & PartitionAmount)[] = [
    {
      name: 'Test Testesen',
      birthDate: '01-01-1988',
      amount: '1000',
      countryCode: 'NO',
      postalcode: '1234',
      partition: 'ordinære',
    },
    {
      name: 'Fiske AS',
      organizationIdentifier: '123456789',
      organizationIdentifierType: 'EUID',
      amount: '500',
      countryCode: 'NO',
      postalcode: '0655',
      partition: 'ordinære',
    },
  ];
  const capTableAddress = await t.context.sdk.createCapTable({
    name: orgName,
    orgnr: orgNr,
    shareholders,
  });
  t.context = {
    ...t.context,
    sdk,
    capTableAddress,
    orgName,
    orgNr,
    shareholders,
  };
});

test.after(async (t) => {
  await t.context.sdk.close();
});

test('create capTable', async (t) => {
  t.assert(ethers.utils.isAddress(t.context.capTableAddress));
});

// TODO : Must happen after

test('get capTable', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  t.is(typeof capTable, 'object', 'capTable is an object');
  t.truthy(capTable, 'CapTable is not empty');
  t.is(capTable.name, t.context.orgName, 'name is correct');
});

test('transfer', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);

  t.truthy(capTable.shareholders[0].ethAddress, 'Should have one shareholder');
  t.truthy(capTable.shareholders[1].ethAddress, 'Should have two shareholder');
  const transferResult = await t.context.sdk.transfer(t.context.capTableAddress, [
    {
      amount: '100',
      from: capTable.shareholders[0].ethAddress,
      to: capTable.shareholders[1].ethAddress,
      partition: 'ordinære',
    },
  ]);
  if (transferResult.length !== 1 || !Array.isArray(transferResult)) {
    t.log(transferResult);
  }
  t.truthy(Array.isArray(transferResult), 'transferResult is an array');
  t.is(transferResult.length, 1, 'transferResult has one element');
  transferResult.map((tr) => {
    t.is(tr.success, true, 'transferResult is success');
    if (!tr.success) {
      t.log(tr);
    }
    t.is(typeof tr.message, 'string', 'transferResult has a message');
  });
});

test('update shareholder', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderToUpdate = capTable.shareholders[0];
  const updatedShareholder = await t.context.sdk.updateShareholder(t.context.capTableAddress, {
    name: 'Old Nordmann',
    ethAddress: shareholderToUpdate.ethAddress,
  });
  if (
    !updatedShareholder ||
    updatedShareholder.name === shareholderToUpdate.name ||
    updatedShareholder.postalcode !== shareholderToUpdate.postalcode
  ) {
    t.log(updatedShareholder);
  }
  t.not(updatedShareholder.name, shareholderToUpdate.name, 'should have updated name');
  t.is(updatedShareholder.name, 'Old Nordmann', 'should have updated name');
  t.is(updatedShareholder.postalcode, shareholderToUpdate.postalcode, 'should NOT have updated postalcode');
});

test('delete', async (t) => {
  const isDeleted = await t.context.sdk.deleteCapTable(t.context.capTableAddress);
  t.truthy(isDeleted, 'should return true on delete');
});
