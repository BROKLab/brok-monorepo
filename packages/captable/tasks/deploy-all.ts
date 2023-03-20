import { exec } from "child_process";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import debug from "debug";
import { TASK_GENERATE_DEPLOYMENTS, TASK_GENERATE_NPM_PACKAGE } from "./generate-deployments";
import { TASK_DEPLOY_CAP_TABLE_REGISTRY } from "./deploy-cap-table-registry";
import { TASK_DEPLOY_VC_REGISTRY } from "./deploy-vc-registry";
const log = debug("brok:task:deploy-all");

task("deploy-all", "Create a deployments folder")
	.addFlag("redeploy", "Force redeploy contracts, will set new contract instances.")
	.addFlag("dev", "Deploy development state.")
	.addFlag("log", "Log execution")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			if (hre.hardhatArguments.verbose || taskArgs.log) {
				log.enabled = true;
			}
			log("deploy-all network:", hre.network.name);

			await hre.run(TASK_DEPLOY_CAP_TABLE_REGISTRY, {
				dev: taskArgs.dev,
				log: hre.hardhatArguments.verbose || taskArgs.log,
				redeploy: taskArgs.redeploy,
			});
			await hre.run(TASK_DEPLOY_VC_REGISTRY, {
				dev: taskArgs.dev,
				log: hre.hardhatArguments.verbose || taskArgs.log,
				redeploy: taskArgs.redeploy,
			});
			await hre.run(TASK_GENERATE_DEPLOYMENTS, {
				log: hre.hardhatArguments.verbose || taskArgs.log,
			});
			await hre.run(TASK_GENERATE_NPM_PACKAGE, {
				log: false,
			});
			log("deploy-all network:", hre.network.name, " done");
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
