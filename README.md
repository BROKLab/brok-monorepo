![Downloads](https://img.shields.io/npm/dw/@brok/sdk?label=Downloads)
![Issues](https://img.shields.io/github/issues/BROKLab/brok-monorepo)

[Documentation](https://demo-docs-site.onrender.com/sdk-documentation)
# About
BRØK SDK is a browser and node library to manage cap tables within the BRØK ecosystem.

Cap tables consist of "immutable" data like transactions and balances, handled on a blockchain. It also consist of more personal information about the owner, which is handled on Ceramic. You can interact with your assets throught a wallet (some signing functionality). There are also some services to make data more indexable and quikly accessible. All this is packaged in this library for easier access.

# Getting started

Install library from [npm](https://www.npmjs.com/package/@brok/sdk)

```npm i @brok/sdk```

... or yarn
```yarn add @brok/sdk```

... or pnpm
`pnpm i @brok/sdk`

Then init the SDK

```ts
  const sdk = await SDK.init({
    ceramicUrl: 'https://ceramic-clay.3boxlabs.com',
    ethereumRpc: 'https://goerli-rollup.arbitrum.io/rpc',
    secret: 'test test test test test test test test test test test junk',
    theGraphUrl:
      'https://api.thegraph.com/subgraphs/name/broklab/captable_dev_11',
    env: 'brokDev',
  });
```
Read more about inputs to init SDK in [documentation](https://demo-docs-site.onrender.com/sdk-documentation)

You can see examples here:

- [browser example nextjs](https://stackblitz.com/edit/nextjs-j6bqhx?file=pages%2Findex.js)
- [server example nodejs](https://stackblitz.com/edit/node-bzd6sj?file=index.js)


# Instances
You can read current deployments from [npm captable](https://www.npmjs.com/package/@brok/captable)

CapTableRegistry.sol

- dev brokDEV: `0xaC7349fc43fEc778f1FA2475b3F850Ca17163557`
- stage brokStage: `0x5f97A62c01FAe8280344ec7Eb505ADf8397D9a1C`
- prod brokProd: `0x4e33Adb3A77B5685E351A61f6bFb20d9dfF71E76`

Blockchain index [TheGraph](https://api.thegraph.com/subgraphs/name/broklab/captable_dev_11)


# Development on SDK
Clone repo

Run `pnpm i`

To clean everything up. Run `make clean`
## Requirements

- [docker](https://docs.docker.com/get-docker/)
- [pnpm](https://pnpm.io/installation) 
- [Docker Compose](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)
- [Node](https://nodejs.org/en/blog/release/v16.14.2/)
- [make](https://opensource.com/article/18/8/what-how-makefile) (get started with makefile [mac](https://formulae.brew.sh/formula/make), [win](https://stackoverflow.com/questions/32127524/how-to-install-and-use-make-in-windows) ) (Optional)
Clone repo

### 👩‍💻 Running locally with VSCode tasks (preferred) 
In VScode, run task `dev`  ( ⇧⌘B workbench.action.tasks.runTask).  

This will fire up all projects in watch mode so you can develop and experience imdiate results (hopefully across pacakges).
The graph takes some time to start. Once it is started it will keep running in docker as long as your captable contracts terminal is running.
![terminal_tabs](screenshot/terminal_tabs.png)


## Deployments
Release packages of SDK and CapTable (you can choose what to publish update on with changeset)
```
pnpm changeset
pnpm changeset version
pnpm install
# commit the changes, need to update lockfiles.
pnpm publish -r
```

### Deploy TheGraphCapTable service

Make sure @brok/graph package is useing desired @brok/captable version in package.json

```bash
pnpm --filter @brok/graph deploy:brokDev # deploy:brokLocal deploy:brokStage deploy:brokProd
```

### Deploy frontends and servers

Will deploy by instructions of render.yaml file. 

## Packages
- SDK [NPM](https://www.npmjs.com/package/@brok/sdk)
- Captable [NPM](https://www.npmjs.com/package/@brok/captable)

So SDK and Captable are NPM packages that needs to be published for changes to propegate. 
Graph, demo-server and demo-frontend needs to be deployed to their enviroments to progegate changes.


## Environment variables

The main enviorment variables that you need to familirize with:
- An Etehreum RPC (We recommend [alchemyapi.io](https://dashboard.alchemyapi.io/) or [Infura](https://infura.io/))
- A ceramic node [https://ceramic.network/](https://ceramic.network/)
- An Ethereum secret (seed phrase). You can generate one with [Ethers](https://docs.ethers.io/v5/)
- The Graph API indexing captable contracts [thegraph.com](https://thegraph.com/en/)

### Environment setup
1. Copy .env.example to .env in packages/captable, packages/demo-frontend and packages/demo-server. There is a make command for this.
1. Get yourself an Ethereum RPC and Ethereum secret and put these into /.env and ./packages/captable/.env
1. Then you should be able to generate the SDK for any chain.

SDK will look for environment variable BROK_ENVIRONMENT to determine which contracts to choose. Set this envrioment in your runtime.
- local localhost - Will use local blockchain
- dev brokDev - Will use Arbitrum Goerli
- stage brokStage - Will use Arbitrum Goerli
- prod brokProd - Will use Arbitrum mainnet (not currently)

To create an approved CapTable, the wallet for fagsystem must first be authorized by BRREG. Contact us.
## Ugly hacks
- If the blockchain node (running inside the captable contracts terminal) is killed, the graph node will stop indexing. To fire it up again run `make graph-stop` then `make graph-start`.
- Problems with Key DID provider secp256k1 so we are deriving ED25519 from secp256k1 private key.



# Windows
Before install replace the following scripts in packages/captable/package.json
```
"prebuild": "if not exist tasksCopy mkdir tasksCopy & copy /Y tasks\\* tasksCopy & rmdir /Q /S tasks & mkdir tasks & type nul > tasks\\index.ts",
"postbuild": "xcopy /Y tasksCopy\\* tasks & rmdir /Q /S tasksCopy".
```