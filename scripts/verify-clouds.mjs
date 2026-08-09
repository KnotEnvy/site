/**
 * Headless-Chromium verification for the FOREGROUND CLOUD RUSH layer.
 *
 * The 8-depth verify-visuals sweep samples the descent far too coarsely to say
 * anything about the near-field cloud layer: between two of its stops the whole
 * field has streamed past the lens several times over, so consecutive shots
 * look unrelated and "is it actually rushing toward the camera?" is unanswerable.
 * (Exactly the blind spot that let the Chapter 03 contrast bug ship — see
 * criticalLessons #1 and #13, and scripts/verify-chapters.mjs.)
 *
 * Two passes:
 *   RUSH  — fine-grained scroll steps through the Heaven zone. Flip through the
 *           PNGs in order: puffs should grow and slide outward from the centre
 *           frame to frame. That IS the effect; there is no way to assert it.
 *   DRIFT — the same scroll position sampled over time, to prove the canvas is
 *           actually animating rather than parked on one frozen frame. This one
 *           IS asserted: byte-identical frames mean a dead render loop.
 *
 * Usage: node scripts/verify-clouds.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-clouds");

/** Fine steps through the Heaven zone, where the field is densest. */
const RUSH = [0, 0.012, 0.024, 0.036, 0.048, 0.06];
/** Scroll depth held constant while sampling the idle drift. */
const DRIFT_AT = 0.02;
const DRIFT_FRAMES = 3;
const DRIFT_GAP = 1200; // ms between drift samples

function findChrome() {
  const cache = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
  const dirs = fs
    .readdirSync(cache)
    .filter((d) => d.startsWith("chromium-"))
    .sort()
    .reverse();
  for (const d of dirs) {
    for (const sub of ["chrome-win64", "chrome-win"]) {
      const exe = path.join(cache, d, sub, "chrome.exe");
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error("No ms-playwright Chromium found. Run: npx playwright install chromium");
}

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--use-angle=d3d11", "--enable-gpu"],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];
page.on("console", (m) => {
  const text = m.text();
  // The THREE.Clock deprecation is a known-benign drei/three internal.
  if (m.type() === "error" && !/THREE\.Clock/.test(text)) {
    problems.push(`[${m.type()}] ${text.slice(0, 300)}`);
  }
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));

fs.mkdirSync(OUT, { recursive: true });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 20000 }).catch(() => {
  problems.push("[verify] NO CANVAS FOUND within 20s");
});
await page.waitForTimeout(4000); // WebGL warmup

const scrollTo = (d) =>
  page.evaluate((depth) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * depth, behavior: "instant" });
  }, d);

// --- RUSH: does the field advance toward the lens as you scroll? ------------
console.log("--- rush (flip through these in order) ---");
for (const depth of RUSH) {
  await scrollTo(depth);
  await page.waitForTimeout(2200); // camera damping settles
  const name = `rush-${String(depth).replace(".", "_")}.png`;
  await page.screenshot({ path: path.join(OUT, name) });
  console.log(`shot ${name}`);
}

// --- DRIFT: is the render loop alive at a standstill? -----------------------
console.log("\n--- idle drift at a fixed scroll position ---");
await scrollTo(DRIFT_AT);
await page.waitForTimeout(2500);

const frames = [];
for (let i = 0; i < DRIFT_FRAMES; i++) {
  const name = `drift-${i}.png`;
  const buf = await page.screenshot({ path: path.join(OUT, name) });
  frames.push(buf);
  console.log(`shot ${name} (${buf.length} b)`);
  if (i < DRIFT_FRAMES - 1) await page.waitForTimeout(DRIFT_GAP);
}

let frozen = 0;
for (let i = 1; i < frames.length; i++) {
  if (frames[i].equals(frames[i - 1])) frozen++;
}
if (frozen) {
  problems.push(
    `[verify] ${frozen} of ${frames.length - 1} consecutive drift frames were BYTE-IDENTICAL ` +
      `— the canvas is not animating at a standstill (dead render loop, or the ` +
      `idle drift was lost).`
  );
} else {
  console.log(`drift: all ${frames.length} frames differ — render loop is live.`);
}

await browser.close();

if (problems.length) {
  console.log("\nPROBLEMS FOUND:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\ncloud pass: clean. Now LOOK at the rush-*.png sequence.");
