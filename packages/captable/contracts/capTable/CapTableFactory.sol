// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;

import "./CapTable.sol";
import "./CapTableRegistry.sol";

contract CapTableFactory {
    CapTableRegistry internal _capTableRegistry;
    uint256 internal _defaultGranularity;
    address internal _defaultOwner; 
    bytes32[] internal _defaultPartitions;
    bytes32 internal _defaultIssueData;

    constructor(
        address capTableRegistryAddress,
        address defaultOwner,
        bytes32 defaultPartition
    ) {
        _defaultGranularity = 1;
        _defaultOwner = defaultOwner;
        _defaultPartitions.push(defaultPartition);
        _capTableRegistry = CapTableRegistry(capTableRegistryAddress);
    }

    function getCapTableRegistryAddress()
        public
        view
        returns (address capTableRegistryAddress)
    {
        return address(_capTableRegistry);
    }

    function createCapTable(
        string calldata name,
        string calldata orgnr,
        address[] calldata to,
        uint256[] calldata value
    ) external {
        bytes32[] memory defaultPartitions = _defaultPartitions;
        bytes memory defaultIssueData = abi.encodePacked(_defaultIssueData);

        address[] memory controller = new address[](1);  
        controller[0] = msg.sender; // Fagsystem is controller.

        CapTable capTable = new CapTable(
            name,
            orgnr,
            _defaultGranularity,
            controller,
            defaultPartitions,
            address(_capTableRegistry)
        );

        _capTableRegistry.que(address(capTable), orgnr);

        for (uint256 i = 0; i < to.length;) {
            capTable.issueByPartition(
                _defaultPartitions[0], // Cant accept partitions also as it would trigger stack to deep.
                to[i],
                value[i],
                defaultIssueData
            );

            unchecked { ++i; } // Avoids safemath to save gas
        }
        capTable.addMinter(msg.sender); // Fagsystem is minter
        capTable.transferOwnership(_defaultOwner); // BR is owner
    }
}
