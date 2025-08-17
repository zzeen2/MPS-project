// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AccessController.sol";
import "./TrackRegistry.sol";
import "./CompanyRegistry.sol";
import "./RewardToken.sol";

contract Settlement {
    AccessController public acl;
    TrackRegistry public trackReg;
    CompanyRegistry public companyReg;
    RewardToken public reward;

    uint256 public activeMonthId; // YYYYMM (KST 기준 월경계는 운영툴이 갱신)

    // 회사별 월 수령 회수 누적(company × monthId → count)
    mapping(address => mapping(uint256 => uint256)) public companyCountByMonth;
    // 트랙별 월 사용 토큰 누적(trackId × monthId → tokenUsed(18d))
    mapping(uint256 => mapping(uint256 => uint256))
        public trackTokenUsedByMonth;

    // reasonCode: 0=paid, 1=trackPoolDepleted, 2=companyCapReached, 3=freePlanNoReward, 4=inactiveTrack
    event PlayRecorded(
        address indexed company,
        uint256 indexed trackId,
        uint256 indexed monthId,
        uint64 clientTs, // 선택: 프론트/서버에서 찍은 사용시각(없으면 0)
        uint256 blockTs,
        uint8 reason,
        uint256 minted // 18 decimals
    );

    modifier onlyAdmin() {
        if (!acl.hasRole(acl.ADMIN_ROLE(), msg.sender)) revert("NotAuthorized");
        _;
    }

    constructor(
        address _acl,
        address _trackReg,
        address _companyReg,
        address _reward
    ) {
        acl = AccessController(_acl);
        trackReg = TrackRegistry(_trackReg);
        companyReg = CompanyRegistry(_companyReg);
        reward = RewardToken(_reward);
    }

    function setActiveMonthId(uint256 yyyymm) external onlyAdmin {
        activeMonthId = yyyymm;
    }

    // 회사 스마트계정이 직접 호출 (EIP-4337 userOp로)
    function recordPlay(uint256 trackId, uint64 clientTs) external {
        address company = msg.sender;
        uint256 monthId = activeMonthId;

        // 트랙/회사 상태
        (bool active, uint256 rewardPerPlay, uint256 monthlyPoolCap) = trackReg
            .snapshot(trackId);
        if (!active) {
            emit PlayRecorded(
                company,
                trackId,
                monthId,
                clientTs,
                block.timestamp,
                4,
                0
            );
            return;
        }

        (CompanyRegistry.Plan plan, uint256 companyCap) = companyReg.snapshot(
            company
        );
        if (plan == CompanyRegistry.Plan.Free) {
            // 재생은 가능하나 리워드 없음
            emit PlayRecorded(
                company,
                trackId,
                monthId,
                clientTs,
                block.timestamp,
                3,
                0
            );
            return;
        }

        // 한도 체크
        uint256 usedCount = companyCountByMonth[company][monthId];
        if (usedCount >= companyCap) {
            emit PlayRecorded(
                company,
                trackId,
                monthId,
                clientTs,
                block.timestamp,
                2,
                0
            );
            return;
        }

        uint256 tokenUsed = trackTokenUsedByMonth[trackId][monthId];
        if (tokenUsed + rewardPerPlay > monthlyPoolCap) {
            emit PlayRecorded(
                company,
                trackId,
                monthId,
                clientTs,
                block.timestamp,
                1,
                0
            );
            return;
        }

        // 민팅 & 누적
        reward.mint(company, rewardPerPlay);
        companyCountByMonth[company][monthId] = usedCount + 1;
        trackTokenUsedByMonth[trackId][monthId] = tokenUsed + rewardPerPlay;

        emit PlayRecorded(
            company,
            trackId,
            monthId,
            clientTs,
            block.timestamp,
            0,
            rewardPerPlay
        );
    }
}
