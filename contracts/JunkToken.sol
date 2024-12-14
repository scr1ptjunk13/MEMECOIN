// contracts/OceanToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// ERC20Capped itself inherits ERC20, so just inherit from it only
contract JunkToken is ERC20Capped, ERC20Burnable {
    address payable public owner;
    uint256 public blockReward;
    constructor(uint256 cap, uint256 reward) ERC20("JunkToken", "JNK") ERC20Capped(cap * (10 ** decimals())) {
        owner = payable(msg.sender);
        _mint(owner, 7000000 * (10 ** decimals()));
        blockReward = reward * (10 ** decimals());
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase , blockReward); //to - account of the node that is inlcuding the block in the blockchain
    }

    // function _beforeTokenTransfer(address from , address to , uint256 value) internal virtual override {
    //     if(from != address(0) && to != block.coinbase && block.coinbase != address(0)) 
    //     {
    //         _mintMinerReward();
    //     }
    //     super._beforeTokenTransfer(from , to , value);
    // }

    // In OpenZeppelin v4.9+, _update is used for managing token transfers
    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
        // Mint miner reward before every token transfer
        if (from != address(0) && to != block.coinbase && block.coinbase != address(0)) {
            _mintMinerReward(); // Call to reward the miner
        }
        super._update(from, to, value); // Call parent implementation
    }

    //function to set blockReward - if we want to change it later
    function setBlockReward(uint256 reward) public onlyOwner{

        blockReward = reward * (10 ** decimals());
    }
    
    // Updated destroy function
function destroy() public onlyOwner {
    // Transfer remaining balance to owner
    if (address(this).balance > 0) {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to transfer remaining balance to owner");
    }
    // Disable the contract by nullifying the owner
    owner = payable(address(0));
    emit ContractDestroyed(msg.sender);
}

    modifier onlyOwner {
        require(msg.sender == owner , "Only the owner can call this function");
        _;//place holder for the rest of the funciton
    }

    // // Explicitly override _update to resolve the ambiguity
    // function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
    //     super._update(from, to, value);
    // }


    // Event for contract destruction
    event ContractDestroyed(address indexed owner);

}
