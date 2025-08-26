// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RewardToken.sol";

contract RecordUsage is Ownable, Pausable, ReentrancyGuard {
    RewardToken public rewardToken;
    mapping(address => bool) public approvedCompanies;
    mapping(uint256 => uint256) public trackPlayCount; 
    mapping(address => uint256) public companyTotalRewards;
    
    // 리워드 풀 관리
    uint256 public rewardPool;  // 컨트랙트가 보유한 리워드 토큰 양
    
    enum UseCase {
        Music_use, // 일반 음원 사용 (Inst 음원도 포함, 기록되는 음원 Id로 구분)
        Lyric_use // 가사만 사용
    }

    event PlayRecorded(
        address indexed using_company, 
        uint256 indexed track_id, 
        uint64 client_ts,
        uint256 block_ts, 
        uint256 reward_amount,
        UseCase usecase
    );

    event CompanyApproved(address indexed company, bool approved);
    event RewardPoolReplenished(uint256 amount);

    error CompanyNotApproved();
    error InvalidTrackId();
    error InvalidTimestamp();
    error InsufficientRewardPool();

    modifier onlyApprovedCompany() {
        if (!approvedCompanies[msg.sender]) revert CompanyNotApproved();
        _;
    }

    modifier validTrackId(uint256 track_id) {
        if (track_id == 0) revert InvalidTrackId();
        _;
    }

    modifier validTimestamp(uint64 client_ts) {
        if (client_ts == 0 || client_ts > block.timestamp)
            revert InvalidTimestamp();
        _;
    }

    constructor(
        address initial_owner,
        address _rewardToken
    ) Ownable(initial_owner) {
        require(_rewardToken != address(0), "Invalid reward token address");
        rewardToken = RewardToken(_rewardToken);
    }

    // 리워드 풀 보충 함수
    function replenishRewardPool(uint256 amount) external onlyOwner {
        rewardToken.mint(address(this), amount);
        rewardPool += amount;
        emit RewardPoolReplenished(amount);
    }

    function setCompanyApproval(
        address company,
        bool approved
    ) external onlyOwner {
        require(company != address(0), "Invalid company address");
        approvedCompanies[company] = approved;
        emit CompanyApproved(company, approved);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function recordPlay(
        uint256 track_id,
        uint64 client_ts,
        uint256 reward_amount, 
        UseCase usecase
    )
        external
        onlyApprovedCompany
        whenNotPaused
        validTrackId(track_id)
        validTimestamp(client_ts)
        nonReentrant
    {
        trackPlayCount[track_id]++;
        companyTotalRewards[msg.sender] += reward_amount;

        emit PlayRecorded(
            msg.sender,
            track_id,
            client_ts,
            block.timestamp,
            reward_amount,
            usecase
        );

        if (reward_amount > 0) {
            _transferReward(msg.sender, reward_amount);
        }
    }

    function _transferReward(address to, uint256 amount) internal {
        if (rewardPool < amount) revert InsufficientRewardPool();
        rewardPool -= amount;
        rewardToken.transfer(to, amount);
    }
}
