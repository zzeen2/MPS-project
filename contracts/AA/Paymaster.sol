// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Paymaster {
    address public immutable entryPoint;
    address public immutable owner;

    mapping(address => bool) public whiteList;

    uint constant MAX_COST = 0.01 ether;

    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
        owner = msg.sender; 
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
        require(whiteList[smartAccount], "You're not on whiteList");
        // require(amount <= MAX_COST);
        return true;
    }
}
