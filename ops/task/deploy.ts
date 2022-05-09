import { sh, help } from 'tasksfile';
import dedent from 'dedent';

help(destroy, 'Fulle destroys all deployed heroku apps for env', {
  params: ['env'],
  examples: dedent`
    pnpx task deploy:destroy dev
  `,
});
function destroy(options: unknown, env: string) {
  if (!env) throw new Error('env is required');
  destroyFrontend({}, env);
  destroyServer({}, env);
}

function destroyFrontend(options: unknown, env: string) {
  if (!env) throw new Error('env is required');
  sh(`pnpm heroku apps:destroy -a ${frontendApp(env)} --confirm ${frontendApp(env)}`);
}
function destroyServer(options: unknown, env: string) {
  if (!env) throw new Error('env is required');
  sh(`pnpm heroku apps:destroy -a ${serverApp(env)} --confirm ${serverApp(env)}`);
}

function deployAll(options: unknown, env: string) {
  if (!env) throw new Error('env is required');
  frontend({ t: false }, env);
  server({ t: false }, env);
  graph({}, env);
}

help(frontend, 'Deploys frontend to Heroku', {
  params: ['env'],
  options: {
    t: 'Start taling server logs after deployment',
  },
});
function frontend(options: { t?: boolean }, env: string) {
  const graphURL = 'https://api.thegraph.com/subgraphs/name/broklab/captable_ENV_10'.replace('ENV', env);
  const demoServerURL = 'https://brok-demo-server-ENV.herokuapp.com'.replace('ENV', env);
  sh(`# pnpm publish --filter @brok/sdk --access public --dry`);
  sh(`pnpm heroku apps:create ${frontendApp(env)} -t brok --region eu`);
  sh(`pnpm heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack.git -a ${frontendApp(env)}`);
  sh(`pnpm heroku buildpacks:add https://github.com/unfold/heroku-buildpack-pnpm -a ${frontendApp(env)}`);
  sh(`pnpm heroku buildpacks:add heroku-community/static -a ${frontendApp(env)}`);
  sh(`pnpm heroku config:set PROJECT_PATH=packages/demo-frontend -a ${frontendApp(env)}`);
  sh(`pnpm heroku config:set NPM_CONFIG_PRODUCTION=false -a ${frontendApp(env)}`);
  sh(`pnpm heroku config:set NODE_ENV=production -a ${frontendApp(env)}`);
  sh(`pnpm heroku config:set REACT_APP_USE_LOCAL_ENVIROMENT=false -a ${frontendApp(env)}`);
  sh(`pnpm heroku config:set REACT_APP_BROK_SERVER=${demoServerURL} -a ${frontendApp(env)}`);
  sh(`pnpm heroku config:set REACT_APP_BROK_CAPTABLE_GRAPHQL=${graphURL} -a ${frontendApp(env)}`);
  if (env === 'dev') {
    sh(`pnpm heroku pipelines:create ${process.env.DEMO_FRONTEND_PIPELINE} -t brok -s ${herokuStage(env)} -a ${frontendApp(env)}`);
  } else {
    sh(`pnpm heroku pipelines:add ${process.env.DEMO_FRONTEND_PIPELINE} -s ${herokuStage(env)} -a ${frontendApp(env)}`);
  }
  sh(`# DOWN IN HEROKU https://status.heroku.com/ pnpm heroku pipelines:connect demo-frontend -r BROKLab/brok-monorepo`);
  sh(`pnpm heroku git:remote --remote ${frontendApp(env)} -a ${frontendApp(env)}`);
  sh(`git push ${frontendApp(env)} ${env}:main`, {
    nopipe: true,
    async: false,
  });
  if (options.t) {
    sh(`pnpm heroku logs -a ${frontendApp(env)} -t`, {
      nopipe: true,
      async: false,
    });
  }
}

