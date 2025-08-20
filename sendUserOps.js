const {ethers, AbiCoder} = require("ethers");
const axios = require("axios");
require("dotenv").config();

const { createPrivateKey } = require("./createAccount.js");

const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const paymasterWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // 가스비 대납 계정

const email = "dummy_company@email.com";
const smartAccountOwnerPrivateKey = createPrivateKey(email, "dummy_salt", "dummy_business_number");
const smartAccountOwnerWallet = new ethers.Wallet(smartAccountOwnerPrivateKey, provider);

console.log(`스마트 계정 Owner EOA: ${smartAccountOwnerWallet.address}`);


const tokenCA = process.env.RewardToken
const tokenAbi = require("./artifacts/contracts/RewardToken.sol/RewardToken.json").abi;

const recordUsageCA = process.env.RecordUsage
const recordUsageAbi = require("./artifacts/contracts/RecordUsage.sol/RecordUsage.json").abi;

const entryPointCA = process.env.EntryPoint
const entryPointAbi = require("./artifacts/contracts/AA/EntryPoint.sol/EntryPoint.json").abi;

// 스마트 계정 주소를 동적으로 가져오기
const smartAccountFactoryAbi = require("./artifacts/contracts/AA/SmartAccountFactory.sol/SmartAccountFactory.json").abi;
const smartAccountFactory = new ethers.Contract(process.env.SmartAccountFactory, smartAccountFactoryAbi, provider);

// 실제 스마트 계정 주소를 조회
const getSmartAccountAddress = async () => {
    try {
        const smartAccountAddress = await smartAccountFactory.getAccount(smartAccountOwnerWallet.address);
        console.log(`조회된 스마트 계정 주소: ${smartAccountAddress}`);
        return smartAccountAddress;
    } catch (error) {
        console.error("스마트 계정 주소 조회 실패:", error.message);
        throw error; // 에러 발생시 실행 중단
    }
};

const smartAccountAbi = require("./artifacts/contracts/AA/SmartAccount.sol/SmartAccount.json").abi;

// 공통 UserOp 생성 함수
const createUserOp = async (callData, smartAccountAddress) => {
    const entryPoint = new ethers.Contract(entryPointCA, entryPointAbi, paymasterWallet);
    const nonce = await entryPoint.nonces(smartAccountAddress);

    // paymasterAndData 처리: 일단 paymaster 없이 테스트
    let paymasterAndData = process.env.Paymaster;
    // if (process.env.Paymaster && process.env.Paymaster.startsWith("0x") && process.env.Paymaster.length >= 42) {
    //     paymasterAndData = process.env.Paymaster;
    // }

    const userOp = {
        sender: smartAccountAddress,
        nonce, 
        initCode: "0x",
        callData,
        callGasLimit: 200000n,
        verificationGasLimit: 100000n,
        preVerificationGas: 21000n,
        maxFeePerGas: ethers.parseUnits("5", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
        paymasterAndData: paymasterAndData,
        signature: "0x"
    };

    return userOp;
};

// UserOp 서명 함수 - EntryPoint와 동일한 해시 생성 방식 사용
const signUserOp = async (userOp) => {
    // EntryPoint의 _getUserOpHash와 동일한 방식으로 해시 생성
    const userOpHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            [
                "address", // sender
                "uint256", // nonce
                "bytes32", // keccak256(initCode)
                "bytes32", // keccak256(callData)
                "uint256", // callGasLimit
                "uint256", // verificationGasLimit
                "uint256", // preVerificationGas
                "uint256", // maxFeePerGas
                "uint256", // maxPriorityFeePerGas
                "bytes32", // keccak256(paymasterAndData)
                "bytes32"  // keccak256(signature) - 빈 signature로 해시 생성
            ],
            [
                userOp.sender,
                userOp.nonce,
                ethers.keccak256(userOp.initCode),
                ethers.keccak256(userOp.callData),
                userOp.callGasLimit,
                userOp.verificationGasLimit,
                userOp.preVerificationGas,
                userOp.maxFeePerGas,
                userOp.maxPriorityFeePerGas,
                ethers.keccak256(userOp.paymasterAndData),
                ethers.keccak256(userOp.signature) // 초기에는 "0x"의 해시
            ]
        )
    );
    
    // EntryPoint의 _toSignMessageHash와 동일한 방식으로 서명할 해시 생성
    const ethSignedMessageHash = ethers.keccak256(
        ethers.solidityPacked(
            ["string", "bytes32"],
            ["\x19Ethereum Signed Message:\n32", userOpHash]
        )
    );
    
    // 스마트 계정 owner의 개인키로 직접 해시에 서명 (signMessage 대신 signing key 사용)
    const signature = smartAccountOwnerWallet.signingKey.sign(ethSignedMessageHash).serialized;
    userOp.signature = signature;

    console.log("UserOp Hash:", userOpHash);
    console.log("Eth Signed Message Hash:", ethSignedMessageHash);
    console.log("Signature:", signature);
    
    // 서명 검증 테스트 (디버깅용)
    const recoveredAddress = ethers.recoverAddress(ethSignedMessageHash, signature);
    console.log("서명에서 복구된 주소:", recoveredAddress);
    console.log("스마트 계정 Owner 주소:", smartAccountOwnerWallet.address);
    console.log("주소 일치 여부:", recoveredAddress.toLowerCase() === smartAccountOwnerWallet.address.toLowerCase());

    return userOp;
};

