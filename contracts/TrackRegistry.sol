// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "node_modules/@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./AccessController.sol";

contract TrackRegistry {
    using EnumerableSet for EnumerableSet.UintSet;

    struct Track {
        bytes32 metaHash; // 메타데이터 해시(IPFS 등)
        uint256 priceKRW; // 1회 호출 가격(원) – 리워드 비례 산식에 사용
        bool active;
        address supplier; // 제공사(리워드 수령 지갑, AA)
        // 가격 예약(다음 시간대부터 적용)
        uint256 pendingPriceKRW;
        uint256 pendingEffectiveHourId; // YYYYMMDDHH
    }

    AccessController public acl;
    mapping(uint256 => Track) public tracks;
    EnumerableSet.UintSet private _trackIds;

    event TrackRegistered(
        uint256 indexed trackId,
        bytes32 metaHash,
        uint256 priceKRW,
        address supplier
    );
    event TrackUpdated(
        uint256 indexed trackId,
        bytes32 metaHash,
        uint256 priceKRW,
        address supplier,
        bool active
    );
    event PriceScheduled(
        uint256 indexed trackId,
        uint256 priceKRW,
        uint256 effectiveHourId
    );

    modifier onlyAdmin() {
        if (!acl.hasRole(acl.ADMIN_ROLE(), msg.sender)) revert("NotAuthorized");
        _;
    }

    constructor(address _acl) {
        acl = AccessController(_acl);
    }

    function registerTrack(
        uint256 trackId,
        bytes32 metaHash,
        uint256 priceKRW,
        address supplier
    ) external onlyAdmin {
        require(!_trackIds.contains(trackId), "exists");
        tracks[trackId] = Track({
            metaHash: metaHash,
            priceKRW: priceKRW,
            active: true,
            supplier: supplier,
            pendingPriceKRW: 0,
            pendingEffectiveHourId: 0
        });
        _trackIds.add(trackId);
        emit TrackRegistered(trackId, metaHash, priceKRW, supplier);
    }

    function updateTrackAdmin(
        uint256 trackId,
        bytes32 metaHash,
        address supplier,
        bool active
    ) external onlyAdmin {
        require(_trackIds.contains(trackId), "notfound");
        Track storage t = tracks[trackId];
        t.metaHash = metaHash;
        t.supplier = supplier;
        t.active = active;
        emit TrackUpdated(
            trackId,
            t.metaHash,
            t.priceKRW,
            t.supplier,
            t.active
        );
    }

    function schedulePrice(
        uint256 trackId,
        uint256 newPriceKRW,
        uint256 effectiveHourId
    ) external onlyAdmin {
        require(_trackIds.contains(trackId), "notfound");
        Track storage t = tracks[trackId];
        t.pendingPriceKRW = newPriceKRW;
        t.pendingEffectiveHourId = effectiveHourId;
        emit PriceScheduled(trackId, newPriceKRW, effectiveHourId);
    }

    // (주의) 이 함수는 운영툴에서 시간 경계에 맞춰 호출해 주세요.
    function rollPriceIfDue(
        uint256 trackId,
        uint256 currentHourId
    ) external onlyAdmin {
        Track storage t = tracks[trackId];
        if (
            t.pendingEffectiveHourId != 0 &&
            currentHourId >= t.pendingEffectiveHourId
        ) {
            t.priceKRW = t.pendingPriceKRW;
            t.pendingPriceKRW = 0;
            t.pendingEffectiveHourId = 0;
            emit TrackUpdated(
                trackId,
                t.metaHash,
                t.priceKRW,
                t.supplier,
                t.active
            );
        }
    }

    // 읽기 헬퍼
    function getSupplier(uint256 trackId) external view returns (address) {
        return tracks[trackId].supplier;
    }
    function getPriceKRW(uint256 trackId) external view returns (uint256) {
        return tracks[trackId].priceKRW;
    }
    function isActive(uint256 trackId) external view returns (bool) {
        return tracks[trackId].active;
    }
    function trackIds() external view returns (uint256[] memory ids) {
        ids = _trackIds.values();
    }
}
