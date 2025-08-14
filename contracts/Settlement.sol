// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./AccessController.sol";
import "./TrackRegistry.sol";
import "./ProviderRegistry.sol";
import "./RewardToken.sol";

contract Settlement is ReentrancyGuard {
    using ECDSA for bytes32;

    AccessController public acl;
    TrackRegistry public trackReg;
    ProviderRegistry public providerReg;
    RewardToken public rewardToken;

    // 1 KRW = 0.001 MPSR (18 decimals 기준)
    uint256 public constant TOKEN_PER_KRW_NUM = 1;
    uint256 public constant TOKEN_PER_KRW_DEN = 1000;

    // “제공사 × 월(YYYYMM)” 누적 카운팅(회)
    mapping(address => mapping(uint256 => uint256))
        public monthlyCountByProvider;

    // 시간대 앵커 (회사별 머클 루트 — ‘누가/언제’ 증빙)
    struct HourlyAnchor {
        bytes32 merkleRoot;
        string ipfsCID;
        bool submitted;
        uint256 submittedAt;
    }
    // company(소비 기업) × hourId(YYYYMMDDHH)
    mapping(address => mapping(uint256 => HourlyAnchor)) public hourly;

    // 중복 민팅 방지: hourId × trackId
    mapping(uint256 => mapping(uint256 => bool)) public processedHourTrack;

    // 월 인보이스 앵커
    struct MonthlyInvoice {
        string invoiceCID;
        bool submitted;
        bool finalized;
        uint256 submittedAt;
    }
    mapping(uint256 => MonthlyInvoice) public monthly; // monthId(YYYYMM)

    // 3일 이의제기
    uint256 public immutable disputeWindow = 3 days;

    // EIP-712
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant HOURLY_TYPEHASH =
        keccak256(
            "SubmitHourlyUsage(address company,uint256 hourId,bytes32 merkleRoot,string ipfsCID)"
        );
    // 시간대 리워드 민팅(트랙 합계만 전달)
    bytes32 public constant HOURLY_REWARD_TYPEHASH =
        keccak256(
            "MintHourlyRewards(uint256 hourId,uint256 monthId,uint256[] trackIds,uint256[] rewardCounts)"
        );
    bytes32 public constant MONTHLY_TYPEHASH =
        keccak256("SubmitMonthlyInvoice(uint256 monthId,string invoiceCID)");

    event HourlyRootSubmitted(
        address indexed company,
        uint256 indexed hourId,
        bytes32 merkleRoot,
        string ipfsCID
    );
    // 핵심 4요소(무엇/언제/얼마) + 수령자(제공사)
    event HourlyRewardsMinted(
        uint256 indexed hourId,
        uint256 indexed monthId,
        uint256 trackId,
        address supplier,
        uint256 counted,
        uint256 mintedAmount
    );
    event MonthlyInvoiceSubmitted(uint256 indexed monthId, string invoiceCID);
    event MonthlyFinalized(uint256 indexed monthId);

    modifier onlyAdmin() {
        if (!acl.hasRole(acl.ADMIN_ROLE(), msg.sender)) revert("NotAuthorized");
        _;
    }

    constructor(
        address _acl,
        address _trackReg,
        address _providerReg,
        address _rewardToken,
        string memory _name,
        string memory _version
    ) {
        acl = AccessController(_acl);
        trackReg = TrackRegistry(_trackReg);
        providerReg = ProviderRegistry(_providerReg);
        rewardToken = RewardToken(_rewardToken);

        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(_name)),
                keccak256(bytes(_version)),
                chainId,
                address(this)
            )
        );
    }

    /* ------------------------------
       1) 회사별(소비자) 시간대 집계 루트 앵커
    -------------------------------*/
    function submitHourlyUsageRoot(
        address company,
        uint256 hourId, // YYYYMMDDHH (KST)
        bytes32 merkleRoot,
        string calldata ipfsCID,
        bytes calldata oracleSig
    ) external {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        HOURLY_TYPEHASH,
                        company,
                        hourId,
                        merkleRoot,
                        keccak256(bytes(ipfsCID))
                    )
                )
            )
        );
        address signer = digest.recover(oracleSig);
        if (!acl.hasRole(acl.ORACLE_ROLE(), signer)) revert("NotAuthorized");

        HourlyAnchor storage h = hourly[company][hourId];
        require(!h.submitted, "hour anchored");
        h.merkleRoot = merkleRoot;
        h.ipfsCID = ipfsCID;
        h.submitted = true;
        h.submittedAt = block.timestamp;

        emit HourlyRootSubmitted(company, hourId, merkleRoot, ipfsCID);
    }

    /* ------------------------------
       2) 시간대 리워드 민팅 (트랙 합계, 제공사 월 한도 적용)
          - rewardCounts[i] = 해당 시간대 trackId[i]의 유효재생 합계(회)
          - 제공사 월 한도를 초과하면 초과분은 미민팅
    -------------------------------*/
    function mintHourlyRewards(
        uint256 hourId,
        uint256 monthId, // YYYYMM
        uint256[] calldata trackIds,
        uint256[] calldata rewardCounts,
        bytes calldata oracleSig
    ) external {
        require(trackIds.length == rewardCounts.length, "len mismatch");

        // ORACLE_ROLE 서명 검증
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        HOURLY_REWARD_TYPEHASH,
                        hourId,
                        monthId,
                        keccak256(abi.encodePacked(trackIds)),
                        keccak256(abi.encodePacked(rewardCounts))
                    )
                )
            )
        );
        address signer = digest.recover(oracleSig);
        if (!acl.hasRole(acl.ORACLE_ROLE(), signer)) revert("NotAuthorized");

        for (uint256 i = 0; i < trackIds.length; i++) {
            uint256 trackId = trackIds[i];
            require(!processedHourTrack[hourId][trackId], "already processed");
            processedHourTrack[hourId][trackId] = true;

            // 트랙 상태/정보
            if (!trackReg.isActive(trackId)) continue; // 비활성 트랙 스킵
            address supplier = trackReg.getSupplier(trackId);
            uint256 priceKRW = trackReg.getPriceKRW(trackId);

            // 제공사 활성/월 한도
            if (!providerReg.isActive(supplier)) continue;
            uint256 cap = providerReg.monthlyCapOf(supplier);
            uint256 used = monthlyCountByProvider[supplier][monthId];
            uint256 remained = (cap > used) ? (cap - used) : 0;

            // 이번 시간대 집계
            uint256 counted = rewardCounts[i];
            if (counted > remained) counted = remained; // 초과분 컷
            if (counted == 0) {
                emit HourlyRewardsMinted(
                    hourId,
                    monthId,
                    trackId,
                    supplier,
                    0,
                    0
                );
                continue;
            }

            // 리워드 = counted × priceKRW × 0.001 (18 decimals)
            uint256 amountPerCall = (priceKRW * TOKEN_PER_KRW_NUM * 1e18) /
                TOKEN_PER_KRW_DEN;
            uint256 mintAmount = amountPerCall * counted;

            if (mintAmount > 0) {
                rewardToken.mint(supplier, mintAmount);
                monthlyCountByProvider[supplier][monthId] = used + counted;
            }

            emit HourlyRewardsMinted(
                hourId,
                monthId,
                trackId,
                supplier,
                counted,
                mintAmount
            );
        }
    }

    /* ------------------------------
       3) 월 인보이스 앵커 & 확정 (KRW 후불)
    -------------------------------*/
    function submitMonthlyInvoice(
        uint256 monthId,
        string calldata invoiceCID,
        bytes calldata oracleSig
    ) external {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        MONTHLY_TYPEHASH,
                        monthId,
                        keccak256(bytes(invoiceCID))
                    )
                )
            )
        );
        address signer = digest.recover(oracleSig);
        if (!acl.hasRole(acl.ORACLE_ROLE(), signer)) revert("NotAuthorized");

        MonthlyInvoice storage m = monthly[monthId];
        require(!m.submitted, "invoice submitted");
        m.invoiceCID = invoiceCID;
        m.submitted = true;
        m.submittedAt = block.timestamp;

        emit MonthlyInvoiceSubmitted(monthId, invoiceCID);
    }

    function finalizeMonthly(uint256 monthId) external onlyAdmin {
        MonthlyInvoice storage m = monthly[monthId];
        require(m.submitted, "no invoice");
        require(!m.finalized, "finalized");
        require(block.timestamp >= m.submittedAt + disputeWindow, "in dispute");
        m.finalized = true;
        emit MonthlyFinalized(monthId);
    }
}
