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
			let capTableRegistryAddress = hre.deployed.CAP_TABLE_REGISTRY;

			/* Check contract dependencies */
			if (!capTableRegistryAddress) {
				const capTableRegistry = await new CapTableRegistry__factory(deployer).deploy();
				await capTableRegistry.deployed();
				capTableRegistryAddress = capTableRegistry.address;
				hre.deployed.CAP_TABLE_REGISTRY = capTableRegistryAddress;
				console.log("CapTableRegistry deployed to:", capTableRegistry.address);
			} else {
				console.log("CapTableRegistry already deployed at:", capTableRegistryAddress);
			}

			if (taskArgs.dev) {
				const did = await getDIDfromHardhatDeployer(hre);
				const capTableRegistry = await new CapTableRegistry__factory(deployer).attach(capTableRegistryAddress);
				const isOperator = await capTableRegistry.hasRole(hre.ethers.utils.id("OPERATOR_ROLE"), deployer.address);
				if (!isOperator) {
					const tx = await capTableRegistry.authenticateOperatorWithDID(deployer.address, "Deployer", did.id);
				}
			}

			if (taskArgs.updateEnv) {
				await updateDotenv({
					[`CAP_TABLE_REGISTRY_${hre.network.name}`]: capTableRegistryAddress,
				});
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
