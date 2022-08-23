
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

dev: enviroment install ## setup the dev enviroment

enviroment: ## setup enviorment files
	test -f packages/demo-server/.env || cp packages/demo-server/.env.example packages/demo-server/.env
	test -f packages/demo-frontend/.env || cp packages/demo-frontend/.env.example packages/demo-frontend/.env
	test -f packages/captable/.env || cp packages/captable/.env.example packages/captable/.env
	test -f packages/sdk/.env || cp packages/sdk/.env.example packages/sdk/.env
	test -f .env || cp .env.example .env

clean-node-modules: ## clean node_modules TODO
	rm -rf packages/**/node_modules && rm -rf node_modules