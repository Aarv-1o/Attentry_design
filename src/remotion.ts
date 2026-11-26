// Reads a Remotion project's videos frame by frame: pixels and, for every frame, the text on screen
// with its color, size, opacity and box. Remotion's own render functions give pixels only, so this
// opens the project's bundle in our browser and moves through frames the way Remotion's renderer
// does (window.remotion_setBundleMode / remotion_setFrame / remotion_renderReady). Those are
// Remotion internals: if a version changes them, this says so instead of guessing.
//
// The bundle is made and served with the project's own @remotion/bundler and @remotion/renderer,
// so the project's Remotion version and license apply; Attentry Design ships no Remotion of its own.
import { createRequire } from "node:module";
import { mkdtemp, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import type { Page } from "playwright-core";
import { getBrowser, READ_DESIGN, type Box, type Rendered, type TextBox } from "./render.ts";

export interface Composition {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  serializedResolvedPropsWithCustomSchema: string;
  [key: string]: unknown;
}

export interface VideoFrame {
  frame: number;
  time: number; // seconds
  png: Buffer;
  texts: TextBox[];
  colors: string[];
  fonts: string[];
  panels: Box[];
  rings: Box[];
  images: Box[];
}

const TIMEOUT = 30_000;

interface Served {
  url: string; // where the bundle is served
  proxyPort: number; // Remotion's frame server for <OffthreadVideo>
  close: () => Promise<unknown>;
}

// entry → its server, and when its sources last changed: bundled again when they change since.
const served = new Map<string, { changed: number; server: Promise<Served> }>();

/**
 * When anything in the entry's folder last changed (a new composition, an edit). node_modules and
 * .git are skipped without being read: an entry file at a project's root sits beside them.
 */
async function lastChange(entryPoint: string): Promise<number> {
  const newest = async (folder: string): Promise<number> => {
    const entries = await readdir(folder, { withFileTypes: true });
    const times = await Promise.all(entries.map(async (e) => {
      if (e.name === "node_modules" || e.name === ".git") return 0;
      const path = join(folder, e.name);
      return e.isDirectory() ? newest(path) : (await stat(path)).mtimeMs;
    }));
    return Math.max(0, ...times);
  };
  return newest(dirname(entryPoint));
}

/**
 * Bundles the project with its own Remotion and serves the bundle with Remotion's own server, which
 * also extracts frames for <OffthreadVideo>. Slow the first time (webpack); reused after.
 */
export async function serveProject(project: string, entry: string): Promise<Served> {
  const entryPoint = resolve(project, entry);
  const changed = await lastChange(entryPoint);
  const kept = served.get(entryPoint);
  if (kept && kept.changed < changed) {
    served.delete(entryPoint); // edited since it was bundled: bundle it again
    void kept.server.then((s) => s.close(), () => undefined);
  }
  if (!served.has(entryPoint)) {
    const server = (async () => {
      // The video's own Remotion: looked up from the entry file, the way the video's code finds it,
      // so a video project inside the session's folder works; then from the session's folder.
      const found = [entryPoint, join(project, "package.json")].map((from) => {
        try {
          const require = createRequire(from);
          return { require, bundlerPath: require.resolve("@remotion/bundler") };
        } catch {
          return undefined; // no Remotion from here: try the next place
        }
      }).find(Boolean);
      if (!found) throw new Error("This project has no @remotion/bundler and @remotion/renderer. Install Remotion in it (npm i @remotion/cli).");
      const bundler: typeof import("@remotion/bundler") = found.require("@remotion/bundler");
      const renderer: typeof import("@remotion/renderer") = found.require("@remotion/renderer");
      // The video project's folder: the one whose node_modules holds its Remotion.
      const at = found.bundlerPath.lastIndexOf(`${sep}node_modules${sep}`);
      const remotionRoot = at >= 0 ? found.bundlerPath.slice(0, at) : project;
      const folder = await bundler.bundle({ entryPoint, outDir: await mkdtemp(join(tmpdir(), "attentry-design-bundle-")) });
      const server = await renderer.RenderInternals.prepareServer({
        webpackConfigOrServeUrl: folder,
        port: null,
        remotionRoot,
        offthreadVideoThreads: 2,
        logLevel: "error",
        indent: false,
        offthreadVideoCacheSizeInBytes: null,
        binariesDirectory: null,
        forceIPv4: false,
        sampleRate: 48000,
      });
      return { url: server.serveUrl, proxyPort: server.offthreadPort, close: () => server.closeServer(true) };
    })();
    // A failure isn't kept: the next call tries again, once the cause is fixed.
    server.catch(() => served.delete(entryPoint));
    served.set(entryPoint, { changed, server });
  }
  return served.get(entryPoint)!.server;
}

/** Stops every Remotion server this process started. */
export async function closeRemotion(): Promise<void> {
  const all = [...served.values()];
  served.clear();
  await Promise.all(all.map(async (s) => (await s.server.catch(() => undefined))?.close()));
}

export class RemotionProject {
  private constructor(private server: Served, private page: Page) {}

  static async open(project: string, entry: string): Promise<RemotionProject> {
    const server = await serveProject(project, entry);
    return new RemotionProject(server, await openBundle(server));
  }

  async compositions(): Promise<Composition[]> {
    await this.page.evaluate("window.remotion_setBundleMode({ type: 'evaluation' })");
    await this.ready();
    return (await this.page.evaluate("window.getStaticCompositions()")) as Composition[];
  }

  /** Reads the given frames of one composition: a screenshot and the text on screen for each. */
  async frames(composition: Composition, frames: number[]): Promise<VideoFrame[]> {
    const c = composition;
    // Remotion takes one composition per page: switching on the same page renders nothing.
    await this.page.close();
    this.page = await openBundle(this.server);
    await this.page.setViewportSize({ width: c.width, height: c.height });
    await this.page.evaluate(
      `window.remotion_setBundleMode(${JSON.stringify({
        type: "composition",
        compositionName: c.id,
        serializedResolvedPropsWithSchema: c.serializedResolvedPropsWithCustomSchema,
        compositionDurationInFrames: c.durationInFrames,
        compositionFps: c.fps,
        compositionHeight: c.height,
        compositionWidth: c.width,
        compositionDefaultCodec: c.defaultCodec,
        compositionDefaultOutName: c.defaultOutName,
        compositionDefaultVideoImageFormat: c.defaultVideoImageFormat,
        compositionDefaultPixelFormat: c.defaultPixelFormat,
        compositionDefaultProResProfile: c.defaultProResProfile,
        compositionDefaultSampleRate: c.defaultSampleRate,
      })})`,
    );
    await this.ready();
    const out: VideoFrame[] = [];
    for (const frame of frames) {
      await this.page.evaluate(`window.remotion_setFrame(${frame}, ${JSON.stringify(c.id)}, 1)`);
      await this.ready();
      await this.page.evaluate("document.fonts.ready");
      const png = await this.page.screenshot({ type: "png" });
      const read = (await this.page.evaluate(READ_DESIGN)) as Pick<Rendered, "colors" | "fonts" | "texts" | "panels" | "rings" | "images">;
      out.push({ frame, time: frame / c.fps, png, ...read });
    }
    return out;
  }

  async close(): Promise<void> {
    await this.page.close();
  }

  private async ready(): Promise<void> {
    await this.page.waitForFunction(
      "window.remotion_renderReady === true || window.remotion_cancelledError !== undefined",
      undefined,
      { timeout: TIMEOUT },
    );
    const error = await this.page.evaluate("window.remotion_cancelledError");
    if (error) throw new Error(`The video failed to render: ${String(error).split("\n")[0]}`);
  }
}

/** A page with the bundle loaded and Remotion's render globals set, as its renderer does. */
async function openBundle(server: Served): Promise<Page> {
  const page = await (await getBrowser()).newPage();
  await page.addInitScript(`
    window.remotion_puppeteerTimeout = ${TIMEOUT};
    window.remotion_isMainTab = true;
    window.remotion_mediaCacheSizeInBytes = 500000000;
    window.remotion_initialMemoryAvailable = 2000000000;
    window.remotion_sampleRate = 48000;
    window.process = window.process || {}; window.process.env = window.process.env || {};
    window.process.env.NODE_ENV = "production";
    window.remotion_broadcastChannel = new BroadcastChannel("remotion-video-frame-extraction");
    window.remotion_envVariables = "{}";
    window.remotion_inputProps = "{}";
    window.remotion_initialFrame = 0;
    window.remotion_attempt = 1;
    window.remotion_proxyPort = ${server.proxyPort};
    window.remotion_audioEnabled = false;
    window.remotion_videoEnabled = true;
    window.remotion_logLevel = "error";
  `);
  await page.goto(`${server.url}/index.html`);
  const ok = await page.evaluate("typeof window.getStaticCompositions === 'function' && typeof window.remotion_setBundleMode === 'function'");
  if (!ok) {
    await page.close();
    throw new Error("This Remotion version works differently from the ones Attentry Design knows; video checks can't run on it yet.");
  }
  return page;
}

/** Frames every `step` seconds from start to end, always including the last frame. */
export function sampleFrames(c: Composition, step: number): number[] {
  const every = Math.max(1, Math.round(step * c.fps));
  const frames: number[] = [];
  for (let f = 0; f < c.durationInFrames; f += every) frames.push(f);
  if (frames.at(-1) !== c.durationInFrames - 1) frames.push(c.durationInFrames - 1);
  return frames;
}
