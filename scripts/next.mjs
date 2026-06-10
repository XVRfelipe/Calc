import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const command = process.argv[2];

if (!command || !["dev", "build", "start"].includes(command)) {
  process.stderr.write("Usage: node scripts/next.mjs <dev|build|start>\n");
  process.exit(1);
}

const distDir = command === "dev" ? ".next-dev" : ".next-build";
const projectRoot = process.cwd();
const distPath = path.join(projectRoot, distDir);

if (command === "dev" || command === "build") {
  fs.rmSync(distPath, { recursive: true, force: true });
}

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", command === "start" ? "start" : command],
  {
    stdio: "inherit",
    env: { ...process.env, NEXT_DIST_DIR: distDir },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

