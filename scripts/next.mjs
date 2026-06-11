import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const command = process.argv[2];

if (!command || !["dev", "build", "start"].includes(command)) {
  process.stderr.write("Usage: node scripts/next.mjs <dev|build|start>\n");
  process.exit(1);
}

const projectRoot = process.cwd();
const distDir = command === "dev" ? ".next" : ".next-build";
const outputDirsToClean = command === "dev"
  ? [".next"]
  : command === "build"
    ? [".next-build"]
    : [];

for (const dir of outputDirsToClean) {
  fs.rmSync(path.join(projectRoot, dir), { recursive: true, force: true });
}

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", command === "start" ? "start" : command],
  {
    stdio: "inherit",
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_DIST_DIR: distDir,
    },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
