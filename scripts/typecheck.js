import { spawnSync } from "node:child_process";

const configs = ["../tsconfig.app.json", "../tsconfig.node.json"];
let failed = false;

for (const config of configs) {
  const result = spawnSync("npx", ["tsc", "--noEmit", "-p", config], {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
