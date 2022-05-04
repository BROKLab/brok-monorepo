import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const signer = await getSigner(hre);
  const didRegistry = await deploy("EthereumDIDRegistry", {
    from: deployer,
    args: [],
  });
  console.log("EthereumDIDRegistry deployed", didRegistry.address);
};
export default func;

async function getSigner(hre: HardhatRuntimeEnvironment) {
  return (await hre.ethers.getSigners())[0];
}
