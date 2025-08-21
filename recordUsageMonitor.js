const { ethers } = require("ethers");
require("dotenv").config();

// Sepolia 네트워크 설정
const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 컨트랙트 설정
const recordUsageAbi = require("./artifacts/contracts/RecordUsage.sol/RecordUsage.json").abi;
const recordUsageAddress = process.env.RecordUsage;
const recordUsage = new ethers.Contract(recordUsageAddress, recordUsageAbi, provider);

class RecordUsageMonitor {
    constructor() {
        this.isMonitoring = false;
        this.eventListeners = {};
    }

    // 이벤트 구독 시작
    async startMonitoring() {
        if (this.isMonitoring) {
            console.log("⚠️  이미 모니터링 중입니다.");
            return;
        }

        console.log("🎧 RecordUsage 컨트랙트 이벤트 모니터링 시작...");
        console.log("📍 컨트랙트 주소:", recordUsageAddress);
        console.log("📅 시작 시간:", new Date().toLocaleString());
        console.log("=" .repeat(50));

        this.isMonitoring = true;

        // PlayRecorded 이벤트 구독
        this.eventListeners.playRecorded = recordUsage.on("PlayRecorded", 
            (using_company, track_id, client_ts, block_ts, reward_amount, event) => {
                this.handlePlayRecordedEvent(using_company, track_id, client_ts, block_ts, reward_amount, event);
            }
        );

        // CompanyApproved 이벤트 구독
        this.eventListeners.companyApproved = recordUsage.on("CompanyApproved", 
            (company, approved, event) => {
                this.handleCompanyApprovedEvent(company, approved, event);
            }
        );

        // RewardMinted 이벤트 구독
        this.eventListeners.rewardMinted = recordUsage.on("RewardMinted", 
            (company, amount, event) => {
                this.handleRewardMintedEvent(company, amount, event);
            }
        );

        console.log("✅ 모든 이벤트 구독 완료!");
        console.log("   - PlayRecorded 이벤트");
        console.log("   - CompanyApproved 이벤트");
        console.log("   - RewardMinted 이벤트");
        console.log("\n⏳ 이벤트 대기 중... (Ctrl+C로 종료)\n");
    }

    // 이벤트 구독 중지
    stopMonitoring() {
        if (!this.isMonitoring) {
            console.log("⚠️  모니터링이 실행되고 있지 않습니다.");
            return;
        }

        console.log("\n🛑 이벤트 모니터링 중지...");
        
        // 모든 이벤트 리스너 제거
        Object.values(this.eventListeners).forEach(listener => {
            if (listener && typeof listener.removeAllListeners === 'function') {
                listener.removeAllListeners();
            }
        });

        recordUsage.removeAllListeners();
        this.isMonitoring = false;
        this.eventListeners = {};
        
        console.log("✅ 모니터링 중지 완료");
    }

    // PlayRecorded 이벤트 처리
    async handlePlayRecordedEvent(using_company, track_id, client_ts, block_ts, reward_amount, event) {
        console.log("\n🎵 PlayRecorded 이벤트 발생!");
        console.log("📊 이벤트 정보:");
        console.log(`   - 블록 번호: ${event.blockNumber}`);
        console.log(`   - 트랜잭션 해시: ${event.transactionHash}`);
        console.log(`   - 사용 기업: ${using_company}`);
        console.log(`   - 트랙 ID: ${track_id.toString()}`);
        console.log(`   - 클라이언트 타임스탬프: ${client_ts.toString()}`);
        console.log(`   - 블록 타임스탬프: ${block_ts.toString()}`);
        console.log(`   - 리워드 수량: ${ethers.formatEther(reward_amount)} RWT`);
        
        // 이벤트 발생 후 상태 조회
        await this.queryContractState(using_company, track_id);
    }

    // CompanyApproved 이벤트 처리
    handleCompanyApprovedEvent(company, approved, event) {
        console.log("\n🏢 CompanyApproved 이벤트 발생!");
        console.log("📊 이벤트 정보:");
        console.log(`   - 블록 번호: ${event.blockNumber}`);
        console.log(`   - 트랜잭션 해시: ${event.transactionHash}`);
        console.log(`   - 기업 주소: ${company}`);
        console.log(`   - 승인 상태: ${approved ? '승인됨' : '승인 취소됨'}`);
    }

