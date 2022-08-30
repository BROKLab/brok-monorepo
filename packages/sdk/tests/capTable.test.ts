import anyTest, { TestFn } from 'ava';
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

  const shareholderA = capTable.shareholders[0];
  const shareholderB = capTable.shareholders[1];
  const transferResult = await t.context.sdk.transfer(t.context.capTableAddress, [
    {
      amount: '100',
      from: shareholderA.ethAddress,
      to: shareholderB.ethAddress,
      partition: 'ordinære',
    },
    {
      from: shareholderB.ethAddress,
      amount: '300',
      partition: 'ordinære',
      name: "Kari O'Connor",
      birthDate: '01-01-1988',
      countryCode: 'NO',
      postalcode: '0655',
    },
  ]);
  if (transferResult.length !== 2 || !Array.isArray(transferResult)) {
    t.log(transferResult);
  }
  t.truthy(Array.isArray(transferResult), 'transferResult is an array');
  t.is(transferResult.length, 2, 'transferResult has one element');
  transferResult.map((tr) => {
    t.is(tr.success, true, 'transferResult is success');
    if (!tr.success) {
      t.log(tr);
    }
    t.is(typeof tr.message, 'string', 'transferResult has a message');
  });
  // TODO : Check that the amount has been transferred, we dont do this because it takes to long for TheGraph to update.
  // const sleep = (ms: number) => {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // };
  // await sleep(2000);
  // const capTable2 = await t.context.sdk.getCapTable(t.context.capTableAddress);
  // capTable2.shareholders.map((afterShareholder) => {
  //   if (afterShareholder.ethAddress === shareholderA.ethAddress) {
  //     t.not(afterShareholder.balances[0].amount, shareholderA.balances[0].amount, 'shareholderA balance should be adjusted');
  //   } else {
  //     capTable2.shareholders.map((s) => s.balances.map((s) => t.log(s.amount)));
  //   }
  // });
});

test('update shareholder', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderToUpdate = capTable.shareholders.find((s) => s.name === 'Test Testesen');
  if (!shareholderToUpdate) {
    t.log(capTable.shareholders);
    return t.fail('Could not find shareholder to update');
  }
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

test('kapitalforhoyselseNyeAksjer', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderToUpdate = capTable.shareholders.find((s) => s.name === 'Old Nordmann');
  if (!shareholderToUpdate) {
    t.log(capTable.shareholders);
    return t.fail('Could not find shareholder to update');
  }
  const newShareholder = {
    amount: '100',
    partition: 'ordinære',
    name: 'Fredrik Ljong',
    birthDate: '01-01-1988',
    countryCode: 'NO',
    postalcode: '0655',
  };
  const issueResult = await t.context.sdk.kapitalforhoyselseNyeAksjer(t.context.capTableAddress, [
    {
      to: shareholderToUpdate.ethAddress,
      amount: '100',
      partition: 'ordinære',
    },
    newShareholder,
  ]);
  if (issueResult.length !== 2 || !Array.isArray(issueResult)) {
    t.log(issueResult);
  }
  t.truthy(Array.isArray(issueResult), 'issueResult is an array');
  t.is(issueResult.length, 2, 'issueResult has one element');
  issueResult.map((tr) => {
    t.is(tr.success, true, 'issueResult is success');
    if (!tr.success) {
      t.log(tr);
    }
    t.is(typeof tr.message, 'string', 'issueResult has a message');
  });
  const capTableUpdated = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholder = capTableUpdated.shareholders.find((s) => s.name === newShareholder.name);
  if (!shareholder) {
    t.log('Could not find the new shareholder');
    t.log(capTableUpdated.shareholders);
  }
  t.assert(shareholder, 'Found the new shareholder');
});

