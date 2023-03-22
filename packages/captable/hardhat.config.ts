import { HardhatUserConfig, extendEnvironment } from "hardhat/config";
import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-erc1820";
import "solidity-coverage";
import "hardhat-interact";
import "@nomiclabs/hardhat-etherscan";
import "@nomicfoundation/hardhat-chai-matchers";
import { readdirSync } from "fs";

// Runs every time hardhat is started, so we can import tasks only if typechain-types folder exists
// If there's problems with finding typechain files, then the problem is probably here:
try {
	readdirSync("typechain-types");
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	import("./tasks/index");
} catch (error) {
	console.log("No typechain-types folder found, skipping import of tasks");
}

dotenv.config();

declare module "hardhat/types/runtime" {
	// This new field will be available in tasks' actions, scripts, and tests.
	export interface HardhatRuntimeEnvironment {
		deployed: {
			CAP_TABLE_REGISTRY?: string;
			VC_REGISTRY?: string;
			ERC5564_MESSENGER?: string;
			ERC5564_REGISTRY?: string;
			SECP256K1_GENERATOR?: string;
		};
	}
}
/* 
1. We extend the Hardhat Runtime Environment (HRE) with a new property called deployed.
2. This property is an object which will contain all the deployed contracts.
3. We set it to an empty object because we have not deployed anything yet. */
extendEnvironment((hre) => {
	hre.deployed = {};
});

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: "0.8.7",
				settings: {
					optimizer: {
						enabled: true,
						runs: 1,
					},
				},
			},
			{
				version: "0.8.16",
				settings: {
					optimizer: {
						enabled: true,
						runs: 1,
					},
				},
			},
		],
	},
	contractSizer: {
		alphaSort: true,
		runOnCompile: true,
		disambiguatePaths: false,
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS === "true",
		gasPrice: 21,
		currency: "USD",
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	networks: {
		hardhat: {
			// allowUnlimitedContractSize: true,
			accounts: {
				mnemonic: process.env.SEED_DEV,
			},
		},
		brokDev: {
			url: process.env.RPC_TESTNET,
			accounts: {
				mnemonic: process.env.SEED_DEV,
			},
		},
		brokStage: {
			url: process.env.RPC_STAGENET,
			accounts: {
				mnemonic: process.env.SEED_STAGE,
			},
		},
		brokProd: {
			url: process.env.RPC_TESTNET,
			accounts: {
				mnemonic: process.env.SEED_STAGE,
			},
		},
	},
};

export default config;
