import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import type { VCRegistry } from "../typechain-types/index";

// let norgesBank: SignerWithAddress;
let bank: SignerWithAddress;
let bank2: SignerWithAddress;
let newAdmin: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let contract1: SignerWithAddress;

let vcRegistry: VCRegistry;

beforeEach(async () => {
	// eslint-disable-next-line no-unused-vars
	const allAccounts = await ethers.getSigners();
	bank = allAccounts[0];
	bank2 = allAccounts[1];
	newAdmin = allAccounts[2];
	user1 = allAccounts[3];
	user2 = allAccounts[4];
	contract1 = allAccounts[5];

	const VCRegistryFactory = await ethers.getContractFactory("VCRegistry");
	vcRegistry = (await VCRegistryFactory.deploy()) as VCRegistry;
	await vcRegistry.deployed();

	// Authenticate bank
	await vcRegistry.authenticateOperator(bank.address, "DNB");

	// Authenticate users
	const authTx = await vcRegistry.connect(bank).setAuthenticatedPerson(user1.address);
	await authTx.wait();

	// Authenticate user
	const authTx2 = await vcRegistry.connect(bank).setAuthenticatedPerson(user2.address);
	await authTx2.wait();
});

describe("VC Registry person tets", function () {
	it("Should authenticate the address of a person", async function () {
		// Var with 52 weeks in seconds
		const cutoffTime = 52 * 7 * 24 * 60 * 60;

		expect(await vcRegistry.checkAuthenticated(user1.address, cutoffTime)).to.be.true;
		expect(await vcRegistry.checkAuthenticated(contract1.address, cutoffTime)).to.be.false;
	});

	it("Should authenticate the address of a smart contract", async function () {
		await expect(vcRegistry.connect(user1).setAuthenticatedContract(contract1.address)).not.to.be.reverted;
	});

	it("Should revoke a persons authentization", async function () {
		const revokeTx = await vcRegistry.connect(bank).revokeAuthenticationPerson(user1.address);
		await revokeTx.wait();

		await expect(vcRegistry.connect(user1).setAuthenticatedContract(contract1.address)).to.be.revertedWith(
			"Msg.sender needs to be authenticated",
		);
	});

	it("Should revoke authentication of a contract", async function () {
		const authContractTx = await vcRegistry.connect(user1).setAuthenticatedContract(contract1.address);
		await authContractTx.wait();

		const revokeTx = await vcRegistry.connect(bank).revokeAuthenticationContract(contract1.address);
		await revokeTx.wait();

		await expect(await vcRegistry.checkAuthenticated(contract1.address, 10)).to.be.false;
	});

	it("Should not authenticate a contract twice", async function () {
		const authContractTx = await vcRegistry.connect(user1).setAuthenticatedContract(contract1.address);
		await authContractTx.wait();

		await expect(vcRegistry.connect(user2).setAuthenticatedContract(contract1.address)).to.be.revertedWith(
			"Contract already authenticated",
		);
	});

	it("Should not allow a non-bank to authenticate a person", async function () {
		await expect(vcRegistry.connect(user1).setAuthenticatedPerson(user1.address)).to.be.reverted;
	});

	it("Should not allow bank2 to authenticate bank1 user's wallet", async function () {
		await expect(vcRegistry.connect(bank2).setAuthenticatedPerson(user1.address)).to.be.reverted;
	});

	it("Should not allow a non-bank to revoke authentication of a person", async function () {
		await expect(vcRegistry.connect(user1).revokeAuthenticationPerson(user1.address)).to.be.reverted;
	});

	it("Should change admin to a new address", async function () {
		// Change admin
		const changeAdminTx = await vcRegistry.changeAdmin(newAdmin.address);
		await changeAdminTx.wait();

		// await expect(vcRegistry.authenticateOperator(bank2.address, "Sbanken")).to.be.reverted;
		// await expect(vcRegistry.connect(newAdmin).authenticateOperator(bank2.address, "Sbanken")).not.to.be.reverted;
	});

	it("Should get the bank of a user who's been revoked access", async function () {
		// Revoke user
		const revokeTx = await vcRegistry.connect(bank).revokeAuthenticationPerson(user1.address);
		await revokeTx.wait();

		expect(await vcRegistry.getOperatorOf(user1.address)).to.be.equal(bank.address);
	});

	it("Should test checkAuthenticatedOnce", async function () {
		expect(await vcRegistry.checkAuthenticatedOnce(user1.address)).to.be.true;
	});

	it("Should check the name of bank1", async function () {
		expect(await vcRegistry.getOperatorName(bank.address)).to.be.equal("DNB");
	});
});
