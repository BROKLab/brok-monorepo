import { DID } from "dids";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
export async function getDIDfromPrivateKey(privateKey: string): Promise<DID> {
	try {
		const seed = Uint8Array.from(Buffer.from(privateKey.substring(2), "hex"));
		const provider = new Ed25519Provider(seed);
		const did = new DID({ provider, resolver: getResolver() });
		await did.authenticate();
		return did;
	} catch (error) {
		console.error(error);
		throw new Error("Could not create DID from private key");
	}
}

export async function getDIDfromHardhatDeployer(hre: HardhatRuntimeEnvironment) {
	try {
		if (typeof hre.network.config.accounts !== "string" && "mnemonic" in hre.network.config.accounts) {
			const wallet = hre.ethers.Wallet.fromMnemonic(hre.network.config.accounts.mnemonic);
			const seed = Uint8Array.from(Buffer.from(wallet.privateKey.substring(2), "hex"));
			const provider = new Ed25519Provider(seed);
			const did = new DID({ provider, resolver: getResolver() });
			await did.authenticate();
			return did;
		} else {
			// Fix for on localhost, the mnemonic is not in the network config (remote), but in the hardhat config
			if (
				hre.userConfig.networks &&
				"hardhat" in hre.userConfig.networks &&
				hre.userConfig.networks.hardhat &&
				"accounts" in hre.userConfig.networks.hardhat &&
				hre.userConfig.networks.hardhat.accounts
			) {
				if (
					typeof hre.userConfig.networks.hardhat.accounts !== "string" &&
					"mnemonic" in hre.userConfig.networks.hardhat.accounts &&
					hre.userConfig.networks.hardhat.accounts.mnemonic
				) {
					console.log("useing mnemonic from hardhat config");
					const wallet = hre.ethers.Wallet.fromMnemonic(hre.userConfig.networks.hardhat.accounts.mnemonic);
					const seed = Uint8Array.from(Buffer.from(wallet.privateKey.substring(2), "hex"));
					const provider = new Ed25519Provider(seed);
					const did = new DID({ provider, resolver: getResolver() });
					await did.authenticate();
					return did;
				}
			}
		}
		throw new Error(
			"No mnemonic found in network config, could not calculate DID which is needed to deploy CapTableRegistry",
		);
	} catch (error) {
		console.error(error);
		throw new Error("Cant get DID from getDIDfromHardhatDeployer");
	}
}
