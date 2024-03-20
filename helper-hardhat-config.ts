export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}
export const networkConfig: networkConfigInfo = {
    goerli: {
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        blockConfirmations: 6,
    },
    
    hardhat: {},
    localhost: {},


}
export const DECIMALS= 8;
export const INITIAL_ANSWER= 200000000000;
export const developmentChains= ["hardhat", "localhost"];
