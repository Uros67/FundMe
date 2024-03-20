// import
import {HardhatRuntimeEnvironment} from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import "dotenv/config";
import verify from "../utils/verify"


const deployFundMe: DeployFunction = async function (hre: HardhatRuntimeEnvironment){
    const {getNamedAccounts, deployments, network}= hre;
    const {deploy, log}= deployments;
    const {deployer}= await getNamedAccounts();
    const chainId : number= network.config.chainId!;

    let ethUsdPriceFeedAddress: string;
    if(chainId === 31337){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress= ethUsdAggregator.address;
    } else{
        ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
    }
    log("_________________________________________________")
    log("Deploying FundMe and waiting for confirmations...")

    const args = [ethUsdPriceFeedAddress]

    const fundMe= await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY){
        await verify(fundMe.address, args)
    }
}
export default deployFundMe;
deployFundMe.tags=["all", "fundme"];