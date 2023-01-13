import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { CapTableRegistry, CapTable__factory } from "../typechain-types/index";

// let norgesBank: SignerWithAddress;
let operator1: SignerWithAddress;
let operator2: SignerWithAddress;
let newAdmin: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let contract1: SignerWithAddress;
let contract2: SignerWithAddress;

let capTableRegistry: CapTableRegistry;

const OPERATOR1_DID = "did:ethr:0x123";
const OPERATOR1_NAME = "Bisma";

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
	await capTableRegistry.authenticateOperatorWithDID(operator1.address, OPERATOR1_NAME, OPERATOR1_DID);

	// Authenticate users
	const authTx = await capTableRegistry.connect(operator1).setAuthenticatedPerson(user1.address);
	await authTx.wait();

	// Authenticate user
	const authTx2 = await capTableRegistry.connect(operator1).setAuthenticatedPerson(user2.address);
	await authTx2.wait();
});

describe("Cap Table", function () {
	it("Sohuld create captable", async function () {
		// Var with 52 weeks in seconds
		const randomID = Math.floor(Math.random() * 90000) + 10000;
		const captable = await new CapTable__factory(operator1).deploy(
			`Test Company ${randomID}`,
			randomID.toString(),
			ethers.utils.parseEther("1"),
			[],
			[ethers.utils.formatBytes32String("ordinære")],
			capTableRegistry.address,
		);
		await captable.deployed();
		expect(await captable.getOrgnr()).to.be.equal(randomID.toString());

		expect(capTableRegistry.addCapTable(contract1.address, "123"))
			.to.emit(capTableRegistry, "CapTableAdded")
			.withArgs([contract1.address, "123"]);
	});
	it("create cap table should emit event", async function () {
		// Var with 52 weeks in seconds

		const randomID = Math.floor(Math.random() * 90000) + 10000;
		const capTable = await new CapTable__factory(operator1).deploy(
			`Test Company ${randomID}`,
			randomID.toString(),
			ethers.utils.parseEther("1"),
			[],
			[ethers.utils.formatBytes32String("ordinære")],
			capTableRegistry.address,
		);
		expect(await capTable.deployed())
			.to.emit(capTable, "NewCapTable")
			.withArgs([randomID.toString(), operator1.address]);
	});

	it("Should add cap table to list", async function () {
		// Var with 52 weeks in seconds
		const randomID = Math.floor(Math.random() * 90000) + 10000;
		const capTable = await new CapTable__factory(operator1).deploy(
			`Test Company ${randomID}`,
			randomID.toString(),
			ethers.utils.parseEther("1"),
			[],
			[ethers.utils.formatBytes32String("ordinære")],
			capTableRegistry.address,
		);
		const tx1 = await capTableRegistry.addCapTable(capTable.address, randomID.toString());
		await tx1.wait();

		expect(await capTable.getFagsystemDid()).to.be.equal(OPERATOR1_DID);
		expect(await capTable.getFagsystem()).to.be.equal(operator1.address);
	});
});
