// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EntryPoint {
    event UserOperationHandled(address indexed sender, bool isActive);

    struct UserOperation {
        address sender; // 스마트계정 주소
        uint nonce;
        bytes initCode;
        bytes callData;
        uint callGasLimit;
        uint verificationGasLimit;
        uint preVerificationGas;
        uint maxFeePerGas;
        uint maxPriorityFeePerGas;
        bytes paymasterAndData;
        bytes signature;
    }

    mapping(address => uint) public nonces;

    function handleOps(UserOperation[] calldata ops) external {
        // ops를 담아 전달해주는 부분 주시:
        for (uint i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];
            require(op.nonce == nonces[op.sender], "nonce error");

            if (op.paymasterAndData.length >= 20) {
                // 페이마스터가 없어서, 사용자 본인이 직접 가스비를 지불하는 요청도 받을 수 있음
                address paymaster = address(bytes20(op.paymasterAndData));
                uint maxCost = op.callGasLimit * op.maxFeePerGas;
                (bool paymasterSuccess, ) = paymaster.call(
                    abi.encodeWithSignature(
                        "validatePaymasterUserOp(address,uint)",
                        op.sender,
                        maxCost
                    )
                );
                require(paymasterSuccess);
            }

            bytes32 _hash = _getUserOpHash(op);
            bytes32 ethSign = _toSignMessageHash(_hash);
            (bool signSuccess, ) = op.sender.call(
                abi.encodeWithSignature(
                    "isValidSign(bytes32,bytes)",
                    ethSign,
                    op.signature
                )
            );
            require(signSuccess, "isValidSign error");

            (bool isActive, ) = op.sender.call{gas: op.callGasLimit}( // 여기가 스마트계정의 execute()
                op.callData
            );

            emit UserOperationHandled(op.sender, isActive);

            nonces[op.sender]++;
        }
    }

    function _getUserOpHash(
        UserOperation calldata op
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    op.sender,
                    op.nonce,
                    keccak256(op.initCode),
                    keccak256(op.callData),
                    op.callGasLimit,
                    op.verificationGasLimit,
                    op.preVerificationGas,
                    op.maxFeePerGas,
                    op.maxPriorityFeePerGas,
                    keccak256(op.paymasterAndData),
                    keccak256(op.signature)
                )
            );
    }

    function _toSignMessageHash(bytes32 _hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            );
    }
}
