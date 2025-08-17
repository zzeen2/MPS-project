// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * 역할 전담 컨트랙트
 * - ADMIN_ROLE : 운영용
 * - ORACLE_ROLE: 백엔드(기록 전송)용
 */
contract AccessController is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    constructor(address superAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(ADMIN_ROLE, superAdmin);
    }
}
