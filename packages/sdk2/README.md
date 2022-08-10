# BRØK SDK

## Use it

```npm i @brok/sdk @ceramicnetwork/http-client```

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