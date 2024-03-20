import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig, DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config"
// import { network } from "hardhat";


const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    if(chainId===31337){
        log("Local network detected! Deploying mocks....")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",            
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!");
        log("_____________________________________________")
    }
}
export default deployMocks;
deployMocks.tags=["all","mocks"];