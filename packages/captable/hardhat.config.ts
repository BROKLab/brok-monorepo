import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();
const config: HardhatUserConfig = {
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
      url: process.env.RPC_ARBITRUM_RINKEBY,
      accounts: {
        mnemonic: process.env.SEED_DEV,
      },
    },
    brokStage: {
      url: process.env.RPC_ARBITRUM_RINKEBY,
      accounts: {
        mnemonic: process.env.SEED_STAGE,
      },
    },
    brokProd: {
      url: process.env.RPC_ARBITRUM_RINKEBY,
      accounts: {
        mnemonic: process.env.SEED_STAGE,
      },
    },
    // brokProd: {
    //   url: process.env.RPC_ARBITRUM_ONE,
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
