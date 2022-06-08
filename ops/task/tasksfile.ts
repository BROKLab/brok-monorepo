import { cli, sh, help as cliHelp } from 'tasksfile';
import { config } from 'dotenv';
config();
import deploy from './deploy';
import publish from './publish';
import build from './build';
import log from './log';
import utils from './utils';

cliHelp(help, "Show this help");

function help() {
  sh('pnpx task --help', {
    nopipe: true,
    async: false,
  });
}

cli({
  default: help,
  help,
  deploy,
  publish,
  build,
  log,
  utils
})
