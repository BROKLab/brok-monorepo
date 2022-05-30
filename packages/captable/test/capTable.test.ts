/* eslint-disable node/no-missing-import */
import { expect } from "chai";
import { ContractReceipt } from "ethers";
import { deployments, ethers } from "hardhat";
import { CapTable__factory } from "../src/typechain";

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
    console.log("capTable deployed", capTable.address);
    const tx = await capTable.issueByPartition(
      PARTITION,
      randomWallet.address,
      ethers.utils.parseEther("500"),
      "0x"
    );
    await tx.wait();

    const balance = await capTable.balanceOf(randomWallet.address);
    expect(capTable.address).properAddress;
    expect(balance.eq(ethers.utils.parseEther("500")));
  });
});
