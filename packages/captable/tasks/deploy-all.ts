import { exec } from "child_process";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import debug from "debug";
const log = debug("captable:deploy-all");

task("deploy-all", "Create a deployments folder")
	.addFlag("reset", "Force redeply contracts, will set new contract instances in env and deployment")
	.addFlag("dev", "Deploy development state.")
	.addFlag("log", "Log execution")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			if (hre.hardhatArguments.verbose || taskArgs.log) {
				log.enabled = true;
			}
			log("deploy-all network:", hre.network.name);
			// if reset is false then we use addresses from env file. If its set, the sub-task will not deploy the contract. Just connect with it.
			if (!taskArgs.reset && hre.network.name !== "localhost") {
				hre.deployed.CAP_TABLE_REGISTRY = process.env[`CAP_TABLE_REGISTRY_${hre.network.name}`];
			}
			await hre.run("deploy-cap-table-registry", {
				dev: taskArgs.dev,
				updateEnv: true,
				log: hre.hardhatArguments.verbose || taskArgs.log,
			});
			await hre.run("generate-deployments", {
				log: hre.hardhatArguments.verbose || taskArgs.log,
			});
			log("Starting tsup build");
			const tsup = new Promise((resolve, reject) => {
				exec("pnpm tsup", (error, stdout, stderr) => {
					if (error) {
						log(`tsup error: ${error}`);
						return reject(error);
					}
					log(stdout);
					log(stderr);
					resolve(true);
				});
			});
			log("Waiting tsup build");
			await tsup;
			log("Finished tsup build");
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
