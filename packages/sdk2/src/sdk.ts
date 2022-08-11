import debug from "debug";
import { ethers, providers, Wallet } from "ethers";
import { err, ok, Result } from "neverthrow";
import { ACCEPTED_BROK_ENVIROMENTS, BlockchainSDK } from "./blockchain.js";
import { CeramicSDK } from "./ceramic.js";
import { CeramicId, CreateCapTableInput, EthereumAddress } from "./types.js";
import { getDIDfromPrivateKey } from "./utils/did.js";

export class SDK {
    private static logger = debug("brok:sdk:main");
    private constructor(private blockchain: BlockchainSDK, private ceramic: CeramicSDK) {}

    public static async init(config: {
        ceramicUrl: string;
        ethereumRpc: string;
        theGraphUrl: string;
        secret: string;
        env: ACCEPTED_BROK_ENVIROMENTS;
    }): Promise<SDK> {
        try {
            const signer = await SDK.initWallet(config.ethereumRpc, config.secret);
            if (signer.isErr()) {
                throw Error(signer.error);
            }
            const ceramic = new CeramicSDK(config.ceramicUrl);
            const blockchain = new BlockchainSDK(signer.value, config.theGraphUrl, config.env);
            const did = await getDIDfromPrivateKey(signer.value.privateKey);
            if (did.isErr()) {
                throw Error(did.error);
            }
            await ceramic.setDID(did.value);
            if (!ceramic.did) {
                throw Error("Could not set DID");
            }
            SDK.logger("SDK address", signer.value.address);
            SDK.logger("SDK did", ceramic.did.id);
            return new SDK(blockchain, ceramic);
        } catch (e) {
            SDK.logger("Could not init SDK. Error message:", e);
            throw Error(`Could not init SDK. Error: ${e}`);
        }
    }

    async close() {
        await this.ceramic.close();
    }

    async createCapTable(input: CreateCapTableInput): Promise<Result<string, string>> {
        try {
            const shareholders = input.shareholders.map((shareholder) => ({
                ...shareholder,
                ethAddress: this.blockchain.createRandomWallet().address.toLowerCase(),
            }));
            // Check for existing capTable in registry
            try {
                const existingCapTableAddress = await this.blockchain.capTableRegistryContract().getAddress(input.orgnr);
                if (existingCapTableAddress !== ethers.constants.AddressZero) {
                    return err(`CapTable with orgnr ${input.orgnr} already exists`);
                }
            } catch (error) {
                SDK.logger(error);
                return err("Could not check if captable exist in registry");
            }
            // Check is fagsystem
            try {
                const isFagsystem = await this.blockchain
                    .capTableRegistryContract()
                    .hasRole(ethers.utils.solidityKeccak256(["string"], ["FAGSYSTEM"]), this.blockchain.signer.address);
                if (!isFagsystem) {
                    SDK.logger(`Current signer (${this.blockchain.signer.address})does not have role fagsystem`);
                    return err("Your signer does NOT have role fagsystem. Must be fagsystem to deploy cap table");
                }
            } catch (error) {
                SDK.logger(error);
                return err("Could not check if your signer had role fagsystem");
            }
            // 1. Deploy captable on blockchain
            const addresses: string[] = [];
            const amounts: string[] = [];

            for await (const shareholder of shareholders) {
                addresses.push(shareholder.ethAddress);
                amounts.push(shareholder.amount);
            }
            const deployedCapTableResult = await this.blockchain.deployCapTable({
                addresses: addresses,
                amounts: amounts,
                name: input.name,
                orgnr: input.orgnr,
            });
            if (deployedCapTableResult.isErr()) {
                return err(deployedCapTableResult.error);
            }
            // 2. Insert shareholder public data on Ceramic
            const shareholderEthToCeramic: Record<EthereumAddress, CeramicId> = {};

            for await (const shareholder of shareholders) {
                const ceramicId = await this.ceramic.createShareholder(shareholder);
                if (ceramicId.isErr()) {
                    return err(ceramicId.error);
                } else {
                    shareholderEthToCeramic[shareholder.ethAddress] = ceramicId.value;
                }
            }

            // 3. Insert captable data on Ceramic for referencing eth address -> ceramic uri
            const ceramicCapTableRes = await this.ceramic.createCapTable({
                data: {
                    orgnr: input.orgnr,
                    name: input.name,
                    shareholderEthToCeramic,
                },
                capTableAddress: deployedCapTableResult.value,
                capTableRegistryAddress: this.blockchain.capTableRegistryContract().address,
            });
            if (ceramicCapTableRes.isErr()) {
                return err(ceramicCapTableRes.error);
            }

            // X. Approve cap table on the blockchain
            try {
                const approveRes = await this.blockchain.capTableRegistryContract().approve(deployedCapTableResult.value);
                await approveRes.wait();
            } catch (error) {
                SDK.logger(error);
                return err("Could not approve captable");
            }

            return ok(deployedCapTableResult.value);
        } catch (error) {
            SDK.logger(error);
            return err("Something unknown went wrong when creating the cap table. See logs or contact administrator.");
        }
    }

    // private
    private static async initWallet(rpc: string, secret: string) {
        try {
            const provider = new providers.JsonRpcProvider(rpc);
            const signer = ethers.utils.isHexString(secret) ? new Wallet(secret, provider) : Wallet.fromMnemonic(secret).connect(provider);
            return ok(signer);
        } catch (e) {
            this.logger("Could not init wallet. Error message:", e);
            return err(`COuld not init wallet. Error: ${e} `);
        }
    }
}
