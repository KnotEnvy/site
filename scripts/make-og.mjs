/**
 * Captures the social share images straight from the living site:
 *   public/og.jpg        1200x630  (OpenGraph / Twitter summary_large_image)
 *   public/og-square.jpg 1080x1080 (square variant for socials)
 *
 * Hides fixed chrome (header, descent rail, scroll cue) so the card is just
 * the headline over the living sky. Re-run after any hero/sky redesign.
 *
 * Usage: node scripts/make-og.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";

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

const HIDE_CHROME = `
  header { display: none !important; }
  .fixed.right-5 { display: none !important; }          /* DescentRail */
  [aria-hidden="true"].absolute.bottom-5 { display: none !important; } /* scroll cue */
  nextjs-portal { display: none !important; }           /* dev-tools badge */
  #top div.mt-16 { display: none !important; }          /* intro card rail */
`;

/* The wide card clips the hero paragraph mid-line; headline-only reads better. */
const HIDE_PARAGRAPH = `
  #top div.mt-8.max-w-xl { display: none !important; }
`;

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--use-angle=d3d11", "--enable-gpu"],
});

async function capture(width, height, file, extraCss = "") {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForTimeout(6000); // sky warmup: clouds + sun + bloom settle
  await page.addStyleTag({ content: HIDE_CHROME + extraCss });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(process.cwd(), "public", file),
    type: "jpeg",
    quality: 88,
  });
  await page.close();
  console.log(`captured public/${file} (${width}x${height})`);
}

await capture(1200, 630, "og.jpg", HIDE_PARAGRAPH);
await capture(1080, 1080, "og-square.jpg");
await browser.close();
