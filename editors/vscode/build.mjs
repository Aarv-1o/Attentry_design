// Builds the extension (dist/extension.js) and the plugin marketplace it carries (claude/): the
// repo's Claude Code plugin as committed, which Connect installs into Claude Code.
import { build } from "esbuild";
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "../..");
const claude = join(here, "claude");

await rm(join(here, "dist"), { recursive: true, force: true });
await build({ entryPoints: [join(here, "src/extension.ts")], outfile: join(here, "dist/extension.js"), bundle: true, platform: "node", format: "cjs", target: "node20", external: ["vscode"] });

await rm(claude, { recursive: true, force: true });
// node_modules stays out: Claude Code installs the libraries from the plugin's lockfile.
await cp(join(repo, "claude-plugin/attentry-design"), join(claude, "attentry-design"), { recursive: true, filter: (src) => !src.includes("node_modules") });
await mkdir(join(claude, ".claude-plugin"), { recursive: true });
// The repo's marketplace, with the plugin's path as it is inside claude/.
const market = JSON.parse(await readFile(join(repo, ".claude-plugin/marketplace.json"), "utf8"));
market.plugins = market.plugins.map((p) => ({ ...p, source: "./attentry-design" }));
await writeFile(join(claude, ".claude-plugin/marketplace.json"), `${JSON.stringify(market, null, 2)}\n`);

// The store wants a PNG icon and the package its own license.
await sharp(join(here, "resources/tile.svg")).resize(256, 256).png().toFile(join(here, "dist/icon.png"));
await copyFile(join(repo, "LICENSE"), join(here, "LICENSE"));
