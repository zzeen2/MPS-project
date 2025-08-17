// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * 온체인 역할: "투명한 기록" 전용.
 * - recordPlay: 회사 스마트계정(ERC-4337 userOp)이 직접 호출 → 사용 내역 이벤트
 * - recordRewardBatch: 백엔드(오너)가 10초 단위로 모아서 호출 → 리워드 발생 이벤트
 *
 * periodId: YYYYMM (월 ID)
 * reason:   0=PAID,
 *           1=TRACK_POOL_DEPLETED,
 *           2=COMPANY_CAP_REACHED,
 *           3=FREE_PLAN_NO_REWARD,
 *           4=INACTIVE_TRACK
 */
contract UsageAndRewardLedgerOwnable is Ownable {
    // 선택적 idempotency 키(중복 방지). 0x0이면 체크 안 함.
    mapping(bytes32 => bool) public usedKeys;

    event PlayRecorded(
        address indexed company, // msg.sender (회사 스마트계정)
        uint256 indexed trackId, // 사용 트랙 ID
        uint64 clientTs, // 클라/서버 기록 시각(초). 없으면 0
        uint256 blockTs, // 블록 타임스탬프(초)
        bytes32 key, // 선택 키(중복 방지)
        bytes32 dataHash // 선택 데이터 해시(JSON/CSV keccak256 등)
    );

    event RewardRecorded(
        address indexed operator, // 기록 주체(= owner)
        address indexed company, // 리워드 수령 주체
        uint256 indexed trackId, // 트랙
        uint256 periodId, // YYYYMM
        uint256 amount, // 리워드 수량(단위는 오프체인 합의)
        uint8 reason, // 위 reason 코드
        bytes32 key, // 선택 키(중복 방지)
        bytes32 dataHash // 선택 데이터 해시(스냅샷/인보이스 해시 등)
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// 회사 스마트계정(ERC-4337 userOp)이 직접 호출: "사용 내역" 기록
    function recordPlay(
        uint256 trackId,
        uint64 clientTs,
        bytes32 key,
        bytes32 dataHash
    ) external {
        if (key != bytes32(0)) {
            require(!usedKeys[key], "dup key");
            usedKeys[key] = true;
        }
        emit PlayRecorded(
            msg.sender,
            trackId,
            clientTs,
            block.timestamp,
            key,
            dataHash
        );
    }

    /// 백엔드(오너)가 10초 단위로 모아서 "리워드 발생" 기록
    /// - 모든 배열 길이는 동일해야 함
    /// - key가 0x0이면 idempotency 체크를 생략(가스 절약)
    /// - key가 이미 쓰였으면 "해당 항목만 스킵" (배치 전체는 계속 진행)
    function recordRewardBatch(
        address[] calldata companies,
        uint256[] calldata trackIds,
        uint256[] calldata periodIds,
        uint256[] calldata amounts,
        uint8[] calldata reasons,
        bytes32[] calldata keys,
        bytes32[] calldata dataHashes
    ) external onlyOwner {
        uint256 n = companies.length;
        require(
            n == trackIds.length &&
                n == periodIds.length &&
                n == amounts.length &&
                n == reasons.length &&
                n == keys.length &&
                n == dataHashes.length,
            "length mismatch"
        );

        for (uint256 i = 0; i < n; i++) {
            // 중복 키면 해당 항목만 무시(배치 성공 보장)
            if (keys[i] != bytes32(0)) {
                if (usedKeys[keys[i]]) continue;
                usedKeys[keys[i]] = true;
            }
            emit RewardRecorded(
                owner(),
                companies[i],
                trackIds[i],
                periodIds[i],
                amounts[i],
                reasons[i],
                keys[i],
                dataHashes[i]
            );
        }
    }
}
