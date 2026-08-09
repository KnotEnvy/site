/**
 * Headless-Chromium verification for the SCROLL CHOREOGRAPHY: the directional
 * `.reveal` entrances, the reversible `.is-leaving` exits, and the
 * RevealController safety net.
 *
 * Four things no other script in this repo can see:
 *
 *  1) ARMED-AFTER-FALLBACK. RevealController used to mark every `.reveal`
 *     visible 2.5s after mount, which silently killed scroll reveals for the
 *     whole page below the fold — the page looked static and no harness
 *     noticed, because every other script screenshots long after things settle.
 *     We wait past that window and ASSERT below-fold blocks are still armed.
 *
 *  2) MID-FLIGHT ENTRANCES. Everything else shoots after a 3s settle, by which
 *     time transforms have completed and the direction is invisible. Here each
 *     section is caught ~220ms after it enters.
 *
 *  3) EXITS FIRE. Scroll deep and assert blocks above have picked up
 *     `is-leaving`, with a frame to look at.
 *
 *  4) EXITS REVERSE. Scroll back and assert `is-leaving` is released. A
 *     one-way exit would strand content invisible on the way back up — the
 *     single worst failure this feature could ship.
 *
 * Usage: node scripts/verify-choreo.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3001";
const OUT = process.argv[3] ?? path.join(process.cwd(), ".verify-choreo");
const SECTIONS = ["purpose", "playlists", "bibles"];

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
  if ((m.type() === "error" || /hydrat/i.test(text)) && !/THREE\.Clock/.test(text)) {
    problems.push(`[${m.type()}] ${text.slice(0, 300)}`);
  }
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));

const counts = () =>
  page.evaluate(() => {
    const all = Array.from(document.querySelectorAll(".reveal"));
    return {
      total: all.length,
      pending: all.filter((el) => !el.classList.contains("is-visible")).length,
      leaving: all.filter((el) => el.classList.contains("is-leaving")).length,
      ready: document.documentElement.classList.contains("reveal-ready"),
    };
  });

const scrollToFraction = (fr) =>
  page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * f, behavior: "instant" });
  }, fr);

fs.mkdirSync(OUT, { recursive: true });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector("canvas", { timeout: 20000 }).catch(() => {
  problems.push("[verify] NO CANVAS FOUND within 20s");
});

// --- 1. still armed after the safety-net window ----------------------------
await page.waitForTimeout(5000);
const armed = await counts();
console.log(
  `reveal-ready=${armed.ready}  total=${armed.total}  still-pending after 5s=${armed.pending}`
);
if (!armed.ready) problems.push("[verify] html.reveal-ready was never armed — reveals are inert.");
if (armed.pending === 0) {
  problems.push(
    "[verify] every .reveal was already is-visible 5s after load with NO scrolling — " +
      "the blanket safety net is firing again, so nothing below the fold can ever " +
      "animate in. This is the regression verify-choreo exists to catch."
  );
}

// --- 2. mid-flight entrances ------------------------------------------------
for (const id of SECTIONS) {
  const found = await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return false;
    window.scrollTo({ top: el.offsetTop - window.innerHeight * 0.55, behavior: "instant" });
    return true;
  }, id);
  if (!found) {
    problems.push(`[verify] section #${id} not found`);
    continue;
  }
  await page.waitForTimeout(220);
  await page.screenshot({ path: path.join(OUT, `${id}-midflight.png`) });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, `${id}-settled.png`) });
  console.log(`shot ${id}-midflight.png + ${id}-settled.png`);
}

// --- 3. exits fire ----------------------------------------------------------
await scrollToFraction(0.45);
await page.waitForTimeout(900);
const mid = await counts();
console.log(`at 45% depth: leaving=${mid.leaving}`);
await page.screenshot({ path: path.join(OUT, "exit-active.png") });
if (mid.leaving === 0) {
  problems.push(
    "[verify] no .reveal carried is-leaving at 45% scroll depth — exit choreography " +
      "is not firing (check the exitIO rootMargin in RevealController)."
  );
}

// --- 4. exits reverse -------------------------------------------------------
await scrollToFraction(0);
await page.waitForTimeout(1200);
const back = await counts();
console.log(`back at top: leaving=${back.leaving}`);
if (back.leaving !== 0) {
  problems.push(
    `[verify] ${back.leaving} block(s) still carry is-leaving after scrolling back to the ` +
      "top — the exit is one-way and would strand content invisible on the way up."
  );
}
await page.screenshot({ path: path.join(OUT, "exit-reversed.png") });

await browser.close();

if (problems.length) {
  console.log("\nPROBLEMS FOUND:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nchoreo pass: clean. LOOK at the *-midflight.png and exit-active.png frames.");
