import { Wallet } from "ethers";

export class BlockchainSDK {
    constructor(readonly signer: Wallet, readonly theGraphUrl: string) {}
}
