/** Screenshots the 404 page so it is never shipped sight-unseen. */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-404");

function findChrome() {
  const cache = path.join(os.homedir(), "AppData", "Local", "ms-playwright");
  const dirs = fs.readdirSync(cache).filter((d) => d.startsWith("chromium-")).sort().reverse();
  for (const d of dirs) {
    for (const sub of ["chrome-win64", "chrome-win"]) {
      const exe = path.join(cache, d, sub, "chrome.exe");
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error("No ms-playwright Chromium found");
}

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--use-angle=d3d11", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
fs.mkdirSync(OUT, { recursive: true });

const res = await page.goto(`${BASE}/no-such-page`, { waitUntil: "networkidle", timeout: 60000 });
console.log(`HTTP status: ${res?.status()} (expected 404)`);
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(OUT, "not-found.png") });
console.log("shot not-found.png");
await browser.close();
