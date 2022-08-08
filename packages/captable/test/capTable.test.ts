/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
/* eslint-disable node/no-missing-import */
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { CapTable__factory } from "../src/typechain/";

describe("CapTable", function () {
  beforeEach(async function () {
    await deployments.fixture();
  });

  /* @dev Only tests CapTable.sol. Note that controller is set by Factory
   */
  it("should deploy capTable", async function () {
    // const randomWallet = ethers.Wallet.createRandom();
    const deployerSigner = (await ethers.getSigners())[0];

    const capTable = await new CapTable__factory(deployerSigner).deploy(
      "Symfoni AS",
      "915772137",
      ethers.utils.parseEther("1"),
      [],
      [ethers.utils.formatBytes32String("ordinære")],
      ethers.constants.AddressZero
    );
    await capTable.deployed();
    const totalSupply = await capTable.totalSupply();

    // Get correct event using event signature
    const receipt = await capTable.deployTransaction.wait();
    const eventSignature = "NewCapTable(string,address)";
    const eventFingerprint = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(eventSignature)
    );
    let newCapTableAddress = "";
    receipt.logs.forEach((log) => {
      if (log.topics[0] === eventFingerprint) newCapTableAddress = log.address;
    });

    expect(newCapTableAddress).properAddress;
    expect(await capTable.getOrgnr()).to.have.lengthOf(9),
      "Orgnr is " + (await capTable.getOrgnr());
    expect(totalSupply.eq(ethers.constants.Zero));
  });

  it("should transfer", async function () {
    const randomWallet = ethers.Wallet.createRandom();
    const deployerSigner = (await ethers.getSigners())[0];
    const deployerAddress = deployerSigner.address;
    const PARTITION = ethers.utils.formatBytes32String("ordinære");
    const capTable = await new CapTable__factory(deployerSigner).deploy(
      "Symfoni AS",
      "915772137",
      ethers.utils.parseEther("1"),
      [deployerAddress],
      [PARTITION],
      ethers.constants.AddressZero
    );
    await capTable.deployed();
    const tx = await capTable.issueByPartition(
      PARTITION,
      randomWallet.address,
      ethers.utils.parseEther("500"),
      "0x"
    );
    await tx.wait();

    expect(capTable.address).properAddress;
    expect(await capTable.balanceOf(randomWallet.address)).to.equal(
      ethers.utils.parseEther("500")
    );
  });

  it("should kapitalforhoyselse_nye_aksjer", async function () {
    const randomWallet = ethers.Wallet.createRandom();
    const randomWallet2 = ethers.Wallet.createRandom();
    const deployerSigner = (await ethers.getSigners())[0];
    const deployerAddress = deployerSigner.address;
    const PARTITION = ethers.utils.formatBytes32String("ordinære");
    const capTable = await new CapTable__factory(deployerSigner).deploy(
      "Symfoni AS",
      "915772137",
      ethers.utils.parseEther("1"),
      [deployerAddress],
      [PARTITION],
      ethers.constants.AddressZero
    );
    await capTable.deployed();
    const tx = await capTable.kapitalforhoyselse_nye_aksjer(
      [PARTITION, PARTITION],
      [randomWallet.address, randomWallet2.address],
      [ethers.utils.parseEther("500"), ethers.utils.parseEther("300")],
      "0x"
    );
    await tx.wait();

    expect(capTable.address).properAddress;

    expect(await capTable.balanceOf(randomWallet.address)).to.equal(
      ethers.utils.parseEther("500")
    );

    expect(await capTable.balanceOf(randomWallet2.address)).to.equal(
      ethers.utils.parseEther("300")
    );
  });

  it("should fail to splitt to new shareholders", async function () {
    const randomWallet = ethers.Wallet.createRandom();
    const randomWallet2 = ethers.Wallet.createRandom();
    const deployerSigner = (await ethers.getSigners())[0];
    const deployerAddress = deployerSigner.address;
    const PARTITION = ethers.utils.formatBytes32String("ordinære");
    const capTable = await new CapTable__factory(deployerSigner).deploy(
      "Symfoni AS",
      "915772137",
      ethers.utils.parseEther("1"),
      [deployerAddress],
      [PARTITION],
      ethers.constants.AddressZero
    );
    await capTable.deployed();
    await expect(
      capTable.splitt(
        [PARTITION, PARTITION],
        [randomWallet.address, randomWallet2.address],
        [ethers.utils.parseEther("500"), ethers.utils.parseEther("500")],
        "0x"
      )
    ).revertedWith("No new shareholders");
  });

  it("should splitt to existing shareholders", async function () {
    const randomWallet = ethers.Wallet.createRandom();
    const randomWallet2 = ethers.Wallet.createRandom();
    const deployerSigner = (await ethers.getSigners())[0];
    const deployerAddress = deployerSigner.address;
    const PARTITION = ethers.utils.formatBytes32String("ordinære");
    const capTable = await new CapTable__factory(deployerSigner).deploy(
      "Symfoni AS",
      "915772137",
      ethers.utils.parseEther("1"),
      [deployerAddress],
      [PARTITION],
      ethers.constants.AddressZero
    );
    await capTable.deployed();
    // issue to one, but not the other
    const tx1 = await capTable.kapitalforhoyselse_nye_aksjer(
      [PARTITION, PARTITION],
      [randomWallet.address, randomWallet2.address],
      [ethers.utils.parseEther("500"), ethers.utils.parseEther("300")],
      "0x"
    );
    await tx1.wait();

    const tx2 = await capTable.splitt(
      [PARTITION, PARTITION],
      [randomWallet.address, randomWallet2.address],
      [ethers.utils.parseEther("500"), ethers.utils.parseEther("500")],
      "0x"
    );
    await tx2.wait();

    expect(capTable.address).properAddress;

    expect(await capTable.balanceOf(randomWallet.address)).to.equal(
      ethers.utils.parseEther("1000")
    );

    expect(await capTable.balanceOf(randomWallet2.address)).to.equal(
      ethers.utils.parseEther("800")
    );
  });
});
