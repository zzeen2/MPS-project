// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SmartAccountFactoryModule", (m) => {
  // EntryPoint 주소를 파라미터로 받습니다
  // 배포 시 --parameters로 전달하거나, 기본값을 사용할 수 있습니다
  const entryPointAddress = m.getParameter("0x165E0aF1E897496f51995fEC279c903b539DFae4");

  const smartAccountFactory = m.contract("SmartAccountFactory", [entryPointAddress]);

  return { smartAccountFactory };
});
