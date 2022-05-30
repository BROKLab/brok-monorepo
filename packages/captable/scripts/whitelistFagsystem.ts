import { run, ethers, deployments, network } from "hardhat";

import { CapTableRegistry } from "../src/typechain";

const toWhitelist = [
  {
    address: "0xBc78672B86F7d022408bd91A9700a3ddB2ed555A",
    did: "did:example:123",
  },
];

async function main() {
  await run("compile");
  console.log("Deploying capTable on ", network.name);
  if (network.name === "hardhat") {
    await deployments.fixture();
  }

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

  for (const fagsystem of toWhitelist) {
    const tx = await capTableRegistry.whitelistFagsystem(
      fagsystem.address,
      fagsystem.did
    );
    await tx.wait();

    const hasRole = await capTableRegistry.hasRole(
      ethers.utils.solidityKeccak256(["string"], ["FAGSYSTEM"]),
      fagsystem.address
    );
    if (!hasRole) {
      throw new Error(
        `Fagsystem ${fagsystem} was not whitelisted as it did not have the role`
      );
    }
  }
  console.log(
    "Whitelisted fagsystems: ",
    toWhitelist.map((fagsystem) => fagsystem.address).join(", ")
  );
  console.log("In registry", capTableRegistry.address);
}

main()
  .then(() => console.log("Done!"))
  .catch((error) => {
    console.error(error);
    throw Error(error);
  });
