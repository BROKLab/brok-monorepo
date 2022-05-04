/* eslint-disable no-unused-expressions */
import { expect } from "chai";
import { assert } from "console";
import { BigNumber } from "ethers";
import { deployments, ethers } from "hardhat";
import { CapTableFactory, CapTableRegistry, CapTable } from "../src/typechain";

describe("CapTableFactory", function () {
  beforeEach(async function () {
    await deployments.fixture();
  });

  it("should deploy capTable, transfer rights and be issuable", async function () {
    const [brregSigner, fxcSigner] = await ethers.getSigners();

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

    const capTableRegistryAddress =
      await capTableFactory.getCapTableRegistryAddress();

    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      capTableRegistryAddress
    )) as CapTableRegistry;

    const tx = await capTableFactory
      .connect(fxcSigner)
      .createCapTable(
        "Symfoni AS",
        "915772137",
        [brregSigner.address, fxcSigner.address],
        [8000, 3000]
      );
    const receipt = await tx.wait();

    // Get correct event using event signature
    const eventSignature = "NewCapTable(string,address)";
    const eventFingerprint = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(eventSignature)
    );
    let capTableAddress = "";
    receipt.logs.forEach((log) => {
      if (log.topics[0] === eventFingerprint) capTableAddress = log.address;
    });

    const capTables = await capTableRegistry.getList();
    expect(capTables.length > 0).to.be.true;

    const capTable = (await ethers.getContractAt(
      "CapTable",
      capTableAddress
    )) as CapTable;
    const owner = await capTable.owner();

    expect(owner).to.include(brregSigner.address, "Owner should be Brreg");
    expect(await capTable.getFagsystem()).to.equal(fxcSigner.address);

    expect(
      await capTable.isMinter(fxcSigner.address),
      "fagsystem should be minter"
    ).to.be.true;

    // Mint
    const mintTx = await capTable
      .connect(fxcSigner)
      .issueByPartition(
        ethers.utils.formatBytes32String("ordinære"),
        brregSigner.address,
        5000,
        "0x11"
      );
    await mintTx.wait();

    const totalSupply = await capTable.totalSupply();
    expect(totalSupply.gte(BigNumber.from(5000))).to.be.true;
  });

  it("should deploy capTable as Fagsystem", async function () {
    const [brregSigner, fxcSigner] = await ethers.getSigners();

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

    const capTableRegistryAddress =
      await capTableFactory.getCapTableRegistryAddress();

    const capTableRegistry = (await ethers.getContractAt(
      "CapTableRegistry",
      capTableRegistryAddress
    )) as CapTableRegistry;

    const tx = await capTableFactory
      .connect(fxcSigner)
      .createCapTable(
        "Test Company",
        "TST",
        [brregSigner.address, fxcSigner.address],
        [8000, 3000]
      );
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
    expect(capTables.length > 0).to.be.true;
    expect(capTables.includes(capTableAddress)).to.be.true;

    const capTable = (await ethers.getContractAt(
      "CapTable",
      capTableAddress
    )) as CapTable;
    const owner = await capTable.owner();

    // Check rights
    expect(owner).to.include(brregSigner.address, "Owner should be Brreg");
    expect(await capTable.getFagsystem()).to.include(
      fxcSigner.address,
      "Controller should be Fagsystem / msg.sender"
    );
    expect(
      await capTable.isMinter(fxcSigner.address),
      "Minter should be Fagsystem "
    ).to.be.true;

    // Mint
    const mintTx = await capTable.issueByPartition(
      ethers.utils.formatBytes32String("ordinære"),
      fxcSigner.address,
      5000,
      "0x11"
    );
    await mintTx.wait();

    const totalSupply = await capTable.totalSupply();
    expect(totalSupply.gte(BigNumber.from(5000))).to.be.true;
  });
});
