// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable {
    constructor(address admin) ERC20("MPS Mileage", "MPSM") Ownable(admin) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // 양도 불가
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        // 민팅(0→to) / 소각(from→0)만 허용
        if (from != address(0) && to != address(0)) revert("NonTransferable");
        super._update(from, to, value);
    }
}
