import debug from "debug";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { VCRegistry__factory } from "../typechain-types";
import { TASK_PRE_DEPLOY_CHECK } from "./generate-deployments";

export const TASK_DEPLOY_VC_REGISTRY = "deploy-vc-registry";
const log = debug(`brok:task:${TASK_DEPLOY_VC_REGISTRY}`);
task(TASK_DEPLOY_VC_REGISTRY, "Deploy contract")
	.addFlag("dev", "Deploy development state.")
	.addFlag("redeploy", "Redeploy the contract instance on network if finds deployment deployment")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			const [deployer] = await hre.ethers.getSigners();
			if (hre.hardhatArguments.verbose || taskArgs.log) {
				log.enabled = true;
			}

			/* Get contract dependencies */
			let contractAddress = await hre.run(TASK_PRE_DEPLOY_CHECK, {
				contract: "VC_REGISTRY",
				redeploy: taskArgs.redeploy,
			});

			const contract = await (async () => {
				log(`CAP_TABLE_REGISTRY address: ${contractAddress}, will ${contractAddress ? "attach" : "deploy"}}`);
				if (!contractAddress) {
					const _contract = await new VCRegistry__factory(deployer).deploy();
					await _contract.deployed();
					hre.deployed.VC_REGISTRY = _contract.address;
					return _contract;
				} else {
					const _contract = await new VCRegistry__factory(deployer).attach(contractAddress);
					return _contract;
				}
			})();
			log("VC_REGISTRY deployed at: ", contract.address);
			//
			await (
				await contract.grantRole(hre.ethers.utils.id("OPERATOR_ROLE"), "0x0a665B1Bc813cAE9fcDd2Eb7E25b8E55A5F35f23")
			).wait();
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