// Bundler에 전송하는 함수
const sendToBundler = async (userOp) => {
    const userOpToJson = (userOp) => {
        const result = {};
        for (const key in userOp) {
            const value = userOp[key];
            result[key] = typeof value === "bigint" ? value.toString() : value;
        }
        return result;
    };

    try {
        const res = await axios.post("http://localhost:4000/userop", userOpToJson(userOp));
        console.log(`userOps bundler에 전달 완료: ${res.data.message}`);
        return res.data;
    } catch (error) {
        console.error("Bundler 전송 실패:", error.message);
        throw error;
    }
};

// 1. 리워드 토큰 민팅 테스트
const testRewardTokenMint = async () => {
    console.log("=== 리워드 토큰 민팅 테스트 ===");
    
    const smartAccountAddress = await getSmartAccountAddress();
    const smartAccount = new ethers.Contract(smartAccountAddress, smartAccountAbi, provider);
    const token = new ethers.Contract(tokenCA, tokenAbi, provider);

    const amount = ethers.parseEther("1000");
    const mintCallData = token.interface.encodeFunctionData("mint", [smartAccountAddress, amount]);
    
    const value = ethers.parseEther("0");
    const callData = smartAccount.interface.encodeFunctionData("execute", [tokenCA, value, mintCallData]);
    
    const userOp = await createUserOp(callData, smartAccountAddress);
    const signedUserOp = await signUserOp(userOp);
    
    return await sendToBundler(signedUserOp);
};

// 2. 음원 재생 기록 테스트 (기업이 직접 호출)
const testRecordPlay = async (trackId, rewardAmount) => {
    console.log("=== 음원 재생 기록 테스트 (기업 직접 호출) ===");
    
    const smartAccountAddress = await getSmartAccountAddress();
    console.log(`사용할 스마트 계정 주소: ${smartAccountAddress}`);
    
    // 스마트 계정이 실제로 배포되었는지 확인
    const code = await provider.getCode(smartAccountAddress);
    if (code === "0x") {
        console.error("❌ 스마트 계정이 배포되지 않았습니다! createAccount.js를 먼저 실행하세요.");
        return;
    }
    console.log("✅ 스마트 계정이 배포되어 있습니다.");
    
    // 스마트 계정의 ETH 잔액 확인 (paymaster 없이 실행할 경우 필요)
    const balance = await provider.getBalance(smartAccountAddress);
    console.log(`스마트 계정 ETH 잔액: ${ethers.formatEther(balance)} ETH`);
    if (balance === 0n) {
        console.warn("⚠️ 스마트 계정에 ETH가 없습니다. 가스비 지불을 위해 ETH가 필요할 수 있습니다.");
    }
    
    const smartAccount = new ethers.Contract(smartAccountAddress, smartAccountAbi, provider);
    const recordUsage = new ethers.Contract(recordUsageCA, recordUsageAbi, provider);
    
    // 기업이 승인되었는지 확인
    const isApproved = await recordUsage.approvedCompanies(smartAccountAddress);
    console.log(`기업 승인 상태: ${isApproved ? "승인됨" : "승인되지 않음"}`);
    if (!isApproved) {
        console.warn("⚠️ 기업이 승인되지 않았습니다. 트랜잭션이 실패할 수 있습니다.");
    }
    
    const clientTs = Math.floor(Date.now() / 1000); // 현재 시간 (초)
    console.log(`트랙 ID: ${trackId}, 리워드: ${rewardAmount}, 시간: ${clientTs}`);
    
    const recordPlayCallData = recordUsage.interface.encodeFunctionData("recordPlay", [
        trackId,
        clientTs,
        rewardAmount
    ]);
    
    const value = ethers.parseEther("0");
    const callData = smartAccount.interface.encodeFunctionData("execute", [recordUsageCA, value, recordPlayCallData]);
    
    console.log("CallData 생성 완료, UserOp 생성 중...");
    
    const userOp = await createUserOp(callData, smartAccountAddress);
    console.log("UserOp 생성 완료, 서명 중...");
    
    const signedUserOp = await signUserOp(userOp);
    console.log("서명 완료, Bundler로 전송 중...");
    
    return await sendToBundler(signedUserOp);
};