    // RewardMinted 이벤트 처리
    handleRewardMintedEvent(company, amount, event) {
        console.log("\n💰 RewardMinted 이벤트 발생!");
        console.log("📊 이벤트 정보:");
        console.log(`   - 블록 번호: ${event.blockNumber}`);
        console.log(`   - 트랜잭션 해시: ${event.transactionHash}`);
        console.log(`   - 수신 기업: ${company}`);
        console.log(`   - 민팅 수량: ${ethers.formatEther(amount)} RWT`);
    }

    // 컨트랙트 상태 조회
    async queryContractState(company = null, trackId = null) {
        try {
            console.log("\n📋 컨트랙트 상태 조회:");
            
            if (trackId) {
                const playCount = await recordUsage.getTrackPlayCount(trackId);
                console.log(`   - 트랙 ${trackId} 재생 횟수: ${playCount.toString()}회`);
            }
            
            if (company) {
                const totalRewards = await recordUsage.getCompanyTotalRewards(company);
                console.log(`   - 기업 ${company} 총 리워드: ${ethers.formatEther(totalRewards)} RWT`);
                
                const isApproved = await recordUsage.approvedCompanies(company);
                console.log(`   - 기업 승인 상태: ${isApproved ? '승인됨' : '미승인'}`);
            }
            
        } catch (error) {
            console.error("❌ 상태 조회 중 오류:", error.message);
        }
    }

    // 특정 트랙의 재생 횟수 조회
    async getTrackPlayCount(trackId) {
        try {
            const playCount = await recordUsage.getTrackPlayCount(trackId);
            console.log(`\n📈 트랙 ${trackId} 재생 횟수: ${playCount.toString()}회`);
            return playCount;
        } catch (error) {
            console.error("❌ 트랙 재생 횟수 조회 실패:", error.message);
            return null;
        }
    }

    // 특정 기업의 총 리워드 조회
    async getCompanyTotalRewards(company) {
        try {
            const totalRewards = await recordUsage.getCompanyTotalRewards(company);
            console.log(`\n💎 기업 ${company} 총 리워드: ${ethers.formatEther(totalRewards)} RWT`);
            return totalRewards;
        } catch (error) {
            console.error("❌ 기업 총 리워드 조회 실패:", error.message);
            return null;
        }
    }

    // 기업 승인 상태 조회
    async checkCompanyApproval(company) {
        try {
            const isApproved = await recordUsage.approvedCompanies(company);
            console.log(`\n✅ 기업 ${company} 승인 상태: ${isApproved ? '승인됨' : '미승인'}`);
            return isApproved;
        } catch (error) {
            console.error("❌ 기업 승인 상태 조회 실패:", error.message);
            return null;
        }
    }

    // 과거 이벤트 조회 (선택적)
    async queryPastEvents(fromBlock = 'earliest', toBlock = 'latest') {
        try {
            console.log(`\n📜 과거 이벤트 조회 중... (${fromBlock} ~ ${toBlock})`);
            
            // PlayRecorded 이벤트 조회
            const playRecordedFilter = recordUsage.filters.PlayRecorded();
            const playRecordedEvents = await recordUsage.queryFilter(playRecordedFilter, fromBlock, toBlock);
            
            console.log(`\n🎵 PlayRecorded 이벤트 ${playRecordedEvents.length}개 발견:`);
            playRecordedEvents.forEach((event, index) => {
                console.log(`   ${index + 1}. 블록 ${event.blockNumber} - 기업: ${event.args.using_company}, 트랙: ${event.args.track_id}`);
            });

            // CompanyApproved 이벤트 조회
            const companyApprovedFilter = recordUsage.filters.CompanyApproved();
            const companyApprovedEvents = await recordUsage.queryFilter(companyApprovedFilter, fromBlock, toBlock);
            
            console.log(`\n🏢 CompanyApproved 이벤트 ${companyApprovedEvents.length}개 발견:`);
            companyApprovedEvents.forEach((event, index) => {
                console.log(`   ${index + 1}. 블록 ${event.blockNumber} - 기업: ${event.args.company}, 승인: ${event.args.approved}`);
            });

            // RewardMinted 이벤트 조회
            const rewardMintedFilter = recordUsage.filters.RewardMinted();
            const rewardMintedEvents = await recordUsage.queryFilter(rewardMintedFilter, fromBlock, toBlock);
            
            console.log(`\n💰 RewardMinted 이벤트 ${rewardMintedEvents.length}개 발견:`);
            rewardMintedEvents.forEach((event, index) => {
                console.log(`   ${index + 1}. 블록 ${event.blockNumber} - 기업: ${event.args.company}, 수량: ${ethers.formatEther(event.args.amount)} RWT`);
            });

        } catch (error) {
            console.error("❌ 과거 이벤트 조회 실패:", error.message);
        }
    }

