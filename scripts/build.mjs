// Builds the Claude Code plugin's two files in claude-plugin/attentry-design/dist/:
//   attentry-design.mjs  the hook, the MCP server and setup (src/plugin.ts), no heavy libraries
//   core.mjs             the stages (src/core.ts), loaded when a stage runs
// sharp, playwright-core and tesseract.js stay outside both (native code, a browser driver, OCR
// workers and data): the plugin's package.json pins them and they're installed at run time.
// Both files are committed, since a plugin installed from GitHub gets the repo as it is.
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(root, "claude-plugin/attentry-design");
const external = ["sharp", "playwright-core", "tesseract.js", "@tesseract.js-data/eng"];

// The plugin must install the same versions the tests ran against.
const ours = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).dependencies;
const theirs = JSON.parse(readFileSync(join(plugin, "package.json"), "utf8")).dependencies;
for (const name of external) {
  if (ours[name] !== theirs[name]) throw new Error(`${name} is ${ours[name]} here but ${theirs[name]} in the plugin's package.json: make them the same and run npm install --package-lock-only --ignore-scripts there.`);
}

const common = {
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external,
  legalComments: "none",
  banner: {
    js: [
      "#!/usr/bin/env node",
      // Bundled CommonJS packages call require(): give ESM one.
      "import { createRequire as __adRequire } from 'node:module'; const require = __adRequire(import.meta.url);",
    ].join("\n"),
  },
};

// --check: build in memory and fail if the committed files differ (a test runs this, so the plugin
// on GitHub can't fall behind the source).
const check = process.argv.includes("--check");
const stale = [];
for (const [entry, out] of [["src/plugin.ts", "dist/attentry-design.mjs"], ["src/core.ts", "dist/core.mjs"]]) {
  const outfile = join(plugin, out);
  const result = await build({ ...common, entryPoints: [join(root, entry)], outfile, write: !check });
  if (check && (!existsSync(outfile) || !Buffer.from(result.outputFiles[0].contents).equals(readFileSync(outfile)))) stale.push(out);
}
if (stale.length) {
  console.error(`The plugin's ${stale.join(" and ")} ${stale.length === 1 ? "is" : "are"} out of date with the source: run npm run build and commit.`);
  process.exitCode = 1;
}
