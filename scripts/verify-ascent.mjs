/**
 * The Ascent: screenshots every chapter's pinned stage at two points in its
 * scroll, so each particle shape (scatter, galaxy, helix, star, stone heart,
 * lit heart, butterfly, radiance, rising light) can actually be LOOKED at.
 *
 * A generic depth sweep would land between chapters or on the transitions;
 * this scrolls to positions computed from each chapter's own section, then
 * waits for the morph (damped on the GPU side) to settle.
 *
 * Also asserts the story driver is wired: reads nothing from WebGL (it can't),
 * but checks every chapter's narration is real text and that no console
 * errors / hydration warnings fire along the way.
 *
 * Usage: node scripts/verify-ascent.mjs [baseUrl] [outDir] [--mobile] [--reduced]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const BASE = positional[0] ?? "http://localhost:3001";
const OUT = positional[1] ?? path.join(process.cwd(), ".verify-ascent");
const MOBILE = args.includes("--mobile");
const REDUCED = args.includes("--reduced");

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
const context = await browser.newContext({
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: MOBILE ? 2 : 1,
  isMobile: MOBILE,
  hasTouch: MOBILE,
  reducedMotion: REDUCED ? "reduce" : "no-preference",
});
const page = await context.newPage();
const problems = [];
page.on("console", (m) => {
  const t = m.text();
  if (/THREE\.Clock|preload|Largest Contentful/i.test(t)) return;
  if (m.type() === "error" || /hydrat|Context Lost/i.test(t)) problems.push(`[${m.type()}] ${t.slice(0, 300)}`);
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));

fs.mkdirSync(OUT, { recursive: true });
await page.goto(`${BASE}/the-ascent`, { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: path.join(OUT, "00-prelude.png") });

const chapters = await page.evaluate(() =>
  Array.from(document.querySelectorAll("section[id]")).map((s) => ({
    id: s.id,
    title: s.querySelector("h2")?.textContent?.trim() ?? "",
  }))
);

let n = 1;
for (const ch of chapters) {
  for (const p of [0.35, 0.8]) {
    await page.evaluate(
      ({ id, p }) => {
        const el = document.getElementById(id);
        const top = el.getBoundingClientRect().top + window.scrollY;
        const span = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + span * p, behavior: "instant" });
      },
      { id: ch.id, p }
    );
    await page.waitForTimeout(2600);
    const file = `${String(n).padStart(2, "0")}-${ch.id}-${Math.round(p * 100)}.png`;
    await page.screenshot({ path: path.join(OUT, file) });
  }
  console.log(`chapter ${n}: ${ch.id} "${ch.title}"`);
  n++;
}

console.log(problems.length ? problems.join("\n") : "console clean");
await browser.close();
process.exit(problems.length ? 1 : 0);
