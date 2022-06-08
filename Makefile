
### Deploy configs
redisImage=redis:6-alpine
redisName=symfoni_redis
ceramicName=symfoni_ceramic
postgresName=symfoni_postgres
graphName=symfoni_graph
demoServerName=brok-demo-server
demoFrontendName=brok-demo-frontend
ENV?=dev

# Shamelessly stolen from https://www.freecodecamp.org/news/self-documenting-makefile
help: ## Show this help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: enviroment install redis-start postgres-start ## setup the dev enviroment

enviroment: ## setup enviorment files
	test -f packages/demo-server/.env || cp packages/demo-server/.env.example packages/demo-server/.env
	test -f packages/demo-frontend/.env || cp packages/demo-frontend/.env.example packages/demo-frontend/.env
	test -f packages/captable/.env || cp packages/captable/.env.example packages/captable/.env

start: ## start local dev enviroment
	pnpm -r --parallel start

install: ## install monorepo and package dependencies
	pnpm install

build: build-contracts build-sdk ## build the app

build-contracts: ## build the contracts
	pnpm --stream --filter @brok/captable build

build-sdk: ## build the sdk
	pnpm --stream --filter @brok/sdk build

clean: redis-stop postgres-stop graph-stop clean-node-modules## removes everything

clean-node-modules: ## clean node_modules TODO
	rm -rf packages/**/node_modules && rm -rf node_modules

redis-start: ## starts redis docker container for local development
	docker run --rm --name $(redisName) -d -p 6379:6379 $(redisImage) || true
	$(log_end)

redis-stop: ## stops the redis container
	docker stop $(redisName) || true

ceramic-start: ## starts a localy ceramic node on Ropsten clay testnetwork
	docker compose -p ${ceramicName} -f ops/docker/cermaic-claynet-ropsten.yml up -d || true

ceramic-stop: ## stops the ceramic node
	docker compose -p ${ceramicName} -f ops/docker/cermaic-claynet-ropsten.yml down -v || true

postgres-start: ## starts postgres docker container for local development
	docker run --rm --name ${postgresName} -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -p 5433:5432 -d postgres
	sleep 5
	pnpm -F @brok/demo-server init:db
	@echo "migrated"
	$(log_end)

postgres-stop: ## stops the postgres db
	docker stop $(postgresName) || true

graph-start: ## spins up graph docker and deploys it
	docker compose -p ${graphName} -f ops/docker/the-graph.yml up -d
	echo "Waiting 40s for graph to start"
	sleep 40
	pnpm --stream --filter @brok/graph deploy:brokLocal

graph-stop: ## stops the ceramic node
	docker compose -p ${graphName} -f ops/docker/the-graph.yml down -v 
	rm -rf ops/docker/data

demo-data: ## spins up graph docker and deploys it
	pnpm --filter @brok/captable --stream demo 