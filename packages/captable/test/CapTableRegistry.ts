import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import type { CapTableRegistry } from "../typechain-types/index";

// let norgesBank: SignerWithAddress;
let operator1: SignerWithAddress;
let operator2: SignerWithAddress;
let newAdmin: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let contract1: SignerWithAddress;
let contract2: SignerWithAddress;

let capTableRegistry: CapTableRegistry;

beforeEach(async () => {
	// eslint-disable-next-line no-unused-vars
	const allAccounts = await ethers.getSigners();
	operator1 = allAccounts[0];
	operator2 = allAccounts[1];
	newAdmin = allAccounts[2];
	user1 = allAccounts[3];
	user2 = allAccounts[4];
	contract1 = allAccounts[5];
	contract2 = allAccounts[6];

	const CapTableRegistryFactory = await ethers.getContractFactory("CapTableRegistry");
	capTableRegistry = (await CapTableRegistryFactory.deploy()) as CapTableRegistry;
	await capTableRegistry.deployed();

	// Authenticate bank
	await capTableRegistry.authenticateOperatorWithDID(operator1.address, "Bisma", "DID:KEY:123");

	// Authenticate users
	const authTx = await capTableRegistry.connect(operator1).setAuthenticatedPerson(user1.address);
	await authTx.wait();

	// Authenticate user
	const authTx2 = await capTableRegistry.connect(operator1).setAuthenticatedPerson(user2.address);
	await authTx2.wait();
});

describe("Cap Table Registry tets", function () {
	it("Should add captable to registry", async function () {
		// Var with 52 weeks in seconds
		expect(capTableRegistry.addCapTable(contract1.address, "123"))
			.to.emit(capTableRegistry, "CapTableAdded")
			.withArgs([contract1.address, "123"]);
	});
	it("Should fail to add captable with exisiting id or address", async function () {
		// Var with 52 weeks in seconds

		const tx1 = await capTableRegistry.addCapTable(contract1.address, "123");
		await tx1.wait();

		await expect(capTableRegistry.addCapTable(contract2.address, "123")).to.be.revertedWith("id is allready in use");
		await expect(capTableRegistry.addCapTable(contract1.address, "456")).to.be.revertedWith(
			"address is allready in use",
		);
	});

	it("Should count captable correct", async function () {
		// Var with 52 weeks in seconds

		const tx1 = await capTableRegistry.addCapTable(contract1.address, "111");
		await tx1.wait();

		const tx2 = await capTableRegistry.addCapTable(contract2.address, "222");
		await tx2.wait();

		const tx3 = await capTableRegistry.addCapTable(ethers.Wallet.createRandom().address, "333");
		await tx3.wait();

		await expect(await capTableRegistry.getActiveCapTablesCount()).to.be.equal(3);

		const tx4 = await capTableRegistry.removeCapTable(contract1.address);
		await tx4.wait();

		await expect(await capTableRegistry.getActiveCapTablesCount()).to.be.equal(2);

		const tx5 = await capTableRegistry.addCapTable(ethers.Wallet.createRandom().address, "555");
		await tx5.wait();

		await expect(await capTableRegistry.getActiveCapTablesCount()).to.be.equal(3);
	});
});
