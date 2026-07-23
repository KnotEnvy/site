/**
 * Reduced-motion pass: emulates prefers-reduced-motion (the stakeholder's own
 * machine has it ON), loads the page, screenshots a few depths, and fails
 * loudly on hydration mismatches or console errors.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-reduced");

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
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});

const problems = [];
page.on("console", (m) => {
  const text = m.text();
  if (m.type() === "error" || /hydrat/i.test(text)) {
    problems.push(`[${m.type()}] ${text.slice(0, 300)}`);
  }
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));

fs.mkdirSync(OUT, { recursive: true });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4000);

for (const depth of [0, 0.3, 0.55, 0.8]) {
  await page.evaluate((d) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * d, behavior: "instant" });
  }, depth);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, `rm-depth-${String(depth).replace(".", "_")}.png`) });
  console.log(`shot rm-depth-${depth}`);
}

await browser.close();
if (problems.length) {
  console.log("\nPROBLEMS FOUND:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nreduced-motion pass: clean (no hydration mismatches, no console errors)");
