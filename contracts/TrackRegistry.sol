// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AccessController.sol";

contract TrackRegistry {
    struct Track {
        bool active;
        uint256 rewardPerPlay; // 18d, 예: 0.1토큰 → 0.1 * 1e18
        uint256 monthlyPoolCap; // 18d, 월 지급 총량 상한
    }
    AccessController public acl;
    mapping(uint256 => Track) public tracks;

    modifier onlyAdmin() {
        if (!acl.hasRole(acl.ADMIN_ROLE(), msg.sender)) revert("NotAuthorized");
        _;
    }
    constructor(address _acl) {
        acl = AccessController(_acl);
    }

    function upsertTrack(
        uint256 trackId,
        bool active,
        uint256 rewardPerPlay,
        uint256 monthlyPoolCap
    ) external onlyAdmin {
        tracks[trackId] = Track(active, rewardPerPlay, monthlyPoolCap);
    }

    function snapshot(
        uint256 trackId
    )
        external
        view
        returns (bool active, uint256 rewardPerPlay, uint256 monthlyPoolCap)
    {
        Track memory t = tracks[trackId];
        return (t.active, t.rewardPerPlay, t.monthlyPoolCap);
    }
}
