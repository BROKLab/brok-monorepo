// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;
import "./../ERC1400.sol";
import "hardhat/console.sol";
import "./CapTableRegistry.sol";

contract CapTable is ERC1400 {
    event CaptableChangedFagsystem(string indexed orgnr, address indexed oldFagsystem, address indexed newFagsystem);
    event NewCapTable(string indexed orgnr, address indexed fagsystem);
    CapTableRegistry internal _capTableRegistry;

    constructor(
        string memory name,
        string memory orgnr,
        uint256 granularity,
        address[] memory controllers,
        bytes32[] memory defaultPartitions,
        address capTableRegistry
    ) ERC1400(name, orgnr, granularity, controllers, defaultPartitions) {
        emit NewCapTable(orgnr, msg.sender);
        _capTableRegistry = CapTableRegistry(capTableRegistry);
    }


    function setCapTableRegistry(address capTableRegistryAddress) external onlyOwner {
     _capTableRegistry = CapTableRegistry(capTableRegistryAddress);
    }

    /* @dev Overwrites the current fagsystem with a new one
    */
    function updateFagsystem() external {
        address oldFagsystem = _controllers[0];
        address[] memory newFagsystemAsArray = new address[](1);
        address newFagsystem = getFagsystem();
        newFagsystemAsArray[0] = newFagsystem;
        _setControllers(newFagsystemAsArray);
        emit CaptableChangedFagsystem(getOrgnr(), oldFagsystem, newFagsystem);
    }

    /* @dev Get the current fagsystem for the cap table
    */
    function getFagsystem() public view returns (address) {
        return  _capTableRegistry.getFagsystemForCapTable(address(this));
    }

    function getFagsystemDid() public view returns (string memory) {
        address fagsystem = getFagsystem();
        return  _capTableRegistry.getDidForFagsystem(fagsystem);
    }

    function getOrgnr() public view returns (string memory) {
        return _symbol;
    }
}
