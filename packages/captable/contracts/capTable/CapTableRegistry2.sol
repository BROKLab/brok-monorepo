// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './VCRegistry.sol';

contract CapTableRegistry2 is VCRegistry {
    address[] internal _capTables;
    uint256 internal _activeCapTables;
    mapping(address => string) internal _addressToId; // address => orgnr
    mapping(string => address) internal _idToAddress; // id = orgnr
    mapping(address => uint256) internal _addressToStatus; // // 0:notCreated 1:notUsed 2:approved 3:notUsed 4:removed 5:notUsed
    mapping(address => address) private _operatorOf; // address => operator
    mapping(address => string) internal _addressToDID; // address => did

    event CapTableAdded(address indexed capTableAddress, string indexed id);
    event CapTableRemoved(address indexed capTableAddress, string indexed id);

    constructor() VCRegistry() {}

    function addCapTable(address adr, string calldata id) external onlyRole(OPERATOR_ROLE) {
        require(_idToAddress[id] == address(0), 'id is allready in use');
        bool emptyIdOnAddress = bytes(_addressToId[adr]).length == 0;
        require(emptyIdOnAddress, 'address is allready in use');
        unchecked {
            _capTables.push(adr);
            _idToAddress[id] = adr;
            _addressToId[adr] = id;
            _activeCapTables++;
            _operatorOf[adr] = msg.sender;
            _addressToStatus[adr] = 2;
        }
        emit CapTableAdded(adr, id);
    }

    function removeCapTable(address adr) external onlyRole(OPERATOR_ROLE) {
        string memory id = _addressToId[adr];
        require(_idToAddress[id] != address(0), 'no address registered on id');
        bool emptyIdOnAddress = bytes(id).length == 0;
        require(!emptyIdOnAddress, 'no id registered on address');

        unchecked {
            _idToAddress[id] = address(0);
            _addressToId[adr] = string('');
            _activeCapTables--;
            _operatorOf[adr] = address(0);
            _addressToStatus[adr] = 4;
        }
        emit CapTableRemoved(adr, id);
    }

    function authenticateOperatorWithDID(address _operatorAddress, string calldata _operatorName, string calldata _did) external onlyRole(OPERATOR_ROLE) {
        operatorNameOf[_operatorAddress] = _operatorName;
        grantRole(OPERATOR_ROLE, _operatorAddress);
        _addressToDID[_operatorAddress] = _did;
    }

    function getOperatorDID(address adr) external view returns (string memory) {
        return hasRole(OPERATOR_ROLE, adr) ? _addressToDID[adr] : string('');
    }

    function getOperatorForCapTable(address adr) external view returns (address) {
        address operator = _operatorOf[adr];
        return hasRole(OPERATOR_ROLE, operator) ? operator : address(0);
    }

    function getActiveCapTablesCount() external view returns (uint256 activeCapTables) {
        return _activeCapTables;
    }

    function getCapTableList() external view returns (address[] memory capTableList) {
        return _capTables;
    }

    function getId(address adr) external view returns (string memory id) {
        return _addressToId[adr];
    }

    function getStatus(address adr) external view returns (uint256 status) {
        return _addressToStatus[adr];
    }

    function getAddress(string calldata id) external view returns (address capTableAddress) {
        return _idToAddress[id];
    }
}
