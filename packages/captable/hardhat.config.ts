import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
// import "hardhat-ethernal";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();
const config: HardhatUserConfig = {
  // ethernal: {
  //   email: process.env.ETHERNAL_EMAIL,
  //   password: process.env.ETHERNAL_PASSWORD,
  //   disableSync: false, // If set to true, plugin will not sync blocks & txs
  //   disableTrace: false, // If set to true, plugin won't trace transaction
  //   workspace: undefined, // Set the workspace to use, will default to the default workspace (latest one used in the dashboard). It is also possible to set it through the ETHERNAL_WORKSPACE env variable
  //   uploadAst: true, // If set to true, plugin will upload AST, and you'll be able to use the storage feature (longer sync time though)
  //   disabled: false, // If set to true, the plugin will be disabled, nohting will be synced, ethernal.push won't do anything either
  // },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
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
      url: process.env.RPC_TESTNET,
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
    // brokProd: {
    //   url: process.env.RPC_MAINNET,
    //   accounts: {
    //     mnemonic: process.env.SEED_PROD,
    //   },
    // },
  },
  typechain: {
    outDir: "./src/typechain",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
      {
        version: "0.5.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
