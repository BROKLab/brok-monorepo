import { run, ethers, deployments, network } from "hardhat";
import { CapTableFactory, ERC1400, CapTableRegistry } from "../src/typechain";

async function main() {
  await run("compile");
  console.log("Deploying capTable on ", network.name);
  if (network.name === "hardhat") {
    await deployments.fixture();
  }
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
  console.log("capTableAddress", capTableAddress);
  const capTable = (await ethers.getContractAt(
    "ERC1400",
    capTableAddress
  )) as ERC1400;

  const mintTx = await capTable
    .connect(fxcSigner)
    .issueByPartition(
      ethers.utils.formatBytes32String("ordinære"),
      fxcSigner.address,
      5000,
      "0x11"
    );
  await mintTx.wait();

  // Transfer
  const randomWallet = ethers.Wallet.createRandom();
  const transferTx = await capTable.transferByPartition(
    ethers.utils.formatBytes32String("ordinære"),
    randomWallet.address,
    2000,
    "0x11"
  );
  await transferTx.wait();

  // Redeem
  const redeemTx = await capTable.redeemByPartition(
    ethers.utils.formatBytes32String("ordinære"),
    1500,
    "0x11"
  );
  await redeemTx.wait();

  const totalSupply = await capTable.totalSupply();
  console.log("Total suply is", totalSupply.toString());
  const balance = await capTable.balanceOf(fxcSigner.address);
  console.log("Balance of " + fxcSigner.address + " is " + balance.toString());

  const deploymentCapTableRegistry = await deployments.getOrNull(
    "CapTableRegistry"
  ); // Token is available because the fixture was executed
  if (!deploymentCapTableRegistry) {
    throw new Error("CapTableRegistry not deployed");
  }
  const capTableRegistry = (await ethers.getContractAt(
    "CapTableRegistry",
    deploymentCapTableRegistry.address
  )) as CapTableRegistry;

  const approveTx = await capTableRegistry.approve(capTableAddress);
  await approveTx.wait();
  console.log("Approved captable in registry", capTableRegistry.address);
}

main()
  .then(() => console.log("Done!"))
  .catch((error) => {
    console.error(error);
    throw Error(error);
  });
