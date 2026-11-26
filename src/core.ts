// Everything that needs the heavy libraries (sharp, Playwright, tesseract.js): the stages that
// render and measure. Built on its own (dist/core.mjs) and loaded only when a stage runs, so the
// plugin's hook and MCP server start before those libraries are installed.
import { closeBrowser } from "./render.ts";
import { closeRemotion } from "./remotion.ts";
import { closeOcr } from "./lettering.ts";

export { runCheck, runLock, runOptions, runPreview, runVideoCheck, runVideoLock, runVideoOptions, runVideoPreview, type StageResult } from "./stages.ts";

/** Closes the browser, the Remotion bundle server and the OCR worker. */
export async function closeAll(): Promise<void> {
  await Promise.all([closeBrowser(), closeRemotion(), closeOcr()]);
}
