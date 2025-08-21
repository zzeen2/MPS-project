const { ethers } = require("ethers");
require("dotenv").config();

// RecordUsage 모니터링 테스트
async function testRecordUsageMonitoring() {
    console.log("🧪 RecordUsage 컨트랙트 테스트 시작");
    console.log("=" .repeat(50));

    // 컨트랙트 설정
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
    const recordUsageAbi = require("./artifacts/contracts/RecordUsage.sol/RecordUsage.json").abi;
    const recordUsageAddress = process.env.RecordUsage;
    const recordUsage = new ethers.Contract(recordUsageAddress, recordUsageAbi, provider);

    // 테스트 데이터
    const testCompany = "0x1cb998507C4F287C7a3617Bb8a38eb750992fc69"; // Smart Account 주소
    const testTrackId = 12345;

    console.log("📍 컨트랙트 주소:", recordUsageAddress);
    console.log("🏢 테스트 기업:", testCompany);
    console.log("🎵 테스트 트랙 ID:", testTrackId);
    console.log();

    try {
        // 1. 기본 정보 조회
        console.log("1️⃣ 기본 정보 조회");
        console.log("-".repeat(30));
        
        const isApproved = await recordUsage.approvedCompanies(testCompany);
        console.log(`기업 승인 상태: ${isApproved ? '✅ 승인됨' : '❌ 미승인'}`);
        
        const playCount = await recordUsage.getTrackPlayCount(testTrackId);
        console.log(`트랙 ${testTrackId} 재생 횟수: ${playCount.toString()}회`);
        
        const totalRewards = await recordUsage.getCompanyTotalRewards(testCompany);
        console.log(`기업 총 리워드: ${ethers.formatEther(totalRewards)} RWT`);
        console.log();

        // 2. 매핑 변수 직접 조회
        console.log("2️⃣ 매핑 변수 직접 조회");
        console.log("-".repeat(30));
        
        const trackPlayCount = await recordUsage.trackPlayCount(testTrackId);
        console.log(`trackPlayCount[${testTrackId}]: ${trackPlayCount.toString()}`);
        
        const companyTotalRewards = await recordUsage.companyTotalRewards(testCompany);
        console.log(`companyTotalRewards[${testCompany}]: ${ethers.formatEther(companyTotalRewards)} RWT`);
        
        const approvedCompanies = await recordUsage.approvedCompanies(testCompany);
        console.log(`approvedCompanies[${testCompany}]: ${approvedCompanies}`);
        console.log();

        // 3. 과거 이벤트 조회
        console.log("3️⃣ 과거 이벤트 조회");
        console.log("-".repeat(30));
        
        // 최근 100블록 이벤트 조회
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(currentBlock - 100, 0);
        
        console.log(`블록 범위: ${fromBlock} ~ ${currentBlock}`);
        
        // PlayRecorded 이벤트
        const playRecordedFilter = recordUsage.filters.PlayRecorded();
        const playRecordedEvents = await recordUsage.queryFilter(playRecordedFilter, fromBlock);
        console.log(`PlayRecorded 이벤트: ${playRecordedEvents.length}개`);
        
        playRecordedEvents.forEach((event, index) => {
            console.log(`  ${index + 1}. 블록 ${event.blockNumber}`);
            console.log(`     기업: ${event.args.using_company}`);
            console.log(`     트랙: ${event.args.track_id.toString()}`);
            console.log(`     리워드: ${ethers.formatEther(event.args.reward_amount)} RWT`);
            console.log(`     TX: ${event.transactionHash}`);
        });

        // CompanyApproved 이벤트
        const companyApprovedFilter = recordUsage.filters.CompanyApproved();
        const companyApprovedEvents = await recordUsage.queryFilter(companyApprovedFilter, fromBlock);
        console.log(`CompanyApproved 이벤트: ${companyApprovedEvents.length}개`);
        
        companyApprovedEvents.forEach((event, index) => {
            console.log(`  ${index + 1}. 블록 ${event.blockNumber} - ${event.args.company} (${event.args.approved ? '승인' : '거부'})`);
        });

        // RewardMinted 이벤트
        const rewardMintedFilter = recordUsage.filters.RewardMinted();
        const rewardMintedEvents = await recordUsage.queryFilter(rewardMintedFilter, fromBlock);
        console.log(`RewardMinted 이벤트: ${rewardMintedEvents.length}개`);
        
        rewardMintedEvents.forEach((event, index) => {
            console.log(`  ${index + 1}. 블록 ${event.blockNumber} - ${event.args.company} (${ethers.formatEther(event.args.amount)} RWT)`);
        });

        console.log();

        // 4. 실시간 이벤트 구독 테스트 (5초간)
        console.log("4️⃣ 실시간 이벤트 구독 테스트 (5초간)");
        console.log("-".repeat(30));
        console.log("이벤트 대기 중... (sendUserOps.js를 실행해보세요)");
        
        let eventCount = 0;
        
        const playRecordedListener = recordUsage.on("PlayRecorded", 
            (using_company, track_id, client_ts, block_ts, reward_amount, event) => {
                eventCount++;
                console.log(`🎵 PlayRecorded 이벤트 #${eventCount}`);
                console.log(`   기업: ${using_company}`);
                console.log(`   트랙: ${track_id.toString()}`);
                console.log(`   리워드: ${ethers.formatEther(reward_amount)} RWT`);
                console.log(`   TX: ${event.transactionHash}`);
            }
        );

        const rewardMintedListener = recordUsage.on("RewardMinted", 
            (company, amount, event) => {
                eventCount++;
                console.log(`💰 RewardMinted 이벤트 #${eventCount}`);
                console.log(`   기업: ${company}`);
                console.log(`   수량: ${ethers.formatEther(amount)} RWT`);
                console.log(`   TX: ${event.transactionHash}`);
            }
        );

        // 5초 대기
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 이벤트 리스너 제거
        recordUsage.removeAllListeners();
        
        if (eventCount === 0) {
            console.log("📝 5초 동안 이벤트가 발생하지 않았습니다.");
        } else {
            console.log(`✅ 총 ${eventCount}개의 이벤트가 감지되었습니다.`);
        }

        console.log();
        console.log("🎉 테스트 완료!");
        
    } catch (error) {
        console.error("❌ 테스트 중 오류 발생:", error.message);
        console.error(error);
    }
}

