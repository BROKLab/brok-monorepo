import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import debug from "debug";
const log = debug("captable:tasks:generate-deployments");
task("generate-deployments", "Create a deployments folder")
	.addFlag("log", "Log execution")
	.setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			console.log("log", hre.hardhatArguments.verbose, taskArgs.log);
			if (hre.hardhatArguments.verbose || taskArgs.log) {
				log.enabled = true;
			}
			const indexFilePath = "deployments/index.ts";
			const deploysFilePath = "deployments/deploys.ts";
			// debug.enable("captable*");
			if (!existsSync("./deployments")) {
				mkdirSync("deployments");
			}
			if (!existsSync(indexFilePath)) {
				writeFileSync(indexFilePath, "");
			}
			if (!existsSync(deploysFilePath)) {
				writeFileSync(deploysFilePath, "");
			}
			const indexFile = readFileSync(indexFilePath, "utf8");

			const deploysFile = readFileSync(deploysFilePath, "utf8");

			// ensure we have files for each network
			for (const networkName of Object.keys(hre.config.networks)) {
				log("create deployments for network: ", networkName);
				if (networkName === "hardhat") continue;
				// ensure file exists
				if (!existsSync(`deployments/${networkName}Contracts.ts`)) {
					writeFileSync(
						`deployments/${networkName}Contracts.ts`,
						`export const ${networkName}Contracts = ${JSON.stringify({})}	 as const;`,
					);
				}
				// write imports to index
				if (!deploysFile.includes(`export * from "./${networkName}Contracts";`)) {
					appendFileSync(deploysFilePath, `\nexport * from "./${networkName}Contracts";`);
				}
				// write deploys to file
				if (hre.network.name === networkName) {
					if (Object.values(hre.deployed).length === 0) {
						log("No contracts deployed, nothing to generate");
						return;
					}
					const enviromentsText = `export const ${networkName}Contracts = ${JSON.stringify(hre.deployed)}	as const;`;

					writeFileSync(`deployments/${networkName}Contracts.ts`, enviromentsText);
				}
				log("END create deployments for network: ", networkName);
			}

			if (!indexFile.includes(`export * from "./../typechain-types/index";`)) {
				appendFileSync(indexFilePath, `\nexport * from "./../typechain-types/index";`);
			}
			if (!indexFile.includes(`export * from "./deploys";`)) {
				appendFileSync(indexFilePath, `\nexport * from "./deploys";`);
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	});
