const {ethers, AbiCoder} = require("ethers");
const axios = require("axios");

const provider = new ethers.JsonRpcProvider(INFURA_RPC_URL);
const private_key = "dummy_private_key" // 어떤 개인키? 
const wallet = new ethers.Wallet(private_key, provider); // 가스비 대납 계정

const tokenCA = "dummy_token_CA"
const tokenAbi = [];

const entryPointCA = "dummy_entryPoint_CA"
const entryPointAbi = [];

const smartAccountAddress = "client의 smartAccountAddress" // userOps를 보내는 스마트 계정 CA
const smartAccountAbi = [];

const sendBundler = async () => { // 프론트에서 사용
    const smartAccount = new ethers.Contract(smartAccountAddress, smartAccountAbi, provider) // smartAccount 컨트랙트를 가져올 때 조회의 기능만 사용하기 때문에 공급자를 매개변수에 넣음 wallet을 넣어도 기능에는 문제가 없는건지? 
    const entryPoint = new ethers.Contract(entryPointCA, entryPointAbi, wallet) 
    const token = new ethers.Contract(tokenCA, tokenAbi, wallet)

    const amount = ethers.parseEther("1000", 18);
    const mintCallData = token.interface.encodeFunctionData("mint", [smartAccountAddress, amount])
    const recieveAccount = "EOA_address"
    const value = ethers.parseEther("0")
    const callData = smartAccount.interface.encodeFunctionData("execute", value, mintCallData)
    const nonce = await entryPoint.nonces(smartAccount)

    const userOp = { // 이 userOp는 smartAccountaddress로 1000만큼 민팅하는 것. 어떤 작업을 수행할 것인지에 따라 callData에 execute함수에 다른 callData를 전달한다.
        sender: smartAccountAddress,
        nonce, 
        initCode: "0x",
        callData,
        callGasLimit: 100000n,
        verificationGasLimit: 100000n,
        preVerificationGas: 21000n,//
        maxFeePerGas: ethers.parseUnits("5", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),//
        paymasterAndData: "paymaster_CA", //
        signature: "0x"
    }

    const userOpValues = [
        userOp.sender,
        userOp.nonce,
        userOp.initCode,
        userOp.callData,
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        userOp.paymasterAndData,
        userOp.signature
    ]

    const userOpTypes = [
        "address",
        "uint",
        "bytes",
        "bytes",
        "uint",
        "uint",
        "uint",
        "uint",
        "uint",
        "bytes",
        "bytes"
    ]

    const encoded = AbiCoder.defaultAbiCoder().encode(userOpTypes, userOpValues);
    const hash = ethers.keccak256(encoded);
    const sign = await wallet.signMessage(ethers.getBytes(hash));
    userOp.signature = sign;

    const userOpTuple = [];
    for (const key in userOp) {
        userOpTuple.push(userOp[key]);
    }
    console.log(userOpTuple);

    // const transaction = await entryPoint.handleOps([userOpTuple]) //
    // const result = await transaction.wait();
    // console.log(`트랜잭션 해시: ${result.hash}`)

    const userOpToJson = (userOp) => {
        const result = {};
        for (const key in userOp) {
            const value = userOp[key];
            result[key] = typeof value === "bigint" ? value.toString() : value;
        }
        return result;
    }

    const res = await axios.post("http://localhost:4000/userOp", userOpToJson(userOp))
    console.log(`userOps bundler에 전달 완료: ${res.data.message}`)
}

sendBundler()