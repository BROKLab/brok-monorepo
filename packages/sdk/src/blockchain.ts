import { CapTableRegistry, CapTableRegistry__factory, CapTable__factory, localhostContracts } from "@brok/captable";
import debug from "debug";
import { ContractReceipt, ethers, Wallet } from "ethers";
import { err, ok, Result } from "neverthrow";
import { CapTableEthereumId, TransferRequest } from "./types";

export type ACCEPTED_BROK_ENVIROMENTS = "brokLocal" | "brokDev" | "brokTest" | "brokProd";
const log = debug("brok:sdk:blockchain");

export class BlockchainSDK {
	private BROK_ENVIRONMENT: ACCEPTED_BROK_ENVIROMENTS;
	constructor(readonly signer: Wallet, readonly theGraphUrl: string, brokEnviroment: string) {
		if (!BlockchainSDK.acceptedEnviroment(brokEnviroment)) {
			throw Error(
				"Please set env variable BROK_ENVIRONMENT to one of the following: brokLocal, brokDev, brokTest, brokProd",
			);
		}
		this.BROK_ENVIRONMENT = brokEnviroment;
	}

	createRandomWallet(): Wallet {
		return ethers.Wallet.createRandom();
	}

	capTableContract(address: string) {
		return new CapTable__factory(this.signer).attach(address);
	}
	async operatorTransfer(
		capTableAddress: string,
		transferRequest: TransferRequest,
	): Promise<Result<{ transactionHash: string }, string>> {
		try {
			const balance = await this.capTableContract(capTableAddress).balanceOfByPartition(
				ethers.utils.formatBytes32String(transferRequest.partition),
				transferRequest.from,
			);
			if (ethers.BigNumber.from(transferRequest.amount).gt(balance)) {
				return err(
					`Balance ${balance.toString()}for address ${transferRequest.from} is insufficient for transfer of ${
						transferRequest.amount
					}`,
				);
			}

			const operatorTransferTX = await this.capTableContract(capTableAddress).operatorTransferByPartition(
				ethers.utils.formatBytes32String(transferRequest.partition),
				transferRequest.from,
				transferRequest.to,
				ethers.utils.parseEther(transferRequest.amount),
				"0x11",
				"0x",
			);
			const reciept = await operatorTransferTX.wait();
			return ok({
				transactionHash: reciept.transactionHash,
			});
		} catch (e) {
			log("operatorTransfer failed with error:", e);
			return err(
				`Error while transferring ${transferRequest.amount} from ${transferRequest.from} to ${transferRequest.to} on capTable ${capTableAddress}`,
			);
		}
	}

	async deployCapTable(input: { name: string; orgnr: string; addresses: string[]; amounts: string[] }): Promise<
		Result<CapTableEthereumId, string>
	> {
		try {
			const { name, orgnr, addresses, amounts } = input;

			if (addresses.length === 0) {
				return err("Must issue on deploy");
			}

			const DEFAULT_PARTITION = ethers.utils.formatBytes32String("ordinære");
			const deployTX = await new CapTable__factory(this.signer).deploy(
				name,
				orgnr,
				ethers.utils.parseEther("1"),
				["0xb977651ac2f276c3a057003f9a6a245ef04c7147"],
				[DEFAULT_PARTITION],
				this.capTableRegistryContract().address,
			);
			const capTable = await deployTX.deployed();
			log("Deployed capTable:", capTable.address);

			const queTX = await this.capTableRegistryContract().que(capTable.address, orgnr);
			const queReceipt = await queTX.wait();
			log(`Qued capTable ${capTable.address} for orgnr ${orgnr}`, queReceipt);

			for await (const i of addresses.keys()) {
				const issueTX = await capTable.issueByPartition(
					DEFAULT_PARTITION,
					addresses[i],
					ethers.utils.parseEther(amounts[i]),
					"0x11",
				);
				const issueReceipt = await issueTX.wait();
				log(`Issue ${amounts[i]} to ${addresses[i]} on ${capTable.address} with receipt:`, issueReceipt);
			}
			const transferOwenrshipTX = await capTable.transferOwnership("0xb977651ac2f276c3a057003f9a6a245ef04c7147");
			const transferOwenrshipReceipt = await transferOwenrshipTX.wait();
			log(
				`Transfer ownership to ${"0xb977651ac2f276c3a057003f9a6a245ef04c7147"} on ${capTable.address} with receipt:`,
				transferOwenrshipReceipt,
			);

			const approveTx = await this.capTableRegistryContract().approve(capTable.address);
			await approveTx.wait();
			log(`Approved capTable ${capTable.address} for orgnr ${orgnr}`);
			return ok(capTable.address);

			// const capTableAddress = this.getDeployedCapTableFromEventReceipt(reciept);
			// if (capTableAddress.isOk()) {
			//   return ok(capTableAddress.value.toLowerCase());
			// } else {
			//   return err(capTableAddress.error);
			// }
		} catch (error) {
			log(error);
			return err(`Error while deploying captable ${input.name} on blockchain, input was`);
		}
	}

	async deleteCapTable(capTableAddress: string) {
		try {
			const capTableStatus = await this.capTableRegistryContract().getStatus(capTableAddress);
			if (capTableStatus.toNumber() !== 2) {
				return err(`CapTable must be active in order to be removed. Status is now: ${capTableStatus.toNumber()}`);
			}
			const deleteCapTable = await this.capTableRegistryContract().remove(capTableAddress);
			const tx = await deleteCapTable.wait();
			return ok({
				transactionHash: tx.transactionHash,
			});
		} catch (error) {
			log("capTable removal failed with error:", error);
			return err(`Could not delete capTable ${capTableAddress}`);
		}
	}

	capTableRegistryContract() {
		if (!BlockchainSDK.acceptedEnviroment(this.BROK_ENVIRONMENT)) {
			throw Error("Please set env variable BROK_ENVIRONMENT");
		}
		return new CapTableRegistry__factory(this.signer).attach(
			Deployments[this.BROK_ENVIRONMENT as keyof typeof Deployments].contracts.CapTableRegistry.address,
		) as CapTableRegistry;
	}

	private static acceptedEnviroment(value: string): value is ACCEPTED_BROK_ENVIROMENTS {
		return ["brokLocal", "brokDev", "brokTest", "brokProd"].includes(value);
	}
}
