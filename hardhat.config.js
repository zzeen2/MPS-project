require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // 배포 최적화 (크기 축소)
      },
    },
  },
  paths: {
    sources: "./contracts/AA" // 단일 폴더로 제한
  },
  networks: {
    sepolia: {
      url: process.env.INFURA_RPC || "",
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
};
