// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import "./../ERC1400.sol";
import "hardhat/console.sol";

contract CapTable is ERC1400 {
    event CaptableChangedFagsystem(string indexed orgnr, address indexed oldFagsystem, address indexed newFagsystem);
    event NewCapTable(string indexed orgnr, address indexed fagsystem);

    constructor(
        string memory name,
        string memory orgnr,
        uint256 granularity,
        address[] memory controllers,
        bytes32[] memory defaultPartitions
    ) ERC1400(name, orgnr, granularity, controllers, defaultPartitions) {
        emit NewCapTable(orgnr, msg.sender);
    }

    /* @dev Overwrites the current fagsystem with a new one
    */
    function setFagsystem(address newFagsystem) external {
        require(_isController[msg.sender]);
        address[] memory newFagsystemAsArray = new address[](1);  
        newFagsystemAsArray[0] = newFagsystem;
        _setControllers(newFagsystemAsArray);

        emit CaptableChangedFagsystem(getOrgnr(), msg.sender, newFagsystem);
    }

    /* @dev Get the current fagsystem for the cap table
    */
    function getFagsystem() public view returns (address) {
        return _controllers[0];
    }

    function getOrgnr() public view returns (string memory) {
        return _symbol;
    }
}
