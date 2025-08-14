const {ethers, keccak256, toUtf8Bytes, solidityPacked} = require("ethers") //
require("dotenv").config();
const CA = "0xb328FD0a686805fa480E34aF4D1006A7F3d37467";
const abi = require("./artifacts/contracts/AA/SmartAccountFactory.sol/SmartAccountFactory.json").abi;

const createPrivateKey = (email, salt, business_number) => {
    const company_id = `${email}_${business_number}`;
    const value = solidityPacked(["string", "string"], [salt, company_id]).slice(0, 64);
    const pk = keccak256(value).replace("0x", "").slice(0, 64);
    return `0x${pk}`;
}

const email = "dummy_company@email.com";
const private_key = createPrivateKey(email, "dummy_salt", "dummy_business_number");
const provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC);
const wallet = new ethers.Wallet(private_key, provider); // 초기 기업 EOA 생성
console.log(`EOA 주소: ${wallet.address}`);
console.log(`EOA 개인키: ${private_key}`);

(async () => {
    const balance = await provider.getBalance(wallet);
    console.log(`가입된 EOA 계정 잔액 0: ${ethers.formatEther(balance)}`);
})();

// 대납용 지갑 생성 (실제로는 충분한 ETH를 가진 계정이어야 함)
const paymasterPrivateKey = process.env.PRIVATE_KEY;
const paymasterWallet = new ethers.Wallet(paymasterPrivateKey, provider);
const smartaccount_factory = new ethers.Contract(CA, abi, paymasterWallet); // Wallet 객체를 사용

const createSmartAccount = async () => {
    const owner = wallet.address
    const transaction = await smartaccount_factory.createAccount(owner); // EOA 기반 스마트 계정 생성
    const result = await transaction.wait();
    console.log(result.hash);

    const smartaccount = await smartaccount_factory.getAccount(owner);
    console.log(`스마트 계정 주소: ${smartaccount}`);
};

createSmartAccount();