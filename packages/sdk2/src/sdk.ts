import { ethers, Wallet, providers } from "ethers";
import { err, ok } from "neverthrow";
import { BlockchainSDK } from "./blockchain";
import { CeramicSDK } from "./ceramic";
import { getDIDfromPrivateKey } from "./utils/did";

export class SDK {
    private constructor(private blockchain: BlockchainSDK, private ceramic: CeramicSDK) {}

    public static async init(config: { ceramicUrl: string; ethereumRpc: string; theGraphUrl: string; secret: string }) {
        try {
            const signer = await SDK.initWallet(config.ethereumRpc, config.secret);
            if (signer.isErr()) {
                throw Error(signer.error);
            }
            const ceramic = new CeramicSDK(config.ceramicUrl);
            const blockchain = new BlockchainSDK(signer.value, config.theGraphUrl);
            const did = await getDIDfromPrivateKey(signer.value.privateKey);
            if (did.isErr()) {
                throw Error(did.error);
            }
            await ceramic.setDID(did.value);
            if(!ceramic.did){
                throw Error("Could not set DID");
            }
            console.log("SDK address", signer.value.address);
            console.log("SDK did", ceramic.did.id);
            return new SDK(blockchain, ceramic);
        } catch (e) {
            console.log("Could not init SDK. Error message:", e);
            return err(`Could not init SDK. Error: ${e}`);
        }
    }

    public async close() {
        await this.ceramic.close();
    }

    // private
    private static async initWallet(rpc: string, secret: string) {
        try {
            const provider = new providers.JsonRpcProvider(rpc);
            const signer = ethers.utils.isHexString(secret) ? new Wallet(secret, provider) : Wallet.fromMnemonic(secret);
            return ok(signer);
        } catch (e) {
            console.log("Could not init wallet. Error message:", e);
            return err(`COuld not init wallet. Error: ${e} `);
        }
    }
}
