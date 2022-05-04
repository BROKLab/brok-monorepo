import { sh, help} from "tasksfile";
import dedent from "dedent";
import {  config } from "dotenv";
config()

help(all, "builds everything", {
  examples: dedent`
    pnpx task publish:all
  `
})
 function all() {
    captable()
    sdk()
}

 function sdk() {
    sh(`pnpm --stream --filter @brok/sdk build`,  {
        nopipe: true,
        async: false
      })
}
 function captable() {
    sh(`pnpm --stream --filter @brok/captable build`,  {
        nopipe: true,
        async: false
      })
}

export default {
    default: all,
    sdk,
    captable,
}