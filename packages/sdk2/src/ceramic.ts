import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileMetadataArgs } from "@ceramicnetwork/stream-tile";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import debug from "debug";
import { err } from "neverthrow";
import { ok } from "neverthrow";
import { Result } from "neverthrow";
import { CapTableCeramic, CeramicId, EthereumAddress, Shareholder } from "./types";

export class CeramicSDK extends CeramicClient {
    private static logger = debug("brok:sdk:blockchain");
    constructor(public readonly ceramicUrl: string) {
        super(ceramicUrl);
    }

    async createShareholder(input: Shareholder): Promise<Result<CeramicId, string>> {
        const res = await this.createDocument({
            data: {
                shareholder: input,
            },
        });
        if (res.isErr()) {
            return err(res.error);
        }
        if (res.value && "id" in res.value) {
            return ok(res.value.id.toString());
        } else {
            CeramicSDK.logger("Tildocument value in createShareholder", res.value);
            return err("Something wrong with TileDocument in createShareholder");
        }
    }

    async createCapTable(input: {
        data: CapTableCeramic;
        capTableAddress: EthereumAddress;
        capTableRegistryAddress: EthereumAddress;
    }): Promise<Result<TileDocument, string>> {
        return await this.creatDeterministic(input.data, {
            family: "capTable",
            tags: [input.capTableAddress, input.capTableRegistryAddress],
        });
    }

    async creatDeterministic<T>(content: T, metadata: TileMetadataArgs): Promise<Result<TileDocument, string>> {
        try {
            // REVIEW: Dont know, aobut this delete metadata.schema, but il let it stand here and take a look at it later.
            const schemaId = metadata.schema ? metadata.schema : undefined;
            if (schemaId) {
                metadata.schema = undefined;
            }
            if (!this.did) {
                return err("DID is not set, you must set DID to craete on Ceramic.");
            }
            const deterministic = await TileDocument.deterministic<T>(this, {
                ...metadata,
                controllers: [this.did.id],
            });
            await deterministic.update(content, { schema: schemaId });
            return ok(deterministic);
        } catch (error) {
            CeramicSDK.logger(error);
            CeramicSDK.logger("content", content);
            CeramicSDK.logger("metadata", metadata);
            return err("Could not create deterministic document on Ceramic");
        }
    }

    private async createDocument(input: {
        data: Record<string, Shareholder | unknown>;
        schema?: string;
        controllers?: string[];
    }): Promise<Result<TileDocument, string>> {
        try {
            const { data, schema, controllers } = {
                controllers: [],
                ...input,
            };
            const document = await TileDocument.create(
                this,
                {
                    ...data,
                },
                {
                    schema,
                    controllers,
                },
                {
                    pin: true,
                }
            );
            return ok(document);
        } catch (error) {
            CeramicSDK.logger(error);
            CeramicSDK.logger("input was", input);
            return err("Could not create document on Ceramic");
        }
    }
}
