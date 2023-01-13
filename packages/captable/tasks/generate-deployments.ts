import { existsSync, readFileSync, writeFileSync } from "fs";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("generate-deployments", "Create a deployments folder").setAction(
	async (_: TaskArguments, hre: HardhatRuntimeEnvironment) => {
		try {
			const networkName = hre.network.name === "hardhat" ? "localhost" : hre.network.name;

			if (Object.values(hre.deployed).length === 0) {
				console.log("No contracts deployed, nothing to generate");
				return;
			}
			const enviromentsText = `
				export const ${networkName}Contracts =  ${JSON.stringify(hre.deployed)}	 as const;`;

			await writeFileSync(`deployments/${networkName}Contracts.ts`, enviromentsText);

			if (!existsSync("deployments/index.ts")) {
				await writeFileSync("deployments/index.ts", "");
			}
			const indexFile = readFileSync("deployments/index.ts", "utf8");

			if (!indexFile.includes(`export * from "./../typechain-types/index";`)) {
				await writeFileSync("deployments/index.ts", `${indexFile}\nexport * from "./../typechain-types/index";`);
			}
			if (!indexFile.includes(`export * from "./${networkName}Contracts";`)) {
				await writeFileSync("deployments/index.ts", `${indexFile}\nexport * from "./${networkName}Contracts";`);
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
);
