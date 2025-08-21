const { ethers } = require("ethers");
require("dotenv").config();

// createAccount.js의 함수를 가져와서 실제 개인키 생성
const { createPrivateKey } = require("./createAccount.js");

const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);

// 컨트랙트 주소들 (환경변수에서 가져오기)
const rewardTokenCA = process.env.RewardToken;
const smartAccountFactoryCA = process.env.SmartAccountFactory;

// ABI 가져오기
const rewardTokenAbi = require("./artifacts/contracts/RewardToken.sol/RewardToken.json").abi;
const smartAccountFactoryAbi = require("./artifacts/contracts/AA/SmartAccountFactory.sol/SmartAccountFactory.json").abi;

// 스마트 계정 팩토리 인스턴스
const smartAccountFactory = new ethers.Contract(smartAccountFactoryCA, smartAccountFactoryAbi, provider);

// 리워드 토큰 인스턴스
const rewardToken = new ethers.Contract(rewardTokenCA, rewardTokenAbi, provider);

/**
 * 특정 EOA의 스마트 계정 주소를 조회
 * @param {string} eoaAddress - EOA 주소
 * @returns {string} 스마트 계정 주소
 */
const getSmartAccountAddress = async (eoaAddress) => {
    try {
        const smartAccountAddress = await smartAccountFactory.getAccount(eoaAddress);
        console.log(`EOA ${eoaAddress}의 스마트 계정 주소: ${smartAccountAddress}`);
        return smartAccountAddress;
    } catch (error) {
        console.error("스마트 계정 주소 조회 실패:", error.message);
        throw error;
    }
};

/**
 * 특정 주소의 ERC20 토큰 잔액 확인
 * @param {string} accountAddress - 확인할 계정 주소
 * @param {string} tokenAddress - ERC20 토큰 컨트랙트 주소
 * @returns {Object} 잔액 정보
 */
const checkTokenBalance = async (accountAddress, tokenAddress = rewardTokenCA) => {
    try {
        console.log(`\n🔍 토큰 잔액 확인 중...`);
        console.log(`계정 주소: ${accountAddress}`);
        console.log(`토큰 주소: ${tokenAddress}`);

        // ERC20 토큰 컨트랙트 인스턴스 생성
        const tokenContract = new ethers.Contract(tokenAddress, rewardTokenAbi, provider);

        // 토큰 정보 조회
        const [balance, name, symbol, decimals] = await Promise.all([
            tokenContract.balanceOf(accountAddress),
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals()
        ]);

        // 잔액을 읽기 쉬운 형태로 변환
        const formattedBalance = ethers.formatUnits(balance, decimals);

        const result = {
            accountAddress,
            tokenAddress,
            tokenName: name,
            tokenSymbol: symbol,
            decimals: Number(decimals),
            rawBalance: balance.toString(),
            formattedBalance,
            hasBalance: balance > 0n
        };

        console.log(`\n📊 토큰 잔액 정보:`);
        console.log(`토큰명: ${name} (${symbol})`);
        console.log(`소수점: ${decimals}`);
        console.log(`원시 잔액: ${balance.toString()}`);
        console.log(`포맷된 잔액: ${formattedBalance} ${symbol}`);
        console.log(`보유 여부: ${balance > 0n ? "✅ 보유" : "❌ 미보유"}`);

        return result;

    } catch (error) {
        console.error("❌ 토큰 잔액 확인 실패:", error.message);
        throw error;
    }
};

/**
 * 특정 기업의 스마트 계정 토큰 잔액 확인
 * @param {string} email - 기업 이메일
 * @param {string} salt - 솔트값
 * @param {string} businessNumber - 사업자번호
 */
