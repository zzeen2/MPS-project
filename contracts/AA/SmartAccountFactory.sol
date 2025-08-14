// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SmartAccount.sol";

contract SmartAccountFactory {
    address immutable entryPoint;

    mapping(address => address) private accounts;

    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
    }

    function createAccount(
        address owner // 소셜로그인 혹은 로컬 회원가입 정보로 생성된 EOA의 주소
    ) external returns (address smartAccount) {
        require(
            accounts[owner] == address(0),
            "You already created SmartAccount!"
        );

        bytes memory bytecode = abi.encodePacked(
            type(SmartAccount).creationCode,
            abi.encode(owner, entryPoint)
        );

        bytes32 salt = keccak256(abi.encodePacked(owner));

        assembly {
            smartAccount := create2(0, add(bytecode, 32), mload(bytecode), salt)
            if iszero(extcodesize(smartAccount)) {
                revert(0, 0)
            }
        }

        accounts[owner] = smartAccount;
    }

    function getAccountAddress(address owner) external view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(owner));
        bytes memory bytecode = abi.encodePacked(
            type(SmartAccount).creationCode,
            abi.encode(owner, entryPoint)
        );

        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                hex"ff",
                                address(this),
                                salt,
                                keccak256(bytecode)
                            )
                        )
                    )
                )
            );
    }

    function getAccount(address owner) external view returns (address) {
        return accounts[owner];
    }
}
