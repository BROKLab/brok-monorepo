// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/AccessControl.sol';

contract VCRegistry is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256('OPERATOR_ROLE');

    struct Authentication {
        address operator;
        uint256 timestamp;
    }

    mapping(address => Authentication) private authenticationOf;
    mapping(address => address) private ownerOfContract; // Contracts with an owner are authenticated for transactions
    mapping(address => string) private operatorNameOf;

    event AuthenticatedPerson(address indexed authenticatedAddress);

    event PersonAuthenticatedContract(address indexed contractAddress, address indexed owner);
    event ContractRevoked(address indexed contractAddress, address indexed owner);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function setAuthenticatedPerson(address _address) external onlyRole(OPERATOR_ROLE) {
        // If the person is already authenticated, update the timestamp. Only the same operator as previous authentication can do this.
        if (authenticationOf[_address].operator != address(0)) {
            require(authenticationOf[_address].operator == msg.sender, 'A new operator can not authenticate a wallet owned by another operator');
        }

        authenticationOf[_address] = Authentication(msg.sender, block.timestamp);
        emit AuthenticatedPerson(_address);
    }

    function revokeAuthenticationPerson(address _address) external {
        require(authenticationOf[_address].operator == msg.sender, 'Only the operator that authenticated the address can revoke it');
        delete authenticationOf[_address].timestamp;
    }

    function setAuthenticatedContract(address _address) external {
        require(authenticationOf[msg.sender].timestamp > 0, 'Msg.sender needs to be authenticated'); // TODO Could include a timeValid check for last authenticated
        require(ownerOfContract[_address] == address(0), 'Contract already authenticated');

        ownerOfContract[_address] = msg.sender;
        emit PersonAuthenticatedContract(_address, msg.sender);
    }

    function revokeAuthenticationContract(address _address) external {
        address owner = ownerOfContract[_address];
        address ownerOperator = authenticationOf[owner].operator;
        require(owner == msg.sender || ownerOperator == msg.sender, "Only the owner of the contract or it's operator can revoke authentication");

        emit ContractRevoked(_address, ownerOfContract[_address]);
        delete ownerOfContract[_address];
    }

    // Check that the given address has a valid VC
    function checkAuthenticated(address _address, uint256 timeValid) external view returns (bool) {
        // Operators and admins are always authenticated
        if (hasRole(OPERATOR_ROLE, _address) || hasRole(DEFAULT_ADMIN_ROLE, _address)) {
            return true;
        }

        // If _address is a contract, it is enough that it's authenticated
        if (ownerOfContract[_address] != address(0)) {
            if (authenticationOf[ownerOfContract[_address]].timestamp > 0) return true;
        }

        // If _address is a person check that the authTime is valid
        if (authenticationOf[_address].timestamp != 0) {
            uint256 authTime = authenticationOf[_address].timestamp;
            uint256 cutoffTime = authTime + timeValid;
            bool isBetweenZeroAndCutoffTime = authTime > 0 && block.timestamp < cutoffTime;
            return isBetweenZeroAndCutoffTime;
        }

        return false;
    }

    function authenticateOperator(address _operatorAddress, string calldata _operatorName) external {
        operatorNameOf[_operatorAddress] = _operatorName;
        grantRole(OPERATOR_ROLE, _operatorAddress);
    }

    function revokeOperator(address operator) external {
        revokeRole(OPERATOR_ROLE, operator);
    }

    function changeAdmin(address newAdmin) external {
        grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getOperatorOf(address _address) external view returns (address) {
        return authenticationOf[_address].operator;
    }

    function checkAuthenticatedOnce(address _address) external view returns (bool) {
        bool isOperator = hasRole(OPERATOR_ROLE, _address) || hasRole(DEFAULT_ADMIN_ROLE, _address);
        bool contractHasOwner = ownerOfContract[_address] != address(0);
        bool personHasAuthTime = authenticationOf[_address].timestamp != 0;
        bool isBurn = _address == address(0);

        return contractHasOwner || personHasAuthTime || isOperator || isBurn;
    }

    function changeOperatorName(address _operatorAddress, string calldata _operatorName) external onlyRole(DEFAULT_ADMIN_ROLE) {
        operatorNameOf[_operatorAddress] = _operatorName;
    }

    function getOperatorName(address _operatorAddress) external view returns (string memory) {
        return operatorNameOf[_operatorAddress];
    }
}
