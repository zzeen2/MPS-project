// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AAModule", (m) => {
  // 먼저 EntryPoint를 배포합니다
  const entryPoint = m.contract("EntryPoint");

  // EntryPoint 주소를 사용하여 SmartAccountFactory를 배포합니다
  const smartAccountFactory = m.contract("SmartAccountFactory", [entryPoint]);

  // EntryPoint 주소를 사용하여 Paymaster를 배포합니다
  const paymaster = m.contract("Paymaster", [entryPoint]);

  return { entryPoint, smartAccountFactory, paymaster };
});
