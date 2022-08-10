import { Wallet } from "ethers";

const debug = require('debug')('brok:sdk:blockchain');


export class BlockchainSDK {
    constructor(readonly signer: Wallet, readonly theGraphUrl: string) {}

}