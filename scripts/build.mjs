// Builds Attentry Design into one file, claude-plugin/attentry-design/dist/attentry-design.mjs:
// what the plugin's hook and MCP server run (plain `node`, no TypeScript loader). sharp and
// playwright-core stay outside the bundle (native code and a browser driver); they resolve from the
// nearest node_modules. Shipping them with the plugin is the packaging step (attentry-design.md).
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

await build({
  entryPoints: [join(root, "src/cli.ts")],
  outfile: join(root, "claude-plugin/attentry-design/dist/attentry-design.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external: ["sharp", "playwright-core"],
  banner: {
    js: [
      "#!/usr/bin/env node",
      // Bundled CommonJS packages call require(): give ESM one.
      "import { createRequire as __adRequire } from 'node:module'; const require = __adRequire(import.meta.url);",
    ].join("\n"),
  },
});
