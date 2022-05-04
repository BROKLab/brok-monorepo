import { sh } from "tasksfile"
import { frontendApp, serverApp } from "./deploy"

function serverLogs(options : {t?: boolean}, env: string) {
    env = env || 'dev'
    sh(`pnpm heroku logs -a ${serverApp(env)} -t`, {
      nopipe: true,
      async: false
    })
  }
  function frontendLogs(options : {t?: boolean}, env: string) {
    env = env || 'dev'
    sh(`pnpm heroku logs -a ${frontendApp(env)} -t`, {
      nopipe: true,
      async: false
    })
  }

  export default {
      server: serverLogs,
      frontend: frontendLogs,
  }