// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RewardToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(address admin) ERC20("MPS Mileage", "MPSM") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    function burnFrom(
        address from,
        uint256 amount
    ) external onlyRole(BURNER_ROLE) {
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
