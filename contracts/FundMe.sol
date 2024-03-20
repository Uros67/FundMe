// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
/** 
 * @title Contract implemented for crowd funding
 * @author Uros Djordjevic
 * @notice Price is converted from eth to usd
*/
contract FundMe {
/** 
 * @notice We are using priceConverter library for conversion form ETH to $USD
*/
    using PriceConverter for uint256;

/**  
 * @notice From address get amount of funded resources
 * @dev key is type of address and value is type of uint256
*/
    mapping(address => uint256) private s_addressToAmountFunded;

/**  @notice list of all funders*/
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
/** 
 * @notice address of fund contributor
*/
    address private immutable i_owner;

/**
 * @notice Minimum amount of funded resources
*/
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    
/**
 * @notice Aggregator interface of contact that returns latest ETH/USD price
*/
    AggregatorV3Interface private s_priceFeed;

/**
 * @notice Function can be accessed only if msg.sender is owner
 * If not show error NotOwner 
 */
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

/**
 * @notice Connected account is set to be owner
 * @param priceFeedAddress is address of contract with latest price of ETH/USD
*/
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed= AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

/**
 * @notice function to fund- send resources 
 * @notice value must be bigger than MINIMUM_USD
 * @dev add msg.value to msg.sender total funded amount
 * @dev add msg.sender to list of funders
 */
    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
/**
 * @notice function to withdraw resources to your account
 * @notice only owner of recoucess can withdraw
 */
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function getOwner() public view returns(address){
        return i_owner;
    }
    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }
    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }
    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }

    //     function getVersion() public view returns (uint256){
    //     // ETH/USD price feed address of Sepolia Network.
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    //     return priceFeed.version();
    // }

}

