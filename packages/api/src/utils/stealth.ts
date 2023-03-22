import { ethers } from "ethers";
import { getSharedSecret as nobleGetSharedSecret, Point, CURVE } from "noble-secp256k1";
import debug from "debug";
import { CONTRACT_ADDRESSES, START_BLOCK } from "../contants";
import { ERC5564Messenger__factory } from "@brok/captable";
const log = debug("dsp:stealth-utils");

export function getSharedSecret(
	privateKeyHexWithout0x: string,
	publicKeyHexWithout0xWithCompressionPrefix: string,
): bigint {
	log("getSharedSecret", {
		privateKeyHexWithout0x,
		publicKeyHexWithout0xWithCompressionPrefix,
	});
	if (log.enabled) {
		const withoutAnyPrefix = publicKeyHexWithout0xWithCompressionPrefix.slice(2);
		const pubX = withoutAnyPrefix.slice(0, withoutAnyPrefix.length / 2);
		const pubY = withoutAnyPrefix.slice(withoutAnyPrefix.length / 2);
		log("pubX", pubX);
		log("pubY", pubY);
	}
	const sharedSecret = nobleGetSharedSecret(privateKeyHexWithout0x, publicKeyHexWithout0xWithCompressionPrefix, false);
	log("sharedSecretHex", sharedSecret);
	const hash = ethers.utils.keccak256(`0x${sharedSecret.slice(2)}`); // remove 04 prefix, does not have 0x prefix so we add this
	log("sharedSecretHash", hash);
	const sharedSecretBigInt = BigInt(hash);
	log("sharedSecretBigInt", sharedSecretBigInt);
	return sharedSecretBigInt;
}

export function getStealthAddress(spendingPublicKeyHexWithout0x: string, sharedSecret: bigint): string {
	log("getStealthAddress spendingPublicKeyHexWithout0x", spendingPublicKeyHexWithout0x);
	const sharedSecretOnCurve = sharedSecret % CURVE.n;
	if (log.enabled) {
		const sharedSecretPoint = Point.fromPrivateKey(sharedSecretOnCurve).toHex(false).slice(2); // remove 04 prefix
		log("sharedSecretPoint", sharedSecretPoint);
		const pubX = sharedSecretPoint.slice(0, sharedSecretPoint.length / 2);
		const pubY = sharedSecretPoint.slice(sharedSecretPoint.length / 2);
		log("pubX sharedSecretPoint", pubX);
		log("pubY sharedSecretPoint", pubY);
	}
	const currentSpenderPoint = Point.fromHex(spendingPublicKeyHexWithout0x);
	// log("currentSpenderPoint", currentSpenderPoint.toHex(false).slice(2));
	const stealthPublicKey = currentSpenderPoint.add(Point.fromPrivateKey(sharedSecretOnCurve));
	log("stealthPublicKey", stealthPublicKey.toHex());
	if (log.enabled) {
		const withoutAnyPrefix = stealthPublicKey.toHex();
		const pubX = withoutAnyPrefix.slice(0, withoutAnyPrefix.length / 2);
		const pubY = withoutAnyPrefix.slice(withoutAnyPrefix.length / 2);
		log("pubX stealthPublicKey", pubX);
		log("pubY stealthPublicKey", pubY);
	}
	const address = ethers.utils.computeAddress(`0x${stealthPublicKey.toHex()}`);
	log("getStealthAddress address", address);
	return ethers.utils.getAddress(address);
}

export function getRecoveryPrivateKey(privateKeyHex: string, sharedSecret: bigint): string {
	const privateKeyBigInt = (BigInt(privateKeyHex) + sharedSecret) % CURVE.n;
	const privateKey = ethers.utils.hexZeroPad(ethers.BigNumber.from(privateKeyBigInt).toHexString(), 32);
	return privateKey;
}

export const signatureToStealthKeys = (signature: string) => {
	// copied from Umbra, thanks!
	// Split hex string signature into two 32 byte chunks
	const startIndex = 2; // first two characters are 0x, so skip these
	const length = 64; // each 32 byte chunk is in hex, so 64 characters
	const portion1 = signature.slice(startIndex, startIndex + length);
	const portion2 = signature.slice(startIndex + length, startIndex + length + length);
	const lastByte = signature.slice(signature.length - 2);
	if (`0x${portion1}${portion2}${lastByte}` !== signature) {
		throw new Error("Signature incorrectly generated or parsed");
	}

	// Hash the signature pieces to get the two private keys
	const spendingPrivateKey = ethers.utils.sha256(`0x${portion1}`);
	const viewingPrivateKey = ethers.utils.sha256(`0x${portion2}`);
	const spend = new ethers.Wallet(spendingPrivateKey);
	const view = new ethers.Wallet(viewingPrivateKey);
	return {
		spend,
		view,
	};
};

export const formatPublicKeyForSolidityBytes = (publicKey: string): `0x${string}` => {
	return `0x${publicKey.slice(4)}`; // remove 04 compresseion key prefix, re-add 0x prefix
};

export const getAnnoncements = async (fromBlock = 0, provider: ethers.providers.BaseProvider) => {
	log("getAnnoncements", Math.max(START_BLOCK, fromBlock));
	const messenger = new ERC5564Messenger__factory().attach(CONTRACT_ADDRESSES.ERC5564_MESSENGER).connect(provider);
	const eventFilter = messenger.filters.Announcement();
	const events = await messenger.queryFilter(eventFilter, Math.max(START_BLOCK, fromBlock), "latest");
	return events;
};
