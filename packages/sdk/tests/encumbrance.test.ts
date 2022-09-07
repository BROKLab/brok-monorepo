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

test('issue encumbrance', async (t) => {
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
  t.assert(shareholderUpdated.encumbrance, 'encumbrance should be defined');
  if (!shareholderUpdated.encumbrance) {
    t.log(shareholderUpdated);
  }

  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderWithEncumbrance = capTable.shareholders.find((shareholder) => shareholder.encumbrance);
  t.assert(shareholderWithEncumbrance, 'Should have a shareholder with encumbrance');
  if (!shareholderWithEncumbrance) {
    t.log(capTable);
  }
});

test('edit mortgage', async (t) => {
  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  await sleep(2000);
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderWithEncumbrance = capTable.shareholders.find((shareholder) => shareholder.encumbrance);
  if (!shareholderWithEncumbrance) {
    t.log(capTable);
    return t.fail('no shareholder on captable with encumbrance');
  }
  const shareholderUpdated = await t.context.sdk.editEcumbrance(shareholderWithEncumbrance.ceramicID, {
    amount: '500',
    postalcode: '1234',
    name: 'DNK ASA',
  });
  t.assert(shareholderUpdated.encumbrance, 'encumbrance should be defined');
  if (!shareholderUpdated.encumbrance) {
    t.log(shareholderUpdated);
  }
  t.is(shareholderUpdated.encumbrance?.amount, '500');
  t.is(shareholderUpdated.encumbrance?.countryCode, 'NO');
  t.is(shareholderUpdated.encumbrance?.name, 'DNK ASA');
});

test('delete', async (t) => {
  const isDeleted = await t.context.sdk.deleteCapTable(t.context.capTableAddress);
  t.truthy(isDeleted, 'should return true on delete');
});