test('splitt', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderToUpdate = capTable.shareholders.map((s) => {
    return {
      to: s.ethAddress,
      partition: 'ordinære',
      amount: '5000',
    };
  });
  const issueResult = await t.context.sdk.splitt(t.context.capTableAddress, shareholderToUpdate);
  if (!Array.isArray(issueResult)) {
    t.log('issueResult', issueResult);
  }
  t.truthy(Array.isArray(issueResult), 'issueResult is an array');
  t.is(issueResult.length, capTable.shareholders.length, 'issueResult has one element');
  issueResult.map((tr) => {
    t.is(tr.success, true, 'issueResult is success');
    if (!tr.success) {
      t.log(tr);
    }
    t.is(typeof tr.message, 'string', 'issueResult has a message');
  });
  // dont do this because it takes to long for TheGraph to update.
  // const sleep = (ms: number) => {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // };
  // await sleep(2000);
  // const capTableUpdated = await t.context.sdk.getCapTable(t.context.capTableAddress);
  // capTableUpdated.shareholders.forEach((s) => {
  //   const oldS = capTable.shareholders.find((oldS) => oldS.ethAddress === s.ethAddress);
  //   if (!oldS) {
  //     t.log('proevious captable', capTable);
  //     t.log('updated captable', capTableUpdated);
  //     return t.fail('Couldt not find previous shareholder for the updated one');
  //   }
  //   t.not(s.balances[0].amount, oldS.balances[0].amount, 'shareholder balance should be adjusted');
  // });
});

test('kapitalnedsettelseReduksjonAksjer', async (t) => {
  const capTable = await t.context.sdk.getCapTable(t.context.capTableAddress);
  const shareholderToUpdate = capTable.shareholders[0];
  if (!shareholderToUpdate) {
    t.log('balances', capTable.shareholders.map((s) => s.balances.map((b) => b.amount)).join(', '));
    t.log('shareholders', capTable.shareholders);
    return t.fail('Could not find shareholder to update');
  }
  const redeemResult = await t.context.sdk.kapitalnedsettelseReduksjonAksjer(t.context.capTableAddress, [
    {
      from: shareholderToUpdate.ethAddress,
      amount: '77',
      partition: 'ordinære',
    },
  ]);
  if (redeemResult.length !== 1 || !Array.isArray(redeemResult)) {
    t.log(redeemResult);
  }
  t.truthy(Array.isArray(redeemResult), 'redeemResult is an array');
  t.assert(redeemResult.length > 0, 'redeemResult has one element');
  redeemResult.map((tr) => {
    t.is(tr.success, true, 'redeemResult is success');
    if (!tr.success) {
      t.log(tr);
    }
    t.is(typeof tr.message, 'string', 'redeemResult has a message');
  });
  // dont do this because it takes to long for TheGraph to update.
  // const sleep = (ms: number) => {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // };
  // await sleep(3000);
  // const capTableUpdated = await t.context.sdk.getCapTable(t.context.capTableAddress);
  // t.log(capTableUpdated.shareholders.map((s) => s.balances.map((b) => b.amount)).join(', '));
  // const updatedShareholder = capTableUpdated.shareholders.find((s) => s.name === shareholderToUpdate.name);
  // if (!updatedShareholder) {
  //   t.log('Could not find the new shareholder');
  //   t.log('shareholders', capTableUpdated.shareholders);
  //   t.log('balances', capTable.shareholders.map((s) => s.balances.map((b) => b.amount)).join(', '));
  //   return t.fail('Could not find the updated shareholder');
  // }
  // t.assert(updatedShareholder, 'Found the new shareholder');
  // if (!ethers.BigNumber.from(updatedShareholder.balances[0].amount).lt(oldBalance)) {
  //   t.log('old balance', oldBalance.toString());
  //   t.log('new balance', updatedShareholder.balances[0].amount);
  // }
  // t.assert(ethers.BigNumber.from(updatedShareholder.balances[0].amount).lt(oldBalance), 'shareholder balance should be adjusted down');
});

test('delete', async (t) => {
  const isDeleted = await t.context.sdk.deleteCapTable(t.context.capTableAddress);
  t.truthy(isDeleted, 'should return true on delete');
});
