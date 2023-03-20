import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { CapTableRegistry, CapTableRegistry__factory } from "../typechain-types";
import { getDIDfromHardhatDeployer } from "./utils";
import updateDotenv from "update-dotenv";
import { TASK_PRE_DEPLOY_CHECK } from "./generate-deployments";

task("deploy-cap-table-registry", "Deploy contract")
	.addFlag("dev", "Deploy development state.")
	.addFlag("updateEnv", "Update .env file with deployed contract addresses.")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			const [deployer] = await hre.ethers.getSigners();

			/* Get contract dependencies */
			let contractAddress = await hre.run(TASK_PRE_DEPLOY_CHECK, {
				contract: "CAP_TABLE_REGISTRY",
			});

			const contract = (async () => {
				if (!contractAddress) {
					const capTableRegistry = await new CapTableRegistry__factory(deployer).deploy();
					await capTableRegistry.deployed();
					hre.deployed.CAP_TABLE_REGISTRY = capTableRegistry.address;
					return capTableRegistry;
				} else {
					const capTableRegistry = await new CapTableRegistry__factory(deployer).attach(contractAddress);
					return capTableRegistry;
				}
			})();

			// if (taskArgs.dev) {
			// 	const did = await getDIDfromHardhatDeployer(hre);
			// 	const isOperator = await contract.hasRole(hre.ethers.utils.id("OPERATOR_ROLE"), deployer.address);
			// 	if (!isOperator) {
			// 		const tx = await contract.authenticateOperatorWithDID(deployer.address, "Deployer", did.id);
			// 	}
			// }
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