    // 메뉴 표시
    showMenu() {
        console.log("\n" + "=".repeat(50));
        console.log("📋 RecordUsage 모니터링 메뉴");
        console.log("=".repeat(50));
        console.log("1. 실시간 이벤트 모니터링 시작");
        console.log("2. 모니터링 중지");
        console.log("3. 트랙 재생 횟수 조회");
        console.log("4. 기업 총 리워드 조회");
        console.log("5. 기업 승인 상태 조회");
        console.log("6. 과거 이벤트 조회");
        console.log("7. 컨트랙트 상태 전체 조회");
        console.log("0. 종료");
        console.log("=".repeat(50));
    }
}

// 인터랙티브 모드
async function interactiveMode() {
    const monitor = new RecordUsageMonitor();
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    let running = true;

    while (running) {
        monitor.showMenu();
        const choice = await question("\n선택하세요 (0-7): ");

        switch (choice.trim()) {
            case '1':
                await monitor.startMonitoring();
                break;
                
            case '2':
                monitor.stopMonitoring();
                break;
                
            case '3':
                const trackId = await question("트랙 ID 입력: ");
                if (trackId.trim()) {
                    await monitor.getTrackPlayCount(trackId.trim());
                }
                break;
                
            case '4':
                const company = await question("기업 주소 입력: ");
                if (company.trim()) {
                    await monitor.getCompanyTotalRewards(company.trim());
                }
                break;
                
            case '5':
                const companyAddr = await question("기업 주소 입력: ");
                if (companyAddr.trim()) {
                    await monitor.checkCompanyApproval(companyAddr.trim());
                }
                break;
                
            case '6':
                console.log("과거 이벤트 조회 범위 설정:");
                const fromBlock = await question("시작 블록 (엔터키: 처음부터): ");
                const toBlock = await question("끝 블록 (엔터키: 최신까지): ");
                await monitor.queryPastEvents(
                    fromBlock.trim() || 'earliest',
                    toBlock.trim() || 'latest'
                );
                break;
                
            case '7':
                console.log("전체 상태 조회를 위한 정보 입력:");
                const testCompany = await question("조회할 기업 주소 (선택사항): ");
                const testTrack = await question("조회할 트랙 ID (선택사항): ");
                await monitor.queryContractState(
                    testCompany.trim() || null,
                    testTrack.trim() || null
                );
                break;
                
            case '0':
                console.log("\n👋 프로그램을 종료합니다.");
                monitor.stopMonitoring();
                running = false;
                break;
                
            default:
                console.log("❌ 잘못된 선택입니다. 다시 선택해주세요.");
        }

        if (running && choice !== '1') {
            await question("\n⏎ 계속하려면 엔터키를 누르세요...");
        }
    }

    rl.close();
}

// 자동 모니터링 모드 (프로그램 인자로 제어)
async function autoMode() {
    const monitor = new RecordUsageMonitor();
    
    // 과거 이벤트 먼저 조회
    await monitor.queryPastEvents();
    
    // 실시간 모니터링 시작
    await monitor.startMonitoring();
    
    // 프로세스 종료 시 정리
    process.on('SIGINT', () => {
        monitor.stopMonitoring();
        process.exit(0);
    });
}

// 실행 모드 결정
if (process.argv.includes('--auto')) {
    console.log("🚀 자동 모니터링 모드로 실행");
    autoMode();
} else {
    console.log("🎛️  인터랙티브 모드로 실행");
    interactiveMode();
}

module.exports = RecordUsageMonitor;
