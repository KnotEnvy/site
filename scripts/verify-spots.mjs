/** Spot-check: EvidenceStats band + lightbox title font. */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-spots");

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
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

// Stats band mid-viewport, wait for count-up to finish.
await page.evaluate(() => {
  document.querySelectorAll("#purpose p").forEach((p) => {
    if (p.textContent?.includes("unavoidable appointment")) {
      p.scrollIntoView({ block: "center", behavior: "instant" });
    }
  });
});
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(OUT, "stats.png") });
console.log("shot stats.png");

// Lightbox: open first card, check the title paragraph's computed font.
const rail = page.locator('[role="region"][aria-label$=" videos"]').first();
await rail.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await rail.locator("button").first().click();
await page.waitForTimeout(2000);
const font = await page.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  const title = dialog?.querySelector("p");
  return title ? getComputedStyle(title).fontFamily.slice(0, 60) : "NO TITLE FOUND";
});
console.log(`modal title font-family: ${font}`);
await page.screenshot({ path: path.join(OUT, "modal.png") });

// Focus trap: Tab repeatedly, focus must stay inside the dialog after each one.
// Give each keypress time to settle — focus moving into the cross-origin YouTube
// iframe is async, and asserting immediately reports a false negative. Once
// focus is on that iframe, further Tabs go to the player's own controls and the
// top-level activeElement stays the <iframe>, which is still inside the dialog.
let trapped = true;
let where = "";
for (let i = 0; i < 4; i++) {
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300);
  const state = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const a = document.activeElement;
    return {
      inside: dialog?.contains(a) ?? false,
      tag: a?.tagName ?? "null",
    };
  });
  if (!state.inside) trapped = false;
  where += `${i + 1}:${state.tag}${state.inside ? "" : "(ESCAPED)"} `;
}
console.log(`focus trapped in dialog across 4 Tabs: ${trapped}  [${where.trim()}]`);

await browser.close();
