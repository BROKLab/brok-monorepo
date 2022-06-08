import { sh } from "tasksfile"
import { frontendApp, serverApp } from "./deploy"
import { Wallet } from "ethers"
import { writeFileSync, readFileSync } from "fs"
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";

async function seed() {
    const walletToJson = async (wallet: Wallet) => ({
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      seed: wallet.mnemonic.phrase,
      did: await getDID(wallet),
    })
    try {
      let devWallet = readFileSync('.wallet.dev.json', 'utf8')
        try {
          devWallet = JSON.parse(devWallet)
          console.log(`Using .wallet.dev.json`)
        } catch (error) {
          try {
            console.log("Chcking for seed")
            const newWallet = Wallet.fromMnemonic(devWallet)
            writeFileSync('.wallet.dev.json', JSON.stringify(await walletToJson(newWallet)));
          } catch (error) {
            console.log("Could not import wallet")
          }
        }
 
    } catch (error) {
      const newWallet = Wallet.createRandom()
      writeFileSync('.wallet.dev.json', JSON.stringify(await walletToJson(newWallet)));
    }
 

  }
  async function getDID(wallet : Wallet) {
    const seed = Uint8Array.from(
      Buffer.from(wallet.privateKey.substring(2), "hex")
    );
    const provider = new Ed25519Provider(seed);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();
    return did.id;
  }

  export default {
      seed: seed,
  }