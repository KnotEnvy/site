/**
 * Headless-Chromium visual verification (see handoff.json -> verification).
 *
 * Scrolls the live site to fixed depths on a real GPU (ANGLE d3d11), waits for
 * camera damping, screenshots each stop, and dumps console errors/warnings.
 * LOOK at the screenshots — "serves HTTP 200" is not verification.
 *
 * Usage: node scripts/verify-visuals.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify");
const DEPTHS = [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 1];

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
const consoleLines = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    consoleLines.push(`[${m.type()}] ${m.text()}`);
  }
});
page.on("pageerror", (e) => consoleLines.push(`[pageerror] ${e.message}`));

fs.mkdirSync(OUT, { recursive: true });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 20000 }).catch(() => {
  consoleLines.push("[verify] NO CANVAS FOUND within 20s");
});
await page.waitForTimeout(4000); // WebGL warmup

for (const depth of DEPTHS) {
  await page.evaluate((d) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * d, behavior: "instant" });
  }, depth);
  await page.waitForTimeout(3000); // camera damping + reveals
  const name = `depth-${String(depth).replace(".", "_")}.png`;
  await page.screenshot({ path: path.join(OUT, name) });
  console.log(`shot ${name}`);
}

await browser.close();

const report = consoleLines.length ? consoleLines.join("\n") : "(console clean)";
fs.writeFileSync(path.join(OUT, "console.txt"), report);
console.log("\n--- console errors/warnings ---\n" + report);
