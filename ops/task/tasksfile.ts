import { cli, sh, help as cliHelp } from 'tasksfile';
import { config } from 'dotenv';
config();
import utils from './utils';

cliHelp(help, "Show this help");

function help() {
  sh('pnpm task --help', {
    nopipe: true,
    async: false,
  });
}

cli({
  utils
})
