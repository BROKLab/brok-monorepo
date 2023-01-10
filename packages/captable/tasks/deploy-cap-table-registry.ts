import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { CapTableRegistry__factory } from "../typechain-types";
import { getDIDfromHardhatDeployer } from "./utils";
import updateDotenv from "update-dotenv";

task("deploy-cap-table-registry", "Deploy contract")
	.addFlag("dev", "Deploy development state.")
	.addFlag("updateEnv", "Update .env file with deployed contract addresses.")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			const [deployer] = await hre.ethers.getSigners();

			/* Get contract dependencies */
			const vcRegistryAddress = hre.deployed.VC_REGISTRY;
			const did = await getDIDfromHardhatDeployer(hre);
			/* Check contract dependencies */
			// if (!vcRegistryAddress) {
			// 	throw new Error("VCRegistry requires CB token to be deployed");
			// }
			const capTableRegistry = await new CapTableRegistry__factory(deployer).deploy(deployer.address, did.id);
			hre.deployed.CAP_TABLE_REGISTRY = capTableRegistry.address;
			console.log("CapTableRegistry deployed to:", capTableRegistry.address);
			if (taskArgs.updateEnv) {
				await updateDotenv({
					[`CAP_TABLE_REGISTRY_${await hre.network.config.chainId}`]: capTableRegistry.address,
				});
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
