const express = require("express");
const {ethers} = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const entryPointAbi = require("./artifacts/contracts/AA/EntryPoint.sol/EntryPoint.json").abi;
const entryPoint = new ethers.Contract(process.env.EntryPoint, entryPointAbi, wallet);

const mempool = [];

app.post("/userop", async (req, res) => {
    try {
        const userOp = req.body;
        mempool.push(userOp);
        res.json({state: 200, message: "트랜잭션 풀 추가 성공"})
    } catch (error) {
        res.json({state: 400, message: "트랜잭션 풀 추가 실패"})
    }
})

app.get("mempool", (req, res) => {
    try {
        res.json({mempool})
    } catch (error) {
        res.json({error})
    }
})

const setTimeInterval = (callback, intervalTime) => {
    const loop = async () => {
        const now = Date.now();
        const delay = intervalTime - (now % intervalTime);
        setTimeout(async () => {
            callback();
            loop();
        }, delay)
    }
    loop();
}

const toTuple = (userOp) => {
    return [
        userOp.sender,
        BigInt(userOp.nonce),
        userOp.initCode,
        userOp.callData,
        BigInt(userOp.callGasLimit),
        BigInt(userOp.verificationGasLimit),
        BigInt(userOp.preverificationGas),
        BigInt(userOp.maxFeePerGas),
        BigInt(userOp.maxPriorityFeePerGaS),
        userOp.paymasterAndData,
        userOp.signature,
    ]
}

setTimeInterval(async () => {
    try {
        const ops = mempool.splice(0);
        if(ops.length === 0) return;
        const transaction = await entryPoint.handleOps(ops.map(toTuple));
        console.log(`트랜잭션 해시: ${transaction.hash}`)
    } catch (error) {
        console.log(error);
    }
}, 10000)

app.listen(4000, () => {
    console.log("서버가 켜졌습니다.")
})






// api 호출 됐을 때
if (music.isRewardMusic === true && music.rewardCount > 0) { // 음원이 리워드를 제공하고 있으며, 아직 카운트 횟수가 남아있는 경우
    musicHasBeenUsed(music.id, usingCompany);
    music.rewardCount -= 1;
} else {
    musicHasBeenUsed(music.id, usingCompany);
}


const musicHasBeenUsed = (_musicId, _usingCompany) => {
    const music = Music.findById(_musicId);
    if (!music) {
        throw new Error("음원을 찾을 수 없습니다.");
    }
    const musicUseInfo = {musicId: _musicId, usingCompanyId: _usingCompany, usedAt: new Date(), reward: music.rewardAmount};

    // musicUseInfo를 DB에 저장하는 로직 추가. postgresQL과 drizzle을 사용할 예정
    
    music.usingCompany.push(_usingCompany);
    music.save();
}