// 특정 함수들을 개별적으로 테스트하는 함수
async function testSpecificFunctions() {
    console.log("\n🔍 개별 함수 테스트");
    console.log("=" .repeat(50));

    const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
    const recordUsageAbi = require("./artifacts/contracts/RecordUsage.sol/RecordUsage.json").abi;
    const recordUsageAddress = process.env.RecordUsage;
    const recordUsage = new ethers.Contract(recordUsageAddress, recordUsageAbi, provider);

    // 여러 트랙과 기업에 대해 테스트
    const testData = [
        { trackId: 12345, company: "0x1cb998507C4F287C7a3617Bb8a38eb750992fc69" },
        { trackId: 67890, company: "0x1cb998507C4F287C7a3617Bb8a38eb750992fc69" },
        { trackId: 11111, company: "0x0000000000000000000000000000000000000000" }
    ];

    for (const data of testData) {
        console.log(`\n📊 트랙 ${data.trackId} / 기업 ${data.company}`);
        console.log("-".repeat(30));
        
        try {
            // getTrackPlayCount 테스트
            const playCount = await recordUsage.getTrackPlayCount(data.trackId);
            console.log(`getTrackPlayCount(${data.trackId}): ${playCount.toString()}회`);
            
            // getCompanyTotalRewards 테스트
            const totalRewards = await recordUsage.getCompanyTotalRewards(data.company);
            console.log(`getCompanyTotalRewards(${data.company}): ${ethers.formatEther(totalRewards)} RWT`);
            
            // approvedCompanies 매핑 테스트
            const isApproved = await recordUsage.approvedCompanies(data.company);
            console.log(`approvedCompanies(${data.company}): ${isApproved}`);
            
        } catch (error) {
            console.error(`❌ 오류: ${error.message}`);
        }
    }
}

// 실행
async function main() {
    await testRecordUsageMonitoring();
    await testSpecificFunctions();
    
    console.log("\n" + "=".repeat(50));
    console.log("💡 실시간 모니터링을 시작하려면:");
    console.log("   node recordUsageMonitor.js");
    console.log("💡 자동 모니터링 모드:");
    console.log("   node recordUsageMonitor.js --auto");
    console.log("=".repeat(50));
}

main().catch(console.error);
