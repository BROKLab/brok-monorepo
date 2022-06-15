import { sh, help} from "tasksfile";
import dedent from "dedent";
import {  config } from "dotenv";
import build from "./build";
config()

help(prepare, "publish packages with changes", {
  examples: dedent`
    pnpm task publish:all
  `
})
function prepare() {
    // build.default()
    sh(`pnpm changeset`, {
        async: false,
        nopipe: true,
    })
    sh(`pnpm changeset version`,{
        async: false,
        nopipe: true
    })
    sh(`git push --follow-tags`, {
        async: false,
        nopipe: true
    })
    sh(`echo "You should commit & push changes to git. Then run pnpm task publish:commit"`)
}

function commit() {
    sh(`pnpm publish -r`, {
        async: false,
        nopipe: true
    })
    sh(`echo "You should commit & push changes to git. Then run make pnpm task deploy:all [ENV]"`)
}

function sdk() {
    sh(`pnpm --filter @brok/sdk publish`, {
        async: false,
        nopipe: true
    })
}

function captable() {
    sh(`pnpm --filter @brok/captable publish`, {
        async: false,
        nopipe: true
    })
}
export default {
    default : prepare,
    commit,
    sdk,
    captable,
}