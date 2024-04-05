import {deployments, ethers, getNamedAccounts} from "hardhat";
import {FundMe, MockV3Aggregator} from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";

describe("Fund Me", async function () {
    let fundMe: FundMe;
    let mockV3Aggregator: MockV3Aggregator;
    let deployer : SignerWithAddress;

    beforeEach(async function () {
        const accounts= await ethers.getSigners();
        deployer= accounts[0];

        await deployments.fixture("all");
        fundMe = await ethers.getContract("FundMe");
        mockV3Aggregator= await ethers.getContract("MockV3Aggregator");
    })

    describe("constructor", async function () {
        it("Sets the aggregator address corectly",async function () {
            const response= await fundMe.getPriceFeed();
            assert.equal(response, await mockV3Aggregator.getAddress())
        })
    })
    describe("fund", async function () {

        it("Fails if you don't send enough ETH",async ()=>{
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        })
        it("Should update amount funded",async () => {
            await fundMe.fund({value: ethers.parseEther("1")});
            const response = await fundMe.getAddressToAmountFunded(deployer.address);
            assert.equal(response.toString(), ethers.parseEther("1").toString())
        })
        it("Should add funder to array of funders",async () => {
            await fundMe.fund({ value: ethers.parseEther("1") });
            const response = await fundMe.getFunder(0);
            assert.equal(response, deployer.address);
        })
    })
    describe("withdraw", async function () {
        beforeEach(async () => {
            await fundMe.fund({ value: ethers.parseEther("1") });
        })
        it("Should return to funder all their ETH back",async () => {
            const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
            const startingDeployerBalance = await ethers.provider.getBalance(deployer.address);
            
            const transactionResponse= await fundMe.withdraw();
            const transactionReceipt= await transactionResponse.wait();

            const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
            const endingDeployerBalance = await ethers.provider.getBalance(deployer.address);

            assert.equal(endingFundMeBalance, BigInt(0));

            const gasAmount= transactionReceipt!.gasUsed;
            const gasPrice= transactionReceipt!.gasPrice;
            
            const gasCost = gasAmount * gasPrice;
            assert.equal((startingFundMeBalance + startingDeployerBalance), (endingDeployerBalance + gasCost));
       
        })
        it("allow us to withdraw with multiple funders",async () => {
            const accounts= await ethers.getSigners();

            await fundMe
                .connect(accounts[1])
                .fund({ value: ethers.parseEther("1") })
            await fundMe
                .connect(accounts[2])
                .fund({ value: ethers.parseEther("1") })
            await fundMe
                .connect(accounts[3])
                .fund({ value: ethers.parseEther("1") })
            await fundMe
                .connect(accounts[4])
                .fund({ value: ethers.parseEther("1") })
            await fundMe
                .connect(accounts[5])
                .fund({ value: ethers.parseEther("1") })

            const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
            const startingDeployerBalance = await ethers.provider.getBalance(deployer.address);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait();

            const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
            const endingDeployerBalance = await ethers.provider.getBalance(deployer.address);

            const gasAmount = transactionReceipt!.gasUsed;
            const gasPrice = transactionReceipt!.gasPrice;

            const gasCost = gasAmount * gasPrice;
            // assert.equal((startingFundMeBalance + startingDeployerBalance), (endingDeployerBalance + gasCost));
            // await expect(fundMe.funders(0)).to.be.reverted;

            assert.equal(
                (await fundMe.getAddressToAmountFunded(accounts[1].address)),
                BigInt(0)
            )
            assert.equal(
                (await fundMe.getAddressToAmountFunded(accounts[2].address)).toString(),
                "0"
            )
            assert.equal(
                (await fundMe.getAddressToAmountFunded(accounts[3].address)).toString(),
                "0"
            )
            assert.equal(
                (await fundMe.getAddressToAmountFunded(accounts[4].address)).toString(),
                "0"
            )
            assert.equal(
                (await fundMe.getAddressToAmountFunded(accounts[5].address)).toString(),
                "0"
            )

        })
        
    })
})