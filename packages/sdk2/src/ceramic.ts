import { CeramicClient } from "@ceramicnetwork/http-client";

export class CeramicSDK extends CeramicClient {
    constructor(public readonly ceramicUrl: string) {
        super(ceramicUrl);
    }
}
