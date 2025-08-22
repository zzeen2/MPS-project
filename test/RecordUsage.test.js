const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("RecordUsage", function () {
  // 테스트용 픽스처 설정
  async function deployRecordUsageFixture() {
    // 계정 설정
    const [owner, company1, company2, unauthorizedUser] = await ethers.getSigners();

    // RewardToken 배포
    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy(owner.address);

    // RecordUsage 배포
    const RecordUsage = await ethers.getContractFactory("RecordUsage");
    const recordUsage = await RecordUsage.deploy(owner.address, await rewardToken.getAddress());

    // RewardToken의 MINTER_ROLE을 RecordUsage에 부여
    const MINTER_ROLE = await rewardToken.MINTER_ROLE();
    await rewardToken.grantRole(MINTER_ROLE, await recordUsage.getAddress());

    // 테스트 데이터
    const trackId = 12345;
    const rewardAmount = ethers.parseEther("0.1"); // 0.1 RWT
    const clientTimestamp = Math.floor(Date.now() / 1000); // 현재 시간

    return {
      recordUsage,
      rewardToken,
      owner,
      company1,
      company2,
      unauthorizedUser,
      trackId,
      rewardAmount,
      clientTimestamp
    };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { recordUsage, owner } = await loadFixture(deployRecordUsageFixture);
      expect(await recordUsage.owner()).to.equal(owner.address);
    });

    it("Should set the correct reward token", async function () {
      const { recordUsage, rewardToken } = await loadFixture(deployRecordUsageFixture);
      expect(await recordUsage.rewardToken()).to.equal(await rewardToken.getAddress());
    });

    it("Should not have any approved companies initially", async function () {
      const { recordUsage, company1 } = await loadFixture(deployRecordUsageFixture);
      expect(await recordUsage.approvedCompanies(company1.address)).to.be.false;
    });
  });

  describe("Company Management", function () {
    it("Should allow owner to approve a company", async function () {
      const { recordUsage, owner, company1 } = await loadFixture(deployRecordUsageFixture);
      
      await expect(recordUsage.setCompanyApproval(company1.address, true))
        .to.emit(recordUsage, "CompanyApproved")
        .withArgs(company1.address, true);
      
      expect(await recordUsage.approvedCompanies(company1.address)).to.be.true;
    });

    it("Should allow owner to revoke company approval", async function () {
      const { recordUsage, owner, company1 } = await loadFixture(deployRecordUsageFixture);
      
      // 먼저 승인
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 승인 취소
      await expect(recordUsage.setCompanyApproval(company1.address, false))
        .to.emit(recordUsage, "CompanyApproved")
        .withArgs(company1.address, false);
      
      expect(await recordUsage.approvedCompanies(company1.address)).to.be.false;
    });

    it("Should not allow non-owner to approve companies", async function () {
      const { recordUsage, company1, company2 } = await loadFixture(deployRecordUsageFixture);
      
      await expect(
        recordUsage.connect(company1).setCompanyApproval(company2.address, true)
      ).to.be.revertedWithCustomError(recordUsage, "OwnableUnauthorizedAccount");
    });

    it("Should revert when approving zero address", async function () {
      const { recordUsage } = await loadFixture(deployRecordUsageFixture);
      
      await expect(
        recordUsage.setCompanyApproval(ethers.ZeroAddress, true)
      ).to.be.revertedWith("Invalid company address");
    });
  });

  describe("Play Recording", function () {
    it("Should record play for approved company", async function () {
      const { recordUsage, rewardToken, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      // 기업 승인
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 재생 기록
      await expect(
        recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount)
      ).to.emit(recordUsage, "PlayRecorded")
        .withArgs(company1.address, trackId, clientTimestamp, await time.latest() + 1, rewardAmount);
    });

    it("Should increase track play count", async function () {
      const { recordUsage, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 초기 재생 횟수 확인
      expect(await recordUsage.getTrackPlayCount(trackId)).to.equal(0);
      
      // 재생 기록
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount);
      
      // 재생 횟수 증가 확인
      expect(await recordUsage.getTrackPlayCount(trackId)).to.equal(1);
    });

    it("Should accumulate company total rewards", async function () {
      const { recordUsage, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 초기 리워드 확인
      expect(await recordUsage.getCompanyTotalRewards(company1.address)).to.equal(0);
      
      // 재생 기록
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount);
      
      // 리워드 누적 확인
      expect(await recordUsage.getCompanyTotalRewards(company1.address)).to.equal(rewardAmount);
    });

    it("Should mint reward tokens", async function () {
      const { recordUsage, rewardToken, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 초기 토큰 잔액 확인
      expect(await rewardToken.balanceOf(company1.address)).to.equal(0);
      
      // 재생 기록
      await expect(
        recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount)
      ).to.emit(recordUsage, "RewardMinted")
        .withArgs(company1.address, rewardAmount);
      
      // 토큰 민팅 확인
      expect(await rewardToken.balanceOf(company1.address)).to.equal(rewardAmount);
    });

    it("Should reject unauthorized company", async function () {
      const { recordUsage, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      // 승인하지 않은 기업의 기록 시도
      await expect(
        recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount)
      ).to.be.revertedWithCustomError(recordUsage, "CompanyNotApproved");
    });

    it("Should reject invalid track ID", async function () {
      const { recordUsage, company1, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 잘못된 트랙 ID (0)
      await expect(
        recordUsage.connect(company1).recordPlay(0, clientTimestamp, rewardAmount)
      ).to.be.revertedWithCustomError(recordUsage, "InvalidTrackId");
    });

    it("Should reject invalid timestamp", async function () {
      const { recordUsage, company1, trackId, rewardAmount } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 잘못된 타임스탬프 (0)
      await expect(
        recordUsage.connect(company1).recordPlay(trackId, 0, rewardAmount)
      ).to.be.revertedWithCustomError(recordUsage, "InvalidTimestamp");
      
      // 미래 타임스탬프
      const futureTimestamp = (await time.latest()) + 3600; // 1시간 후
      await expect(
        recordUsage.connect(company1).recordPlay(trackId, futureTimestamp, rewardAmount)
      ).to.be.revertedWithCustomError(recordUsage, "InvalidTimestamp");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to record play for any company", async function () {
      const { recordUsage, owner, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      await expect(
        recordUsage.connect(owner).recordPlayByOwner(
          company1.address, trackId, clientTimestamp, rewardAmount
        )
      ).to.emit(recordUsage, "PlayRecorded")
        .withArgs(company1.address, trackId, clientTimestamp, await time.latest() + 1, rewardAmount);
    });

    it("Should reject owner recording for unapproved company", async function () {
      const { recordUsage, owner, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      // 승인하지 않은 기업에 대한 owner의 기록 시도
      await expect(
        recordUsage.connect(owner).recordPlayByOwner(
          company1.address, trackId, clientTimestamp, rewardAmount
        )
      ).to.be.revertedWith("Company not approved");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { recordUsage, owner } = await loadFixture(deployRecordUsageFixture);
      
      // 일시정지
      await recordUsage.connect(owner).pause();
      expect(await recordUsage.paused()).to.be.true;
      
      // 일시정지 해제
      await recordUsage.connect(owner).unpause();
      expect(await recordUsage.paused()).to.be.false;
    });

    it("Should reject play recording when paused", async function () {
      const { recordUsage, owner, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      await recordUsage.connect(owner).pause();
      
      await expect(
        recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount)
      ).to.be.revertedWithCustomError(recordUsage, "EnforcedPause");
    });
  });

  describe("Multiple Companies and Tracks", function () {
    it("Should handle multiple companies correctly", async function () {
      const { recordUsage, company1, company2, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      // 두 기업 승인
      await recordUsage.setCompanyApproval(company1.address, true);
      await recordUsage.setCompanyApproval(company2.address, true);
      
      // 각각 재생 기록
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount);
      await recordUsage.connect(company2).recordPlay(trackId, clientTimestamp, rewardAmount * 2n);
      
      // 트랙 재생 횟수: 총 2회
      expect(await recordUsage.getTrackPlayCount(trackId)).to.equal(2);
      
      // 각 기업별 리워드 확인
      expect(await recordUsage.getCompanyTotalRewards(company1.address)).to.equal(rewardAmount);
      expect(await recordUsage.getCompanyTotalRewards(company2.address)).to.equal(rewardAmount * 2n);
    });

    it("Should handle multiple tracks correctly", async function () {
      const { recordUsage, company1, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      const trackId1 = 111;
      const trackId2 = 222;
      
      // 두 트랙 재생 기록
      await recordUsage.connect(company1).recordPlay(trackId1, clientTimestamp, rewardAmount);
      await recordUsage.connect(company1).recordPlay(trackId2, clientTimestamp, rewardAmount);
      
      // 각 트랙별 재생 횟수 확인
      expect(await recordUsage.getTrackPlayCount(trackId1)).to.equal(1);
      expect(await recordUsage.getTrackPlayCount(trackId2)).to.equal(1);
      
      // 기업 총 리워드 확인
      expect(await recordUsage.getCompanyTotalRewards(company1.address)).to.equal(rewardAmount * 2n);
    });
  });

  describe("View Functions", function () {
    it("Should return correct track play count", async function () {
      const { recordUsage, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 여러 번 재생
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount);
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp + 1, rewardAmount);
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp + 2, rewardAmount);
      
      expect(await recordUsage.getTrackPlayCount(trackId)).to.equal(3);
    });

    it("Should return correct company total rewards", async function () {
      const { recordUsage, company1, trackId, rewardAmount, clientTimestamp } = 
        await loadFixture(deployRecordUsageFixture);
      
      await recordUsage.setCompanyApproval(company1.address, true);
      
      // 다양한 리워드로 재생
      await recordUsage.connect(company1).recordPlay(trackId, clientTimestamp, rewardAmount);
      await recordUsage.connect(company1).recordPlay(trackId + 1, clientTimestamp, rewardAmount * 2n);
      
      expect(await recordUsage.getCompanyTotalRewards(company1.address)).to.equal(rewardAmount * 3n);
    });
  });
});
