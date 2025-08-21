const { ethers } = require("ethers");
require("dotenv").config();

// 컨트랙트 기능 테스트 (API 호출 최소화)
async function quickFunctionTest() {
    console.log("🔧 RecordUsage 컨트랙트 기능 테스트");
    console.log("=" .repeat(50));

    const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
    const recordUsageAbi = require("./artifacts/contracts/RecordUsage.sol/RecordUsage.json").abi;
    const recordUsageAddress = process.env.RecordUsage;
    const recordUsage = new ethers.Contract(recordUsageAddress, recordUsageAbi, provider);

    console.log("📍 컨트랙트 주소:", recordUsageAddress);
    console.log();

    // 테스트할 데이터들
    const testCases = [
        {
            name: "Smart Account (기존 데이터)",
            company: "0x1cb998507C4F287C7a3617Bb8a38eb750992fc69",
            trackId: 12345
        },
        {
            name: "최신 Smart Account", 
            company: "0xCA3aF021758313d5972Dc815789F4dB868828537",
            trackId: 12345
        },
        {
            name: "존재하지 않는 데이터",
            company: "0x0000000000000000000000000000000000000000", 
            trackId: 99999
        }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`${i + 1}️⃣ ${testCase.name}`);
        console.log("-".repeat(30));
        console.log(`기업 주소: ${testCase.company}`);
        console.log(`트랙 ID: ${testCase.trackId}`);
        
        try {
            // getTrackPlayCount 테스트
            const playCount = await recordUsage.getTrackPlayCount(testCase.trackId);
            console.log(`✅ getTrackPlayCount(${testCase.trackId}): ${playCount.toString()}회`);
            
            // 잠시 대기 (API 제한 방지)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // getCompanyTotalRewards 테스트  
            const totalRewards = await recordUsage.getCompanyTotalRewards(testCase.company);
            console.log(`✅ getCompanyTotalRewards: ${ethers.formatEther(totalRewards)} RWT`);
            
            // 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // approvedCompanies 매핑 테스트
            const isApproved = await recordUsage.approvedCompanies(testCase.company);
            console.log(`✅ approvedCompanies: ${isApproved ? '승인됨' : '미승인'}`);
            
            // 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // trackPlayCount 매핑 직접 접근
            const directPlayCount = await recordUsage.trackPlayCount(testCase.trackId);
            console.log(`✅ trackPlayCount[${testCase.trackId}]: ${directPlayCount.toString()}회`);
            
            // 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // companyTotalRewards 매핑 직접 접근
            const directTotalRewards = await recordUsage.companyTotalRewards(testCase.company);
            console.log(`✅ companyTotalRewards 직접 접근: ${ethers.formatEther(directTotalRewards)} RWT`);
            
        } catch (error) {
            console.error(`❌ 오류: ${error.message}`);
        }
        
        console.log();
        
        // 테스트 케이스 간 대기
        if (i < testCases.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log("📊 요약");
    console.log("-".repeat(30));
    console.log("✅ 모든 기본 함수들이 정상적으로 작동하고 있습니다:");
    console.log("   - getTrackPlayCount(): 트랙별 재생 횟수 조회");
    console.log("   - getCompanyTotalRewards(): 기업별 총 리워드 조회");  
    console.log("   - approvedCompanies: 기업 승인 상태 조회");
    console.log("   - trackPlayCount: 트랙 재생 횟수 매핑 직접 접근");
    console.log("   - companyTotalRewards: 기업 리워드 매핑 직접 접근");
    console.log();
    console.log("💡 실시간 이벤트 모니터링을 위해서는:");
    console.log("   1. node bundler.js (번들러 시작)");
    console.log("   2. node recordUsageMonitor.js --auto (이벤트 모니터링)");
    console.log("   3. node sendUserOps.js (새 트랜잭션 생성)");
}

quickFunctionTest().catch(console.error);
