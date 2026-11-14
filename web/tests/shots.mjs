// Capturas de control de calidad: node tests/shots.mjs <salida> <ruta[@espera_ms]>...
// Usa el Chrome instalado (GPU real) y reporta errores de consola y de red.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [out, ...routes] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:3000";
const [w, h] = (process.env.SIZE ?? "1440x900").split("x").map(Number);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=default", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
const problems = [];
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
let first = true;
for (const spec of routes) {
  const [route, wait] = spec.split("@");
  await page.goto(base + route, { waitUntil: "load" });
  if (first) await page.waitForFunction(() => !document.querySelector("[role=status][class*=screen]") || document.querySelector("[class*=leaving]"), null, { timeout: 60000 }).catch(() => problems.push("boot timeout"));
  first = false;
  await page.waitForTimeout(Number(wait ?? 6500));
  const name = route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";
  await page.screenshot({ path: `${out}/${name}.png` });
  const scroll = await page.evaluate(() => [document.documentElement.scrollHeight, innerHeight, document.documentElement.scrollWidth, innerWidth]);
  if (scroll[0] > scroll[1] || scroll[2] > scroll[3]) problems.push(`scroll en ${route}: ${scroll}`);
}
console.log(problems.length ? problems.join("\n") : "sin errores");
await browser.close();
