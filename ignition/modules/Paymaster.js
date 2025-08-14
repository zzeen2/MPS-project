// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PaymasterModule", (m) => {
  // EntryPoint 주소를 파라미터로 받습니다
  const entryPointAddress = m.getParameter("entryPointAddress");

  const paymaster = m.contract("Paymaster", [entryPointAddress]);

  return { paymaster };
});