const checkCompanyTokenBalance = async (email, salt, businessNumber) => {
    try {
        console.log(`\n🏢 기업 토큰 잔액 확인 시작`);
        console.log(`기업 정보: ${email}, ${businessNumber}`);

        // 1. 기업의 EOA 주소 생성
        const privateKey = createPrivateKey(email, salt, businessNumber);
        const wallet = new ethers.Wallet(privateKey, provider);
        const eoaAddress = wallet.address;

        console.log(`생성된 EOA 주소: ${eoaAddress}`);

        // 2. 스마트 계정 주소 조회
        const smartAccountAddress = await getSmartAccountAddress(eoaAddress);

        // 3. 스마트 계정이 존재하는지 확인
        if (smartAccountAddress === ethers.ZeroAddress) {
            console.log("❌ 해당 EOA의 스마트 계정이 존재하지 않습니다.");
            return null;
        }

        // 4. 토큰 잔액 확인
        const balanceInfo = await checkTokenBalance(smartAccountAddress);

        return {
            eoaAddress,
            smartAccountAddress,
            balanceInfo
        };

    } catch (error) {
        console.error("❌ 기업 토큰 잔액 확인 실패:", error.message);
        throw error;
    }
};

/**
 * 여러 주소의 토큰 잔액을 일괄 확인
 * @param {string[]} addresses - 확인할 주소 배열
 */
const checkMultipleBalances = async (addresses) => {
    console.log(`\n📋 ${addresses.length}개 주소의 토큰 잔액 일괄 확인`);
    
    const results = [];
    
    for (let i = 0; i < addresses.length; i++) {
        try {
            console.log(`\n--- ${i + 1}/${addresses.length} ---`);
            const result = await checkTokenBalance(addresses[i]);
            results.push(result);
        } catch (error) {
            console.error(`주소 ${addresses[i]} 확인 실패:`, error.message);
            results.push({ error: error.message, address: addresses[i] });
        }
    }

    // 요약 정보 출력
    console.log(`\n📈 요약 정보:`);
    const hasBalanceCount = results.filter(r => r.hasBalance).length;
    console.log(`토큰 보유 주소: ${hasBalanceCount}/${results.length}`);
    
    return results;
};

/**
 * 특정 주소의 ETH 잔액도 함께 확인
 * @param {string} accountAddress - 확인할 계정 주소
 */
const checkTokenAndEthBalance = async (accountAddress) => {
    try {
        console.log(`\n💰 ETH & 토큰 잔액 종합 확인`);
        
        // ETH 잔액 확인
        const ethBalance = await provider.getBalance(accountAddress);
        const formattedEthBalance = ethers.formatEther(ethBalance);
        
        // 토큰 잔액 확인
        const tokenInfo = await checkTokenBalance(accountAddress);
        
        console.log(`\n💎 종합 잔액 정보:`);
        console.log(`ETH 잔액: ${formattedEthBalance} ETH`);
        console.log(`${tokenInfo.tokenSymbol} 잔액: ${tokenInfo.formattedBalance} ${tokenInfo.tokenSymbol}`);
        
        return {
            accountAddress,
            ethBalance: {
                raw: ethBalance.toString(),
                formatted: formattedEthBalance
            },
            tokenBalance: tokenInfo
        };
        
    } catch (error) {
        console.error("❌ 종합 잔액 확인 실패:", error.message);
        throw error;
    }
};

// 테스트 실행
if (require.main === module) {
    const runTests = async () => {
        try {
            // 테스트 1: 더미 기업의 토큰 잔액 확인
            await checkCompanyTokenBalance("dummy_company2@email.com", "dummy_salt", "dummy_business_number");

            // const receipt = await provider.getTransactionReceipt("0x9a66f02b93d5489d6753ed05f61d3e02c8d4e8b9ef35bcdf12249fcfc0414949");
            // console.log("트랜잭션 로그:", receipt.logs);
            
            // 테스트 2: 특정 주소의 토큰 잔액 직접 확인 (예시 주소)
            // const testAddress = "0x특정주소";
            // await checkTokenBalance(testAddress);
            
            // 테스트 3: ETH와 토큰 잔액 함께 확인
            // await checkTokenAndEthBalance(testAddress);
            
            // 테스트 4: 여러 주소 일괄 확인
            // const addresses = ["0x주소1", "0x주소2"];
            // await checkMultipleBalances(addresses);
            
        } catch (error) {
            console.error("테스트 실행 중 오류:", error.message);
        }
    };

    runTests();
}

// 함수들을 모듈로 내보내기
module.exports = {
    checkTokenBalance,
    checkCompanyTokenBalance,
    checkMultipleBalances,
    checkTokenAndEthBalance,
    getSmartAccountAddress
};
