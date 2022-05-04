import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { CapTable, CapTableFactory, CapTableRegistry } from "../src/typechain";

describe("CapTableRegistry", function () {
  beforeEach(async function () {
    await deployments.fixture();
  });

  it("should que contract", async function () {
    const deployment = await deployments.getOrNull("CapTableRegistry"); // Token is available because the fixture was executed
    if (!deployment) {
      throw Error("Deployment for test failed");
    }
    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      deployment.address
    )) as CapTableRegistry;
    const randomWallet = ethers.Wallet.createRandom();
    const tx = await capTableRegistry.que(
      randomWallet.address,
      ethers.utils.formatBytes32String("123")
    );
    await tx.wait();

    const capTables = await capTableRegistry.getList();
    const activeCount = await capTableRegistry.getActiveCount();
    const quedCount = await capTableRegistry.getQuedCount();
    expect(activeCount.isZero());
    expect(quedCount.gte(ethers.constants.One));
    expect(capTables.includes(randomWallet.address));
  });

  it("should approve contract", async function () {
    const [owner, fagsystem, oscar] = await ethers.getSigners();

    const deployment = await deployments.getOrNull("CapTableRegistry"); // Token is available because the fixture was executed
    if (!deployment) {
      throw Error("Deployment for test failed");
    }
    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      deployment.address
    )) as CapTableRegistry;

    const tx = await capTableRegistry.que(
      owner.address, // Random address representing the erc1400 contract
      ethers.utils.formatBytes32String("123")
    );
    await tx.wait();

    // Whitelist fagsystem
    const whitelistTx = await capTableRegistry.whitelistFagsystem(
      fagsystem.address
    );
    await whitelistTx.wait();

    // Approve cap table as fagsystem
    const txApprove = await capTableRegistry
      .connect(fagsystem)
      .approve(owner.address);
    await txApprove.wait();

    // Checks
    const capTables = await capTableRegistry.getList();
    const activeCount = await capTableRegistry.getActiveCount();
    const quedCount = await capTableRegistry.getQuedCount();
    expect(quedCount.isZero());
    expect(activeCount.gte(ethers.constants.One));
    expect(capTables.includes(owner.address));
  });

  it("should fail 'whitelist cap table' from non-whitelisted signer", async function () {
    const [owner, oscar] = await ethers.getSigners();

    const deployment = await deployments.getOrNull("CapTableRegistry"); // Token is available because the fixture was executed
    if (!deployment) {
      throw Error("Deployment for test failed");
    }

    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      deployment.address
    )) as CapTableRegistry;

    const tx = await capTableRegistry.que(
      owner.address,
      ethers.utils.formatBytes32String("123")
    );
    await tx.wait();

    await expect(capTableRegistry.connect(oscar).approve(owner.address)).to.be
      .reverted;

    const capTables = await capTableRegistry.getList();
    const activeCount = await capTableRegistry.getActiveCount();
    const quedCount = await capTableRegistry.getQuedCount();
    expect(activeCount.isZero());
    expect(quedCount.gte(ethers.constants.One));
  });

  it("should remove contract", async function () {
    const deployment = await deployments.getOrNull("CapTableRegistry"); // Token is available because the fixture was executed
    if (!deployment) {
      throw Error("Deployment for test failed");
    }
    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      deployment.address
    )) as CapTableRegistry;
    const randomWallet = ethers.Wallet.createRandom();
    const tx = await capTableRegistry.que(
      randomWallet.address,
      ethers.utils.formatBytes32String("123")
    );
    await tx.wait();
    const txApprove = await capTableRegistry.approve(randomWallet.address);
    await txApprove.wait();
    const txRemove = await capTableRegistry.remove(randomWallet.address);
    await txRemove.wait();
    const capTables = await capTableRegistry.getList();
    const activeCount = await capTableRegistry.getActiveCount();
    const quedCount = await capTableRegistry.getQuedCount();
    expect(activeCount.isZero());
    expect(quedCount.isZero());
    expect(capTables.includes(randomWallet.address));
  });

  it("should fail 'blacklist cap table' from non-whitelisted signer", async function () {
    const [owner, oscar] = await ethers.getSigners();

    const deployment = await deployments.getOrNull("CapTableRegistry"); // Token is available because the fixture was executed
    if (!deployment) {
      throw Error("Deployment for test failed");
    }
    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      deployment.address
    )) as CapTableRegistry;

    const tx = await capTableRegistry.que(
      owner.address,
      ethers.utils.formatBytes32String("123")
    );
    await tx.wait();
    const txApprove = await capTableRegistry.approve(owner.address);
    await txApprove.wait();

    await expect(capTableRegistry.connect(oscar).remove(owner.address)).to.be
      .reverted;

    const capTables = await capTableRegistry.getList();
    const activeCount = await capTableRegistry.getActiveCount();
    const quedCount = await capTableRegistry.getQuedCount();
    expect(activeCount.isZero());
    expect(quedCount.isZero());
    expect(capTables.includes(owner.address));
  });

  it("should decline contract", async function () {
    const deployment = await deployments.getOrNull("CapTableRegistry"); // Token is available because the fixture was executed
    if (!deployment) {
      throw Error("Deployment for test failed");
    }
    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      deployment.address
    )) as CapTableRegistry;
    const randomWallet = ethers.Wallet.createRandom();
    const tx = await capTableRegistry.que(
      randomWallet.address,
      ethers.utils.formatBytes32String("123")
    );
    await tx.wait();
    const txDecline = await capTableRegistry.decline(
      randomWallet.address,
      ethers.utils.formatBytes32String("Some reason")
    );
    await txDecline.wait();
    const capTables = await capTableRegistry.getList();
    const activeCount = await capTableRegistry.getActiveCount();
    const quedCount = await capTableRegistry.getQuedCount();
    expect(activeCount.isZero());
    expect(quedCount.isZero());
    expect(capTables.includes(randomWallet.address));
  });

  it("should migrate a capTable", async function () {
    const deploymentCapTableFactory = await deployments.getOrNull(
      "CapTableFactory"
    ); // Token is available because the fixture was executed
    if (!deploymentCapTableFactory) {
      throw Error("Deployment for CapTableFactory failed");
    }
    const capTableFactory = (await ethers.getContractAt(
      "CapTableFactory",
      deploymentCapTableFactory.address
    )) as CapTableFactory;

    const [brregSigner, boardDirectorSigner] = await ethers.getSigners();

    const brregAddress = brregSigner.address;
    const boardDirectorAddress = boardDirectorSigner.address;

    const capTableRegistryAddress =
      await capTableFactory.getCapTableRegistryAddress();

    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      capTableRegistryAddress
    )) as CapTableRegistry;

    const tx = await capTableFactory.createCapTable(
      "Symfoni AS",
      "915772137",
      [brregAddress, boardDirectorAddress],
      [8000, 3000]
    );
    await tx.wait();

    const receipt = await tx.wait();

    // Get correct event using event signature
    const eventSignature = "NewCapTable(string,address)";
    const eventFingerprint = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(eventSignature)
    );
    let capTableAddress = "";
    receipt.logs.forEach((log) => {
      if (log.topics[0] == eventFingerprint) capTableAddress = log.address;
    });

    const capTables = await capTableRegistry.getList();
    expect(capTables.length > 0, "capTable registry list is more then 0").to.be
      .true;

    expect(
      capTables.includes(capTableAddress),
      "registry has this captable in list"
    ).to.be.true;

    const oldCapTable = (await ethers.getContractAt(
      "CapTable",
      capTableAddress
    )) as CapTable;
    const owner = await oldCapTable.owner();
    expect(owner).to.include(brregAddress, "captable owner should be brreg");

    const approveTX = await capTableRegistry.approve(capTableAddress);
    await approveTX.wait();

    const status = await capTableRegistry.getStatus(capTableAddress);
    expect(
      status.eq(ethers.constants.Two),
      "Captable should be status 2 (approved) in registry"
    );

    // create a new capTable
    const newCapTableTx = await capTableFactory.createCapTable(
      "Symfoni AS",
      "915772137",
      [brregAddress, boardDirectorAddress],
      [8000, 3000]
    );
    const receipt2 = await newCapTableTx.wait();

    // Get correct event using event signature
    let newCapTableAddress = "";
    receipt2.logs.forEach((log) => {
      if (log.topics[0] == eventFingerprint) newCapTableAddress = log.address;
    });

    const newCapTable = (await ethers.getContractAt(
      "CapTable",
      newCapTableAddress
    )) as CapTable;

    const migrateTX = await oldCapTable.migrate(newCapTableAddress, true);
    await migrateTX.wait();

    const migrateRegistry = await capTableRegistry.migrateCaptable("915772137");
    await migrateRegistry.wait();

    const statusOld = await capTableRegistry.getStatus(oldCapTable.address);
    expect(
      statusOld.eq(ethers.BigNumber.from(5)),
      "Old captable should have migrated status of 5"
    );
    const statusNew = await capTableRegistry.getStatus(newCapTable.address);
    expect(
      statusOld.eq(ethers.BigNumber.from(5)),
      "New captable should have approved status of 2"
    );
  });
});
