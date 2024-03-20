import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomicfoundation/hardhat-ethers';
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import 'hardhat-deploy';
import "dotenv/config";


const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY

const config: HardhatUserConfig = {
  solidity: "0.8.8",
  mocha: {
    timeout: 100000000,
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat:{
      chainId: 31337,
    },
    goerli: {
      url: RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
      // blockConfirmations: 6,
    }
  },
  etherscan:{
    apiKey: ETHERSCAN_API,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
};

export default config;
