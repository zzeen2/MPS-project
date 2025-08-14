// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// interface ITuner {
// function balanceOf(address smartAccount) external view returns (uint);
// }

contract Paymaster {
    address public immutable entryPoint;
    //address public immutable token;
    address public immutable owner;

    mapping(address => bool) public whiteList;

    uint constant TOKEN_AMOUNT = 10 ** 18;
    uint constant MAX_COST = 0.01 ether;

    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
        owner = msg.sender; // paymaster 컨트랙트 배포자가 owner
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function addWhiteList(address smartAccount) external onlyOwner {
        whiteList[smartAccount] = true;
    }

    function removeWhiteList(address smartAccount) external onlyOwner {
        whiteList[smartAccount] = false;
    }

    function validatePaymasterUserOp(
        address smartAccount,
        uint amount
    ) external view onlyEntryPoint returns (bool) {
        // uint balance = ITuner(token).balanceOf(smartAccount);
        // require(balance >= TOKEN_AMOUNT);
        require(whiteList[smartAccount], "You're not on whiteList");
        require(amount <= MAX_COST);
        return true;
    }
}