help(server, 'Deploys server to Heroku', {
  params: ['env'],
  options: {
    t: 'Start taling server logs after deployment',
    waitRedis:
      'Wait for redis to be ready, default is true. Takes some time, but does not require you to restart server to propegate redis into the server when its ready. ',
  },
});
function server(options: { t?: boolean; waitRedis?: boolean }, env: string) {
  const graphURL = 'https://api.thegraph.com/subgraphs/name/broklab/captable_ENV_10'.replace('ENV', env);
  options.waitRedis = options.waitRedis === undefined ? true : false;
  sh(`# pnpm publish --filter @brok/sdk --access public --dry`);
  sh(`pnpm heroku apps:create ${serverApp(env)} -t brok --region eu`);
  sh(`pnpm heroku buildpacks:add heroku/nodejs -a ${serverApp(env)}`);
  sh(`pnpm heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack.git -a ${serverApp(env)}`);
  sh(`pnpm heroku buildpacks:add https://github.com/unfold/heroku-buildpack-pnpm -a ${serverApp(env)}`);
  sh(`pnpm heroku addons:create heroku-postgresql:${postgresPlan(env)} --wait -a ${serverApp(env)}`);
  if (options.waitRedis) {
    sh(`echo 'waiting for redis, this can take some time (5min maybe)'`);
    sh(`pnpm heroku addons:create heroku-redis:${redisPlan(env)} --wait -a ${serverApp(env)}`);
  } else {
    sh(`pnpm heroku addons:create heroku-redis:${redisPlan(env)} -a ${serverApp(env)}`);
  }
  sh(`pnpm heroku config:set PROJECT_PATH=packages/demo-server -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set NPM_CONFIG_PRODUCTION=false -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set NODE_ENV=production -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set CERAMIC_URL=${process.env.CERAMIC_URL} -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set SEED="${process.env.SEED}" -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set ETHEREUM_RPC=${process.env.ETHEREUM_RPC} -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set THE_GRAPH_URL=${graphURL} -a ${serverApp(env)}`);
  sh(`pnpm heroku config:set BROK_ENVIRONMENT=${brokEnv(env)} -a ${serverApp(env)}`);
  if (env === 'dev') {
    sh(`pnpm heroku pipelines:create ${process.env.DEMO_SERVER_PIPELINE} -t brok -s ${herokuStage(env)} -a ${serverApp(env)}`);
  } else {
    sh(`pnpm heroku pipelines:add ${process.env.DEMO_SERVER_PIPELINE} -s ${herokuStage(env)} -a ${serverApp(env)}`);
  }
  sh(`# DOWN IN HEROKU https://status.heroku.com/ pnpm heroku pipelines:connect demo-frontend -r BROKLab/brok-monorepo`);
  sh(`pnpm heroku git:remote --remote ${serverApp(env)} -a ${serverApp(env)}`);
  sh(`git push ${serverApp(env)} ${env}:main`, {
    nopipe: true,
    async: false,
  });
  if (options.t) {
    sh(`pnpm heroku logs -a ${serverApp(env)} -t`, {
      nopipe: true,
      async: false,
    });
  }
}

help(graph, 'Deploys graph to Graph hosted services', {
  params: ['env'],
});
function graph(options: unknown, env: string) {
  if (env === 'dev') {
    sh(`pnpm --filter @brok/graph deploy:brokDev`, {
      async: false,
      nopipe: true,
    });
  } else if (env === 'stage') {
    sh(`pnpm --filter @brok/graph deploy:brokStage`, {
      async: false,
      nopipe: true,
    });
  } else if (env === 'prod') {
    sh(`pnpm --filter @brok/graph deploy:brokProd`, {
      async: false,
      nopipe: true,
    });
  } else {
    throw Error(`Unknown env ${env}`);
  }
}

// helpers

function postgresPlan(env: string) {
  if (env === 'dev') return 'hobby-dev';
  if (env === 'stage') return 'hobby-dev';
  if (env === 'prod') return 'hobby-basic';
  throw new Error('env is not valid');
}
function redisPlan(env: string) {
  if (env === 'dev') return 'hobby-dev';
  if (env === 'stage') return 'hobby-dev';
  if (env === 'prod') return 'premium-0';
  throw new Error('env is not valid');
}
function brokEnv(env: string) {
  if (env === 'dev') return 'brokDev';
  if (env === 'stage') return 'brokStage';
  if (env === 'prod') return 'brokProd';
  throw new Error('env is not valid');
}
function herokuStage(env: string) {
  if (env === 'dev') return 'development';
  if (env === 'prod') return 'production';
  if (env === 'stage') return 'staging';
  throw new Error('env is not valid');
}
export function frontendApp(env: string) {
  return `${process.env.DEMO_FRONTEND_NAME}-${env}`;
}

export function serverApp(env: string) {
  return `${process.env.DEMO_SERVER_NAME}-${env}`;
}

export default {
  default: deployAll,
  graph,
  server,
  frontend,
  destroy: {
    default: destroy,
    frontend: destroyFrontend,
    server: destroyServer,
  },
};
