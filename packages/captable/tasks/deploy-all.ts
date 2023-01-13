import { exec } from "child_process";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("deploy-all", "Create a deployments folder")
	.addFlag("reset", "Force redeply contracts, will set new contract instances in env and deployment")
	.addFlag("dev", "Deploy development state.")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			if (!taskArgs.reset) {
				hre.deployed.CAP_TABLE_REGISTRY = process.env[`CAP_TABLE_REGISTRY_${hre.network.name}`];
			}
			await hre.run("deploy-cap-table-registry", { dev: taskArgs.dev, updateEnv: true });
			await hre.run("generate-deployments");
			const tsup = new Promise((resolve, reject) => {
				exec("pnpm tsup", (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return reject(error);
					}
					console.log(stdout);
					console.log(stderr);
					resolve(true);
				});
			});
			await tsup;
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
