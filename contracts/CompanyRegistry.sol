// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AccessController.sol";

contract CompanyRegistry {
    enum Plan {
        Free,
        Standard,
        Business
    }
    struct Company {
        bool active;
        Plan plan;
    }
    AccessController public acl;
    mapping(address => Company) public companies;

    uint256 public constant CAP_STANDARD = 1000; // 회
    uint256 public constant CAP_BUSINESS = 5000; // 회

    modifier onlyAdmin() {
        if (!acl.hasRole(acl.ADMIN_ROLE(), msg.sender)) revert("NotAuthorized");
        _;
    }
    constructor(address _acl) {
        acl = AccessController(_acl);
    }

    function upsertCompany(
        address company,
        bool active,
        Plan plan
    ) external onlyAdmin {
        companies[company] = Company(active, plan);
    }

    function snapshot(
        address company
    ) external view returns (Plan plan, uint256 cap) {
        Company memory c = companies[company];
        if (!c.active) return (Plan.Free, 0); // 비활성은 사실상 보상없음
        if (c.plan == Plan.Free) return (c.plan, 0);
        return (
            c.plan,
            (c.plan == Plan.Standard) ? CAP_STANDARD : CAP_BUSINESS
        );
    }
}
