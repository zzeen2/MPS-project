// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RewardToken.sol";

contract RecordUsage is Ownable, Pausable, ReentrancyGuard {
    RewardToken public rewardToken;
    mapping(address => bool) public approvedCompanies;
    mapping(uint256 => uint256) public trackPlayCount; // 트랙별 재생 횟수
    mapping(address => uint256) public companyTotalRewards; // 기업별 총 리워드

    event PlayRecorded(
        address indexed using_company, // 음원을 사용한 기업
        uint256 indexed track_id, // 사용한 음원 id
        uint64 client_ts, // 서버에서 기록된 시간
        uint256 block_ts, // 블록 시간
        uint256 reward_amount // 발생한 리워드 수량 
    );

    event CompanyApproved(address indexed company, bool approved);
    event RewardMinted(address indexed company, uint256 amount);

    error CompanyNotApproved();
    error InvalidTrackId();
    error InvalidTimestamp();

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

    // function setRewardToken(address _rewardToken) external onlyOwner {
    //     require(_rewardToken != address(0), "Invalid reward token address");
    //     rewardToken = RewardToken(_rewardToken);
    // }

    function recordPlay(
        uint256 track_id,
        uint64 client_ts,
        uint256 reward_amount 
    )
        external
        onlyApprovedCompany
        whenNotPaused
        validTrackId(track_id)
        validTimestamp(client_ts)
        nonReentrant
    {
        // 트랙 재생 횟수 증가
        trackPlayCount[track_id]++;

        // 기업 총 리워드 누적
        companyTotalRewards[msg.sender] += reward_amount;

        // 이벤트 발생
        emit PlayRecorded(
            msg.sender,
            track_id,
            client_ts,
            block.timestamp,
            reward_amount
        );

        // 리워드 민팅
        if (reward_amount > 0) {
            _mintReward(msg.sender, reward_amount);
        }
    }

    function recordPlayByOwner(
        address using_company,
        uint256 track_id,
        uint64 client_ts,
        uint256 reward_amount // uint256으로 변경
    )
        external
        onlyOwner
        whenNotPaused
        validTrackId(track_id)
        validTimestamp(client_ts)
        nonReentrant
    {
        require(approvedCompanies[using_company], "Company not approved");

        // 트랙 재생 횟수 증가
        trackPlayCount[track_id]++;

        // 기업 총 리워드 누적
        companyTotalRewards[using_company] += reward_amount;

        // 이벤트 발생
        emit PlayRecorded(
            using_company,
            track_id,
            client_ts,
            block.timestamp,
            reward_amount
        );

        // 리워드 민팅
        if (reward_amount > 0) {
            _mintReward(using_company, reward_amount);
        }
    }

    function _mintReward(address to, uint256 amount) internal {
        try rewardToken.mint(to, amount) {
            emit RewardMinted(to, amount);
        } catch {
            // 민팅 실패 시에도 기록은 유지하되, 이벤트로 알림
            // 실제 환경에서는 별도의 에러 처리 로직이 필요할 수 있음
        }
    }

    // View functions
    function getTrackPlayCount(
        uint256 track_id
    ) external view returns (uint256) {
        return trackPlayCount[track_id];
    }

    function getCompanyTotalRewards(
        address company
    ) external view returns (uint256) {
        return companyTotalRewards[company];
    }
}
