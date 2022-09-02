import anyTest, { TestFn } from 'ava';
import { SDK } from '../src/sdk.js';
import { config } from 'dotenv';
import { ethers } from 'ethers';
import { initSDK } from './sdk.test.js';
import { NewShareholder, PartitionAmount, CapTable } from '../src/types.js';
const test = anyTest as TestFn<{
  sdk: SDK;
  capTableAddress: string;
  orgNr: string;
  orgName: string;
  shareholders: (NewShareholder & PartitionAmount)[];
  capTable: CapTable;
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
      postalcode: '0655',
      partition: 'ordinære',
    },
    {
      name: 'Fiske AS',
      organizationIdentifier: '123456789',
      organizationIdentifierType: 'EUID',
      amount: '500',
      countryCode: 'NO',
      postalcode: '0111',
      partition: 'ordinære',
    },
  ];
  const capTableAddress = await t.context.sdk.createCapTable({
    name: orgName,
    orgnr: orgNr,
    shareholders,
  });
  const capTable = await t.context.sdk.getCapTable(capTableAddress);
  t.context = {
    ...t.context,
    sdk,
    capTableAddress,
    orgName,
    orgNr,
    shareholders,
    capTable,
  };
});

test.after(async (t) => {
  await t.context.sdk.close();
});

test('create capTable', async (t) => {
  t.assert(ethers.utils.isAddress(t.context.capTableAddress));
});

// TODO : Must happen after

test('issue mortgage', async (t) => {
  const shareholderToEcumbrance = t.context.shareholders[0];

  const shareholderUpdated = await t.context.sdk.issueEcumbrance(t.context.capTable.shareholders[0].ceramicID, {
    amount: '1000',
    postalcode: '1234',
    countryCode: 'NO',
    name: 'DNO ASA',
    dateCreated: new Date().toISOString(),
    organizationIdentifier: '123456789',
    organizationIdentifierType: 'EUID',
    partition: 'ordinære',
  });
  t.log(shareholderUpdated);
  t.assert(shareholderUpdated.encumbrance, '');
});

test('delete', async (t) => {
  const isDeleted = await t.context.sdk.deleteCapTable(t.context.capTableAddress);
  t.truthy(isDeleted, 'should return true on delete');
});
