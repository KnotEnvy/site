import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-rails");

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
const consoleLines = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleLines.push(`[error] ${m.text()}`);
});
page.on("pageerror", (e) => consoleLines.push(`[pageerror] ${e.message}`));

fs.mkdirSync(OUT, { recursive: true });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

// Center each vault's rail and screenshot it (thumbnails must be visible).
const rails = await page.locator('[role="region"][aria-label$=" videos"]').all();
console.log(`found ${rails.length} video rails`);
for (let i = 0; i < rails.length; i++) {
  await rails[i].scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -150));
  await page.waitForTimeout(2500); // reveals + image decode
  await page.screenshot({ path: path.join(OUT, `rail-${i}.png`) });
  console.log(`shot rail-${i}.png`);
}

// Open the first card's lightbox and confirm the YouTube iframe mounts.
const firstCard = page.locator('[role="region"][aria-label$=" videos"] button').first();
await rails[0].scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
await firstCard.click();
await page.waitForTimeout(2500);
const iframeSrc = await page.locator('iframe[src*="youtube.com/embed"]').getAttribute("src").catch(() => null);
console.log(`lightbox iframe: ${iframeSrc ?? "NOT FOUND"}`);
await page.screenshot({ path: path.join(OUT, "lightbox.png") });
await page.keyboard.press("Escape");
await page.waitForTimeout(800);
const stillOpen = await page.locator('iframe[src*="youtube.com/embed"]').count();
console.log(`after Esc, iframes on page: ${stillOpen}`);

await browser.close();
console.log(consoleLines.length ? consoleLines.join("\n") : "(console errors: none)");
