import { HardhatUserConfig, extendEnvironment } from "hardhat/config";
import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-erc1820";
import "solidity-coverage";
import "hardhat-interact";
import "hardhat-packager";
import "@nomiclabs/hardhat-etherscan";

// task
import "./tasks/index";
dotenv.config();

declare module "hardhat/types/runtime" {
	// This new field will be available in tasks' actions, scripts, and tests.
	export interface HardhatRuntimeEnvironment {
		deployed: {
			VC_REGISTRY?: string;
			CAP_TABLE_REGISTRY?: string;
		};
	}
}
// Initate empty deployments object because nothing is deployed when starting runtime.
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
		],
	},
	contractSizer: {
		alphaSort: true,
		runOnCompile: true,
		disambiguatePaths: false,
	},
	packager: {
		contracts: ["ERC1400"],
		includeFactories: true,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
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
		brokLocal: {
			url: "http://localhost:8545",
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
