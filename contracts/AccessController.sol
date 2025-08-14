// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "node_modules/@openzeppelin/contracts/access/AccessControl.sol";

contract AccessController is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    constructor(address superAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(ADMIN_ROLE, superAdmin);
    }
}
