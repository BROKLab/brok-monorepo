import { SDK } from "@brok/sdk";

export const getCapTables = async (skip?: number, limit?: number) => {
    if (!(process.env.NEXT_PUBLIC_BROK_ENVIRONMENT &&
      process.env.NEXT_PUBLIC_CERAMIC_URL &&
      process.env.NEXT_PUBLIC_ETHEREUM_RPC &&
      process.env.NEXT_PUBLIC_THE_GRAPH_URL &&
      process.env.NEXT_PUBLIC_SECRET)) {
      throw "Please set ENV variables"
    }
    const sdk = await SDK.init({
      ceramicUrl: process.env.NEXT_PUBLIC_CERAMIC_URL, ethereumRpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
      secret: process.env.NEXT_PUBLIC_SECRET, theGraphUrl: process.env.NEXT_PUBLIC_THE_GRAPH_URL, env: process.env.NEXT_PUBLIC_BROK_ENVIRONMENT
    });
    return await sdk.getCapTableList(skip, limit);
  }