// 3. 기업 승인 테스트 (관리자만 가능)
const testSetCompanyApproval = async (companyAddress, approved) => {
    console.log("=== 기업 승인 설정 테스트 ===");
    
    const smartAccountAddress = await getSmartAccountAddress();
    const smartAccount = new ethers.Contract(smartAccountAddress, smartAccountAbi, provider);
    const recordUsage = new ethers.Contract(recordUsageCA, recordUsageAbi, provider);

    const setApprovalCallData = recordUsage.interface.encodeFunctionData("setCompanyApproval", [
        companyAddress,
        approved
    ]);
    
    const value = ethers.parseEther("0");
    const callData = smartAccount.interface.encodeFunctionData("execute", [recordUsageCA, value, setApprovalCallData]);
    
    const userOp = await createUserOp(callData, smartAccountAddress);
    const signedUserOp = await signUserOp(userOp);
    
    return await sendToBundler(signedUserOp);
};

// 4. 관리자를 통한 음원 재생 기록 테스트
const testRecordPlayByOwner = async (usingCompany, trackId, rewardAmount) => {
    console.log("=== 음원 재생 기록 테스트 (관리자 호출) ===");
    
    const smartAccountAddress = await getSmartAccountAddress();
    const smartAccount = new ethers.Contract(smartAccountAddress, smartAccountAbi, provider);
    const recordUsage = new ethers.Contract(recordUsageCA, recordUsageAbi, provider);

    const clientTs = Math.floor(Date.now() / 1000);
    const recordPlayByOwnerCallData = recordUsage.interface.encodeFunctionData("recordPlayByOwner", [
        usingCompany,
        trackId,
        clientTs,
        rewardAmount
    ]);
    
    const value = ethers.parseEther("0");
    const callData = smartAccount.interface.encodeFunctionData("execute", [recordUsageCA, value, recordPlayByOwnerCallData]);
    
    const userOp = await createUserOp(callData, smartAccountAddress);
    const signedUserOp = await signUserOp(userOp);
    
    return await sendToBundler(signedUserOp);
};

// 5. 컨트랙트 일시정지 테스트
const testPauseContract = async () => {
    console.log("=== 컨트랙트 일시정지 테스트 ===");
    
    const smartAccountAddress = await getSmartAccountAddress();
    const smartAccount = new ethers.Contract(smartAccountAddress, smartAccountAbi, provider);
    const recordUsage = new ethers.Contract(recordUsageCA, recordUsageAbi, provider);

    const pauseCallData = recordUsage.interface.encodeFunctionData("pause", []);
    
    const value = ethers.parseEther("0");
    const callData = smartAccount.interface.encodeFunctionData("execute", [recordUsageCA, value, pauseCallData]);
    
    const userOp = await createUserOp(callData, smartAccountAddress);
    const signedUserOp = await signUserOp(userOp);
    
    return await sendToBundler(signedUserOp);
};

// 통합 테스트 실행 함수
const runAllTests = async () => {
    try {
        console.log("🚀 통합 테스트 시작\n");

        const smartAccountAddress = await getSmartAccountAddress();
        console.log(`테스트 대상 스마트 계정: ${smartAccountAddress}\n`);

        // 1. 기업 승인 설정
        // await testSetCompanyApproval(smartAccountAddress, true);
        // await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기

        // 2. 음원 재생 기록 (기업 직접 호출)
        await testRecordPlay(12345, 100);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. 음원 재생 기록 (관리자 호출)
        // await testRecordPlayByOwner(smartAccountAddress, 67890, 200);
        // await new Promise(resolve => setTimeout(resolve, 2000));

        // 4. 리워드 토큰 민팅
        // await testRewardTokenMint();
        // await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("\n✅ 모든 테스트 완료");
    } catch (error) {
        console.error("❌ 테스트 실행 중 오류:", error.message);
    }
};

// 사용 예시
if (require.main === module) {
    // 개별 테스트 실행
    testRecordPlay(12345, 100); // 트랙 ID 12345, 리워드 100
    // getSmartAccountAddress().then(addr => testSetCompanyApproval(addr, true)); // 현재 스마트 계정을 승인된 기업으로 설정
    
    // 전체 테스트 실행
    // runAllTests();
}

// 함수들을 모듈로 내보내기 (다른 파일에서 사용 가능)
module.exports = {
    testRewardTokenMint,
    testRecordPlay,
    testSetCompanyApproval,
    testRecordPlayByOwner,
    testPauseContract,
    runAllTests,
    getSmartAccountAddress
};