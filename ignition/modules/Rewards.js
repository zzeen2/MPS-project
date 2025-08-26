// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RewardsModule", (m) => {
  // 배포자의 주소를 파라미터로 받습니다 (기본값: deployer 계정)
  const admin = m.getParameter("admin", m.getAccount(0));

  // 먼저 RewardToken을 배포합니다
  const rewardToken = m.contract("RewardToken", [admin]);

  // RewardToken 주소를 사용하여 RecordUsage 컨트랙트를 배포합니다
  const recordUsage = m.contract("RecordUsage", [admin, rewardToken]);

  // RewardToken에 RecordUsage 컨트랙트 주소를 설정합니다
  m.call(rewardToken, "setRecordUsageContract", [recordUsage]);

  return { rewardToken, recordUsage };
});
