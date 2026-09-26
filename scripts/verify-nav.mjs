/**
 * Client-side navigation checks - the plumbing that only exists because the
 * site now has more than one page, and that fails SILENTLY when it breaks:
 *
 *  1. The WebGL canvas survives navigation (same element, never remounted:
 *     a fresh context per page is slow and provokes context loss).
 *  2. A new page starts at the top (Lenis would otherwise keep the old
 *     page's scroll target).
 *  3. The reveal system re-arms for the new page: blocks below the fold are
 *     still ARMED (hidden, waiting), and blocks on screen are VISIBLE. Before
 *     RevealController re-armed per route, every block on a page reached by
 *     navigation stayed hidden forever.
 *  4. The menu opens as a dialog, traps focus, and closes on Escape.
 *  5. A cross-page hash link (/#playlists from another page) lands on target.
 *  6. Back restores the previous page.
 *
 * Usage: node scripts/verify-nav.mjs [baseUrl]
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

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--use-angle=d3d11", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/THREE\.Clock/.test(m.text())) errors.push(m.text().slice(0, 200));
});

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failed++;
};

const revealState = () =>
  page.evaluate(() => {
    const vh = window.innerHeight;
    const all = Array.from(document.querySelectorAll("main .reveal"));
    const onScreen = all.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.top < vh * 0.8 && r.bottom > 0;
    });
    const below = all.filter((el) => el.getBoundingClientRect().top > vh * 1.5);
    return {
      ready: document.documentElement.classList.contains("reveal-ready"),
      onScreenVisible: onScreen.filter((el) => el.classList.contains("is-visible")).length,
      onScreen: onScreen.length,
      belowArmed: below.filter((el) => !el.classList.contains("is-visible")).length,
      below: below.length,
    };
  });

await page.goto(BASE + "/", { waitUntil: "load", timeout: 120000 });
await page.waitForTimeout(6000);
await page.evaluate(() => {
  const c = document.querySelector("div.fixed.inset-0 canvas");
  if (c) c.dataset.navProbe = "original";
});

// Scroll down the home page so there is scroll state to leak.
await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.4, behavior: "instant" }));
await page.waitForTimeout(1500);

// 4. Menu dialog
await page.click('button[aria-controls="site-menu"]');
await page.waitForTimeout(900);
const dialog = await page.$('[role="dialog"][aria-modal="true"]');
check("menu opens as a modal dialog", !!dialog);
const focusInside = await page.evaluate(() => !!document.activeElement?.closest("#site-menu"));
check("focus moves into the menu", focusInside);
await page.keyboard.press("Escape");
await page.waitForTimeout(900);
check("Escape closes the menu", !(await page.$('[role="dialog"][aria-modal="true"]')));

// Navigate through the menu to The Ascent.
await page.click('button[aria-controls="site-menu"]');
await page.waitForTimeout(900);
await page.click('#site-menu a[href="/the-ascent"]');
await page.waitForURL("**/the-ascent", { timeout: 30000 });
await page.waitForTimeout(3000);

// 1. Canvas survives
const probe = await page.evaluate(() => document.querySelector("div.fixed.inset-0 canvas")?.dataset.navProbe ?? null);
check("WebGL canvas survives navigation (not remounted)", probe === "original", `probe=${probe}`);
// 2. Starts at the top
const y = await page.evaluate(() => window.scrollY);
check("new page starts at the top", y < 5, `scrollY=${y}`);
check("menu closed after navigating", !(await page.$('[role="dialog"][aria-modal="true"]')));

// 3. Reveal system re-armed on a page with reveals (/evidence)
await page.click('header nav[aria-label="Primary"] a[href="/evidence"]');
await page.waitForURL("**/evidence", { timeout: 30000 });
await page.waitForTimeout(3500);
const rs = await revealState();
check("reveal-ready re-armed", rs.ready);
check("on-screen blocks revealed", rs.onScreen > 0 && rs.onScreenVisible === rs.onScreen, `${rs.onScreenVisible}/${rs.onScreen}`);
check("below-fold blocks still armed (will animate in)", rs.below > 0 && rs.belowArmed === rs.below, `${rs.belowArmed}/${rs.below}`);
// ...and they DO reveal when scrolled to.
await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.55, behavior: "instant" }));
await page.waitForTimeout(2500);
const rs2 = await revealState();
check("blocks reveal on arrival after navigation", rs2.onScreen > 0 && rs2.onScreenVisible === rs2.onScreen, `${rs2.onScreenVisible}/${rs2.onScreen}`);

// 5. Cross-page hash link: header CTA to /#playlists
await page.click('header a[href="/#playlists"]');
await page.waitForURL("**/#playlists", { timeout: 30000 });
await page.waitForTimeout(3500);
const target = await page.evaluate(() => {
  const el = document.getElementById("playlists");
  return el ? Math.round(el.getBoundingClientRect().top) : null;
});
check("cross-page #playlists lands on the section", target !== null && Math.abs(target - 80) < 140, `top=${target}`);

// 6. Back
await page.goBack();
await page.waitForURL("**/evidence", { timeout: 30000 });
await page.waitForTimeout(2500);
check("back returns to the previous page", page.url().endsWith("/evidence"));

check("no page errors across the run", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
