## Development requirements

- [docker](https://docs.docker.com/get-docker/)
- [pnpm](https://pnpm.io/installation) 
- [make](https://opensource.com/article/18/8/what-how-makefile) (get started with makefile [mac](https://formulae.brew.sh/formula/make), [win](https://stackoverflow.com/questions/32127524/how-to-install-and-use-make-in-windows) )
- [Docker Compose](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)
- [Node](https://nodejs.org/en/blog/release/v16.14.2/)

## Getting started - Local development

Run `make dev`

To clean everything up. Run `make clean`

### EITHER 👩‍💻 Running locally with VSCode tasks (preferred) 
In VScode, run task `dev`  ( ⇧⌘B workbench.action.tasks.runTask). 

This will fire up all projects in watch mode so you can develop and experience imdiate results (hopefully across pacakges).
The graph takes some time to start. Once it is started it will keep running in docker as long as your captable contracts terminal is running.
![terminal_tabs](screenshot/terminal_tabs.png)
### OR 💻 Running locally with shells.

To run all services locally we need multiple services running. Take each commandline below and run it in its own shell. Start at the top and follow the order.
```bash
pnpm --filter @brok/captable start:contracts
pnpm --filter @brok/captable start:lib
pnpm ceramic daemon --debug --network inmemory
pnpm --filter @brok/sdk start
pnpm --filter @brok/demo-server start:dev
pnpm --filter @brok/demo-frontend start
make graph-stop && make graph-start
```

## Getting started - Remote development

1. Install requirements (docker, docker-compose, pnpm, make, node)
2. Get yourself an Ethereum RPC endpoint (free: [alchemy](https://www.alchemy.com/) [infura](https://infura.io/) )
3. Get yourself wallets for all enviroments (can create a wallet which contains a seed with `pnpm task utils:seed`)
4. Update .evn varibles in all packages with your endpoints and seeds.
5. Fund wallets on blockchain you are targeting.
## Deployment
- SDK [NPM](https://www.npmjs.com/package/@brok/sdk)
- Captable [NPM](https://www.npmjs.com/package/@brok/captable)
- Graph [HostedService](https://thegraph.com/hosted-service/dashboard) (connected to robertosnap account)
- demo-server [Heroku DEV](https://brok-demo-server-dev.herokuapp.com) [Heroku STAGE](https://brok-demo-server-stage.herokuapp.com) 
- demo-frontend [Heroku DEV](https://brok-demo-frontend-dev.herokuapp.com/) [Heroku STAGE](https://brok-demo-frontend-stage.herokuapp.com/)

So SDK and Captable are NPM packages that needs to be published for changes to propegate. 
Graph, demo-server and demo-frontend needs to be deployed to their enviroments to progegate changes.

```bash
build:captable
build                           - builds everything
build:sdk
deploy
deploy:destroy [env]            - Fulle destroys all deployed heroku apps for env
deploy:destroy:frontend
deploy:destroy:server
deploy:frontend [env]           - Deploys frontend to Heroku
deploy:graph [env]              - Deploys graph to Graph hosted services
deploy:logs:frontned
deploy:logs:server
deploy:server [env]             - Deploys server to Heroku
publish                         - publish packages with changes
```

### Examples
`pnpx task help` show available commands.

`pnpx task deploy dev` will deploy graph, demo-server and demo-frontend to their hosting enviroments for enviroment `dev`

`pnpx task deploy:server dev` will deploy graph to its hosting enviroments for enviroment `dev

`pnpx task publish` will publish packages wich changes (interactive) to NPM.


To be able to deploy to Heroku, NPN og The Ghrap hosted service you must have access. Request from admin.

## Environment variables

The main enviorment variables that you need to familirize with:
- An Etehreum RPC (We recommend [alchemyapi.io](https://dashboard.alchemyapi.io/) or [Infura](https://infura.io/))
- A ceramic node [https://ceramic.network/](https://ceramic.network/)
- An Ethereum secret (seed phrase). You can generate one with [Ethers](https://docs.ethers.io/v5/)
- The Graph API indexing captable contracts [thegraph.com](https://thegraph.com/en/)

### Environment setup
1. Copy .env.example to .env in packages/captable, packages/demo-frontend and packages/demo-server.
1. Get yourself an Ethereum RPC and Ethereum secret and put these into /.env and ./packages/captable/.env
1. Then you should be able to generate the SDK for any chain.

Other env variables are mostly used for deployment to remote servers.

SDK will look for environment variable BROK_ENVIRONMENT to determine which contracts to choose. Set this envrioment in your runtime.
- local brokLocal - Will use local blockchain
- dev brokDev - Will use Arbitrum Rinkeby
- stage brokStage - Will use Arbitrum Rinkeby
- prod brokProd - Will use Arbitrum mainnet

To create an approved CapTable, the wallet for fagsystem must first be authorized by BRREG. Contact us.
## Ugly hacks
- If the blockchain node (running inside the captable contracts terminal) is killed, the graph node will stop indexing. To fire it up again run `make graph-stop` then `make graph-start`.
- Tasks that errors will continue to run. Should swap out task system for something that can handle errors in shell.
- Problems with Key DID provider secp256k1 so we are deriving ED25519 from secp256k1 private key.

