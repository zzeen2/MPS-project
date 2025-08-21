// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SmartAccount {
    address owner; // EOA 주소?
    address entryPoint;

    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint);
        _;
    }

    modifier onlyOwner(address _owner) {
        require(owner == _owner);
        _;
    }

    function execute(
        address to,
        uint value,
        bytes calldata data
    ) external onlyEntryPoint {
        (bool success, ) = to.call{value: value}(data);
        require(success);
    }

    function isValidSign(
        bytes32 _hash,
        bytes calldata sign
    ) external view returns (bool) {
        return _recoverSigner(_hash, sign) == owner;
    }

    function _recoverSigner(
        bytes32 _hash,
        bytes memory sign
    ) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = _splitSign(sign);
        return ecrecover(_hash, v, r, s);
    }

    function _splitSign(
        bytes memory sign
    ) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sign.length == 65);
        assembly {
            v := byte(0, mload(add(sign, 96)))
            r := mload(add(sign, 32))
            s := mload(add(sign, 64))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28);
    }

    receive() external payable {}
}
