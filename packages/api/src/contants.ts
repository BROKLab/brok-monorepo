import { localhostContracts, brokDevContracts } from "@brok/captable";
import { ethers } from "ethers";
import { signatureToStealthKeys } from "./utils/stealth";

if (!process.env.PRIVATE_KEY) {
	throw new Error("Please set PRIVATE_KEY in your .env file");
}
if (!process.env.RPC_URL) {
	throw new Error("Please set RPC_URL in your .env file");
}

const Networks = {
	ARBITRUM_GOERLI: 421613,
	LOCALHOST: 31337,
} as const;

const StartBlocks = {
	[Networks.ARBITRUM_GOERLI]: 5074309,
	[Networks.LOCALHOST]: 0,
} as const;

const ContractAddresses = {
	[Networks.ARBITRUM_GOERLI]: brokDevContracts,
	[Networks.LOCALHOST]: localhostContracts,
} as const;

export type CurrentNetwork = typeof Networks[keyof typeof Networks];
const DEFAULT_NETWORK = process.env.NODE_ENV === "development" ? Networks.LOCALHOST : Networks.ARBITRUM_GOERLI;
export const START_BLOCK = StartBlocks[DEFAULT_NETWORK];
export const CONTRACT_ADDRESSES = ContractAddresses[DEFAULT_NETWORK];
export const WALLET = new ethers.Wallet(process.env.PRIVATE_KEY);
export const GET_PROVIDER = () => {
	return new ethers.providers.JsonRpcProvider({
		url: process.env.RPC_URL!,
	});
};
const SIGNATURE = WALLET.signMessage("This is just to create an stealth address");
export const STEALTH_KEYS = async () => signatureToStealthKeys(await SIGNATURE);
export const SPEND_KEY = async () => (await STEALTH_KEYS()).spend;
export const VIEW_KEY = async () => (await STEALTH_KEYS()).view;
