import debug from "debug";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { VCRegistry__factory } from "../typechain-types";
import { TASK_GET_CONTRACT_ADDRESS, TASK_PRE_DEPLOY_CHECK } from "./generate-deployments";

export const TASK_GRANT_OPERATOR = "grant-operator";
const log = debug(`brok:task:${TASK_GRANT_OPERATOR}`);
task(TASK_GRANT_OPERATOR, "Grant OPERATOR ROLE to address in VC_REGISTRY")
	.addPositionalParam("address", "Address to grant OPERATOR ROLE", undefined, types.string)
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			const [deployer] = await hre.ethers.getSigners();
			if (hre.hardhatArguments.verbose || taskArgs.log) {
				log.enabled = true;
			}
			if (!("address" in taskArgs)) {
				throw new Error("Must provide address to grant OPERATOR ROLE");
			}

			/* Get contract dependencies */
			let contractAddress = await hre.run(TASK_GET_CONTRACT_ADDRESS, {
				contract: "VC_REGISTRY",
			});
			if (!contractAddress) {
				throw new Error("VC_REGISTRY not found in deployments, maybe you are on an Ephemeal Network?");
			}
			const contract = VCRegistry__factory.connect(contractAddress, deployer);
			//
			log("Granting OPERATOR ROLE to: ", taskArgs.address);
			const tx = await contract.grantRole(hre.ethers.utils.id("OPERATOR_ROLE"), taskArgs.address);
			log("Waiting for tx: ", tx.hash);
			const receipt = await tx.wait();
			log("Received tx receipt: ", receipt.transactionHash);

			log("Checking that roles is granted...");
			const hasRole = await contract.hasRole(hre.ethers.utils.id("OPERATOR_ROLE"), taskArgs.address);
			log("Has role: ", hasRole);
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
