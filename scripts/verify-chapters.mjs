/**
 * Chapter-interstitial legibility check (ScrollQuote).
 *
 * The stakeholder reported Chapter 03 ("The Warning") as low-visibility: its
 * words dim to a floor opacity while it scrolls, and it sits on the brightest
 * part of the ember sky. The 8-depth sweep in verify-visuals.mjs does not land
 * on the interstitials, so this script scrolls each one into reading position,
 * screenshots it, and reports the DIMMEST word opacity actually rendered.
 *
 * Usage: node scripts/verify-chapters.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-chapters");

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

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" || /hydrat/i.test(m.text())) errors.push(`[${m.type()}] ${m.text()}`);
});

await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const count = await page.locator("blockquote").count();
console.log(`found ${count} chapter interstitials`);

let worst = 1;
for (let i = 0; i < count; i++) {
  // Reading position: the block centred in the viewport.
  await page.evaluate((idx) => {
    document
      .querySelectorAll("blockquote")[idx]
      ?.scrollIntoView({ block: "center", behavior: "instant" });
  }, i);
  await page.waitForTimeout(1500);

  const info = await page.evaluate((idx) => {
    const bq = document.querySelectorAll("blockquote")[idx];
    if (!bq) return null;
    const spans = [...bq.querySelectorAll("span[style]")];
    const ops = spans
      .map((s) => parseFloat(getComputedStyle(s).opacity))
      .filter((n) => Number.isFinite(n));
    const kicker = bq.parentElement?.querySelector("p")?.textContent?.trim() ?? "(no kicker)";
    return {
      kicker,
      words: ops.length,
      min: ops.length ? Math.min(...ops) : null,
      max: ops.length ? Math.max(...ops) : null,
      fontSize: getComputedStyle(bq).fontSize,
    };
  }, i);

  const name = `chapter-${i + 1}.png`;
  await page.screenshot({ path: path.join(OUT, name) });
  if (info?.min != null) worst = Math.min(worst, info.min);
  console.log(
    `${name} | ${info?.kicker} | ${info?.words} words | opacity ${info?.min}–${info?.max} | ${info?.fontSize}`
  );
}

console.log(`\ndimmest word opacity rendered anywhere: ${worst}`);
if (errors.length) {
  console.log("\n--- console errors / hydration ---");
  errors.forEach((e) => console.log(e));
}

await browser.close();
if (errors.length) process.exit(1);
