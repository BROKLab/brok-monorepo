import debug from "debug";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { ERC5564Messenger__factory, ERC5564Registry__factory, Secp256k1Generator__factory } from "../typechain-types";
import { TASK_PRE_DEPLOY_CHECK } from "./generate-deployments";
const log = debug("brok:tasks:deploy-stealth");
export const TASK_DEPLOY_STEALTH = "deploy-stealth";

task(TASK_DEPLOY_STEALTH, "Deploy stealth contracts.")
	.addFlag("dev", "Deploy development state.")
	.addFlag("log", "Log execution")
	.addFlag("redeploy", "Redeploy the contract instance on network if finds deployment deployment")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			/* Constants */
			/* Setup wallets */
			const [deployer] = await hre.ethers.getSigners();
			if (hre.hardhatArguments.verbose || taskArgs.log) {
				log.enabled = true;
			}

			const messengerAddress = await hre.run(TASK_PRE_DEPLOY_CHECK, {
				contract: "ERC5564Messenger",
			});
			const registryAddress = await hre.run(TASK_PRE_DEPLOY_CHECK, {
				contract: "ERC5564Registry",
			});
			const generatorAddress = await hre.run(TASK_PRE_DEPLOY_CHECK, {
				contract: "Secp256k1Generator",
			});

			const messenger = await (async () => {
				if (!messengerAddress) {
					log("Deploying ERC5564Messenger...");
					const messenger = await new ERC5564Messenger__factory(deployer).deploy();
					hre.deployed.ERC5564_MESSENGER = messenger.address;
					await messenger.deployed();
					return messenger;
				} else {
					return new ERC5564Messenger__factory(deployer).attach(messengerAddress);
				}
			})();

			const registry = await (async () => {
				if (!registryAddress) {
					log("Deploying ERC5564Registry");
					const registry = await new ERC5564Registry__factory(deployer).deploy();
					hre.deployed.ERC5564_REGISTRY = registry.address;
					await registry.deployed();
					return registry;
				} else {
					return new ERC5564Registry__factory(deployer).attach(registryAddress);
				}
			})();

			const generator = await (async () => {
				if (!generatorAddress) {
					log("Deploying Secp256k1Generator");
					const generator = await new Secp256k1Generator__factory(deployer).deploy(registry.address);
					hre.deployed.SECP256K1_GENERATOR = generator.address;
					await generator.deployed();
					return generator;
				} else {
					return new Secp256k1Generator__factory(deployer).attach(generatorAddress);
				}
			})();

			log(`ERC5564_REGISTRY_ADDRESS=${registry.address}`);
			log(`SECP_256K1_GENERATOR_ADDRESS=${generator.address}`);
			log(`ERC5564_MESSENGER_ADDRESS=${messenger.address}`);
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
