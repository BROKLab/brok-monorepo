// SPDX-License-Identifier: ISC

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./../tools/ERC1820Client.sol";
import "hardhat/console.sol";

contract CapTableRegistry is AccessControl, ERC1820Client {
    address[] internal _capTables;
    mapping(address => uint256) internal _status; // 0:notUsed 1:qued 2:approved 3:declined 4:removed 5:migrated
    mapping(address => string) internal _addressToId;
    mapping(string => address) internal _idToAddress; // id = orgnr
    mapping(string => address) internal _idToQuedAddress; // Hvem som helst kan queue, så derfor "tar" man ikke orgnr når man queuer, men nå som kun fagsystem gjør det går det fint.
    uint256 internal _activeCapTables;
    uint256 internal _quedCapTables;

    string internal constant ERC1400_INTERFACE_NAME = "ERC1400Token";

    event capTableQued(address indexed capTableAddress, string id);
    event capTableApproved(address indexed capTableAddress);
    event capTableRemoved(address indexed capTableAddress);
    event capTableDeclined(address indexed capTableAddress, bytes32 reason);
    event capTableMigrate(
        address indexed from,
        address indexed to,
        string indexed id
    );

    bytes32 public constant FAGSYSTEM = keccak256("FAGSYSTEM");

    constructor(address[] memory fagsystemAdr) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        for (uint256 i = 0; i < fagsystemAdr.length;) {
            grantRole(FAGSYSTEM, fagsystemAdr[i]);
            unchecked { ++i; } // Avoids safemath to save gas
        }
    }

    function whitelistFagsystem(address adr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(FAGSYSTEM, adr);
    }

    function removeFagsystem(address adr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(FAGSYSTEM, adr);
    }

    function que(address adr, string calldata id) external {
        _queCapTable(adr, id);
    }

    function approve(address adr) external onlyRole(FAGSYSTEM) {
        _approveCapTable(adr);
    }

    function decline(address adr, bytes32 reason) external onlyRole(FAGSYSTEM) {
        _declineCapTable(adr, reason);
    }

    function remove(address adr) external onlyRole(FAGSYSTEM) {
        _removeCapTable(adr);
    }

    function getActiveCount() external view returns (uint256 activeCapTables) {
        return _activeCapTables;
    }

    function getQuedCount() external view returns (uint256 quedCapTables) {
        return _quedCapTables;
    }

    function getList() external view returns (address[] memory capTableList) {
        return _capTables;
    }

    function getid(address adr) external view returns (string memory id) {
        return _addressToId[adr];
    }

    function getStatus(address adr) external view returns (uint256 status) {
        return _status[adr];
    }

    function getAddress(string calldata orgnr)
        external
        view
        returns (address capTableAddress)
    {
        return _idToAddress[orgnr];
    }

    function getMigrationAddress(string calldata id) external view returns (address) {
        return _getMigrationAddress(id);
    }

    function migrateCaptable(string calldata id) external onlyRole(FAGSYSTEM) {
        _migrateCapTable(id);
    }

    function _getMigrationAddress(string calldata id) internal view returns (address) {
        address currentImplementation = interfaceAddr(
            _idToAddress[id],
            ERC1400_INTERFACE_NAME
        );
        return currentImplementation;
    }

    function _queCapTable(address adr, string memory id) internal {
        require(
            _status[adr] != 1,
            "Qued capTables must be declined before reQue"
        );
        require(_status[adr] != 2, "Cannot que active capTable");
        _capTables.push(adr);
        _status[adr] = 1;
        _addressToId[adr] = id;
        _idToQuedAddress[id] = adr;
        unchecked { _quedCapTables++; }
        emit capTableQued(adr, id);
    }

    function _approveCapTable(address adr) internal {
        require(_status[adr] == 1, "Only qued capTables can be approved");
        _status[adr] = 2;
        string memory id = _addressToId[adr];
        require(_idToAddress[id] == address(0), "id is allready in use");
        _idToAddress[id] = adr;
        _idToQuedAddress[id] = address(0);
        unchecked {
            _quedCapTables--; 
            _activeCapTables++;
        }
        emit capTableApproved(adr);
    }

    function _declineCapTable(address adr, bytes32 reason) internal {
        require(_status[adr] == 1, "Only qued capTables can be declined");
        _status[adr] = 3;
        unchecked { _quedCapTables--; }
        string memory id = _addressToId[adr];
        _idToQuedAddress[id] = address(0);
        emit capTableDeclined(adr, reason);
    }

    function _removeCapTable(address adr) internal {
        require(_status[adr] == 2, "Only approved capTables can be removed");
        _status[adr] = 4;
        string memory id = _addressToId[adr];
        _idToAddress[id] = address(0);
        unchecked { _activeCapTables--; }
        emit capTableRemoved(adr);
    }

    function _migrateCapTable(string calldata id) internal {
        address _address = _idToAddress[id];
        address _migratedToAddress = _getMigrationAddress(id);
        require(
            _status[_address] == 2,
            "Only approved capTables can be removed"
        );
        
        require(
            _migratedToAddress != _address,
            "Captable is not migrated in ERC1820"
        );
        require(
            _migratedToAddress != address(0),
            "Captable is migrated to an empty address"
        );
        _status[_address] = 5;
        _status[_address] = 2;
        _idToAddress[id] = _migratedToAddress;
        emit capTableMigrate(_address, _migratedToAddress, id);
    }
}
