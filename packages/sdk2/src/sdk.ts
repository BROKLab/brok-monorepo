
import { debug } from "debug";
import { ethers, Wallet, providers } from "ethers"
import { err, ok } from "neverthrow"


const debug = require('debug')('brok:sdk:main');

 export  class SDK {
    private constructor(private blockchain: Blockchain, private ceramic: CeramicSDK) {

        
    }
    public static async init(config: { ceramicUrl: string; ethereumRpc: string; theGraphUrl: string; secret: string }) {
        const signer = await SDK.initWallet(config.ethereumRpc, config.secret);
        debug("signer", signer);
        return new SDK();
    }

    private static async initWallet(rpc: string, secret: string) {
        try {
            const provider = new providers.JsonRpcProvider(rpc);
            const signer = ethers.utils.isHexString(secret) ? new Wallet(secret, provider) : Wallet.fromMnemonic(secret);
            return ok(Wallet.fromMnemonic(secret).connect(provider));
        } catch (e) {
            debug('Could not init wallet. Error message:', e);
            return err(`COuld not init wallet. Error: ${e} `);
        }
    }
    public async close(){
        await this.ceramic.close();
      }
}
