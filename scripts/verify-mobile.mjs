/**
 * Mobile / real-world audit against a live (or local) URL.
 *
 * Emulates a phone (iPhone-class viewport + touch + deviceScaleFactor), loads
 * the site, checks for horizontal overflow at several scroll depths, measures
 * whether the WebGL canvas actually painted, flags console errors, and
 * screenshots each depth. Also does one desktop pass for comparison.
 *
 * Usage: node scripts/verify-mobile.mjs <baseUrl> [outDir]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-mobile");

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

async function audit(label, contextOpts, depths) {
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message.slice(0, 200)}`));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(5000); // sky warmup

  const vw = contextOpts.viewport.width;
  const canvasPainted = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return "NO CANVAS";
    const r = c.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? `canvas ${Math.round(r.width)}x${Math.round(r.height)}` : "canvas 0-size";
  });

  const overflows = [];
  for (const d of depths) {
    await page.evaluate((dd) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * dd, behavior: "instant" });
    }, d);
    await page.waitForTimeout(2200);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scrollW > vw + 1) overflows.push(`depth ${d}: scrollWidth ${scrollW} > viewport ${vw}`);
    await page.screenshot({ path: path.join(OUT, `${label}-d${String(d).replace(".", "_")}.png`) });
  }

  // Find any element wider than the viewport (the usual overflow culprit).
  const widest = await page.evaluate((vwidth) => {
    const bad = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width > vwidth + 1 && r.right > vwidth + 1) {
        bad.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} w=${Math.round(r.width)}`);
      }
    }
    return [...new Set(bad)].slice(0, 6);
  }, vw);

  await context.close();
  console.log(`\n[${label}] ${canvasPainted}`);
  console.log(`[${label}] horizontal overflow: ${overflows.length ? "\n  " + overflows.join("\n  ") : "none"}`);
  console.log(`[${label}] elements wider than viewport: ${widest.length ? "\n  " + widest.join("\n  ") : "none"}`);
  console.log(`[${label}] console errors: ${errors.length ? "\n  " + [...new Set(errors)].join("\n  ") : "none"}`);
  return { errors, overflows, widest };
}

fs.mkdirSync(OUT, { recursive: true });
const depths = [0, 0.25, 0.55, 0.85, 1];

await audit(
  "mobile",
  {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  depths
);

await audit("desktop", { viewport: { width: 1440, height: 900 } }, [0, 0.5, 1]);

await browser.close();
console.log("\ndone.");
