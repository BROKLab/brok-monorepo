import { SDK, CapTableGraphQL, CapTable, TransferInput, TransferRequest, OperationResult, Shareholder } from "@brok/sdk";

export const getCapTables = async (skip?: number, limit?: number): Promise<CapTableGraphQL[]> => {
  const sdk = await initSDK();
  return await sdk.getCapTableList(skip, limit);
}

export const getCapTable = async (capTableAddress: string): Promise<CapTable> => {
  const sdk = await initSDK();
  return await sdk.getCapTable(capTableAddress);
}

export const transfer = async (capTableAddress: string, transfer: TransferInput[]): Promise<(OperationResult & TransferRequest)[]> => {
  const sdk = await initSDK();
  return await sdk.transfer(capTableAddress, transfer);
}

export const updateShareholder = async (capTableAddress: string, shareholder: Partial<Shareholder>): Promise<Shareholder> => {
  const sdk = await initSDK();
  return await sdk.updateShareholder(capTableAddress,shareholder);
}



export const initSDK = async (): Promise<SDK> => {
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
  return sdk;
}

