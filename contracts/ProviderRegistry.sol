// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessController.sol";

contract ProviderRegistry {
    enum Tier {
        Standard,
        Business
    }

    struct Provider {
        bool active;
        Tier tier;
        // (선택) 다음 달부터 적용할 등급 예약
        bool hasNextTier;
        Tier nextTier;
        uint256 nextTierEffectiveMonthId; // YYYYMM
    }

    AccessController public acl;

    // 제공사 주소(= 리워드 수령 지갑, AA 스마트계정) → 정보
    mapping(address => Provider) public providers;

    // 등급별 월 한도(회): 요구사항값
    uint256 public constant CAP_STANDARD = 100_000;
    uint256 public constant CAP_BUSINESS = 1_000_000;

    event ProviderRegistered(address indexed supplier, Tier tier);
    event ProviderUpdated(address indexed supplier, bool active, Tier tier);
    event ProviderTierScheduled(
        address indexed supplier,
        Tier nextTier,
        uint256 monthId
    );

    modifier onlyAdmin() {
        if (!acl.hasRole(acl.ADMIN_ROLE(), msg.sender)) revert("NotAuthorized");
        _;
    }

    constructor(address _acl) {
        acl = AccessController(_acl);
    }

    function registerProvider(address supplier, Tier tier) external onlyAdmin {
        Provider storage p = providers[supplier];
        p.active = true;
        p.tier = tier;
        emit ProviderRegistered(supplier, tier);
    }

    function updateProvider(
        address supplier,
        bool active,
        Tier tier
    ) external onlyAdmin {
        Provider storage p = providers[supplier];
        p.active = active;
        p.tier = tier;
        // 예약 초기화
        p.hasNextTier = false;
        emit ProviderUpdated(supplier, active, tier);
    }

    // 다음 달부터 등급 승격/변경 예약(필요 시 사용)
    function scheduleTierNextMonth(
        address supplier,
        Tier nextTier,
        uint256 monthId
    ) external onlyAdmin {
        Provider storage p = providers[supplier];
        p.hasNextTier = true;
        p.nextTier = nextTier;
        p.nextTierEffectiveMonthId = monthId;
        emit ProviderTierScheduled(supplier, nextTier, monthId);
    }

    // 월 롤오버 시 호출하여 예약 등급 반영
    function rollTierIfDue(
        address supplier,
        uint256 currentMonthId
    ) external onlyAdmin {
        Provider storage p = providers[supplier];
        if (p.hasNextTier && currentMonthId >= p.nextTierEffectiveMonthId) {
            p.tier = p.nextTier;
            p.hasNextTier = false;
        }
    }

    function monthlyCapOf(address supplier) public view returns (uint256) {
        Provider memory p = providers[supplier];
        if (!p.active) return 0;
        return (p.tier == Tier.Standard) ? CAP_STANDARD : CAP_BUSINESS;
    }

    function isActive(address supplier) external view returns (bool) {
        return providers[supplier].active;
    }

    function tierOf(address supplier) external view returns (Tier) {
        return providers[supplier].tier;
    }
}
