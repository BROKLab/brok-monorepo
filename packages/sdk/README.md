# BRØK SDK

## Use it

```npm i @brok/sdk```


```pnpm i -D @ceramicnetwork/http-client@^2.3.1 @ceramicnetwork/3id-did-resolver@^2.1.4 @ceramicnetwork/common@^2.4.0 @ceramicnetwork/stream-tile@^2.4.0 dids@^3.2.0 did-resolver@^4.0.0 ethers@^5.6.9 neverthrow@^4.3.1 node-fetch@^2.6.7 debug@^4.3.4```

Example

```ts
    const sdk = await SDK.init({
      ceramicUrl: "https://ceramic-clay.3boxlabs.com",
      ethereumRpc: "https://arbitrum-rinkeby.infura.io/v3/0771265f174543dca52bbe282a69397d",
      seed: "test test test test test test test test test test test junk",
      theGraphUrl: "https://api.thegraph.com/subgraphs/name/broklab/captable_dev_10"
    })
    const list = await sdk.listCapTables()
    if(list.isOk()){
      console.log(`List has ${list.value.capTables.length} items` )
      console.log(`Names ${list.value.capTables.map(capTable => capTable.name).join(", ")}` )
    }
    ```