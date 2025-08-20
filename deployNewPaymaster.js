const {ethers} = require("ethers");
require("dotenv").config();

async function deployNewPaymaster() {
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🚀 새로운 Paymaster 컨트랙트 배포 시작");
    console.log(`배포자 주소: ${wallet.address}`);
    console.log(`EntryPoint 주소: ${process.env.EntryPoint}`);

    // Paymaster 컨트랙트 배포
    const PaymasterFactory = await ethers.getContractFactory("Paymaster", wallet);
    const paymaster = await PaymasterFactory.deploy(process.env.EntryPoint);
    await paymaster.waitForDeployment();

    const paymasterAddress = await paymaster.getAddress();
    console.log(`✅ 새로운 Paymaster 배포 완료: ${paymasterAddress}`);

    // Paymaster에 ETH 입금 (가스비 대납용)
    console.log("\n💰 Paymaster에 ETH 입금 중...");
    const depositAmount = ethers.parseEther("0.05"); // 0.05 ETH 입금
    const depositTx = await paymaster.deposit({ value: depositAmount });
    await depositTx.wait();
    
    const balance = await paymaster.getBalance();
    console.log(`✅ Paymaster 입금 완료: ${ethers.formatEther(balance)} ETH`);

    // 기존 스마트 계정을 화이트리스트에 추가
    const { createPrivateKey } = require("./createAccount.js");
    const smartAccountFactoryAbi = require("./artifacts/contracts/AA/SmartAccountFactory.sol/SmartAccountFactory.json").abi;
    const smartAccountFactory = new ethers.Contract(process.env.SmartAccountFactory, smartAccountFactoryAbi, provider);
    
    const email = "dummy_company@email.com";
    const smartAccountOwnerPrivateKey = createPrivateKey(email, "dummy_salt", "dummy_business_number");
    const smartAccountOwnerWallet = new ethers.Wallet(smartAccountOwnerPrivateKey, provider);
    const smartAccountAddress = await smartAccountFactory.getAccount(smartAccountOwnerWallet.address);

    console.log(`\n📋 스마트 계정을 화이트리스트에 추가: ${smartAccountAddress}`);
    const addWhitelistTx = await paymaster.addWhiteList(smartAccountAddress);
    await addWhitelistTx.wait();
    
    const isWhitelisted = await paymaster.whiteList(smartAccountAddress);
    console.log(`✅ 화이트리스트 추가 완료: ${isWhitelisted}`);

    console.log("\n🎉 새로운 Paymaster 설정 완료!");
    console.log("=".repeat(50));
    console.log(`새로운 Paymaster 주소: ${paymasterAddress}`);
    console.log(`Paymaster 잔액: ${ethers.formatEther(balance)} ETH`);
    console.log(`화이트리스트 상태: ${isWhitelisted}`);
    console.log("=".repeat(50));
    console.log(`\n📝 .env 파일에 다음을 업데이트하세요:`);
    console.log(`Paymaster=${paymasterAddress}`);

    return paymasterAddress;
}

if (require.main === module) {
    deployNewPaymaster().catch(console.error);
}

module.exports = { deployNewPaymaster };
