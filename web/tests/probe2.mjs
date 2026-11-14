// Sonda de QA: arrastre 3D en el inicio y fuego en las cabinas. node tests/probe2.mjs <salida>
import { chromium } from "@playwright/test";
const out = process.argv[2];
const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text().slice(0, 400)}`));
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
const drag = async (x0, y0, x1, y1) => { await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 12 }); await page.mouse.up(); };
await page.goto(base + "/", { waitUntil: "load" });
await page.waitForTimeout(8000);
await drag(700, 400, 420, 330);
await page.mouse.wheel(0, -500);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/drag_home.png` });
for (const [name, url, t] of [["fire_base", "/modulos/base?view=cabina", 9000], ["fire_iss", "/modulos/estacion?view=cabina", 9000], ["fire_iss_drop", "/modulos/estacion?view=cabina&mat=heptane", 5000], ["fire_nave_sibal", "/modulos/nave?view=cabina&mat=sibal", 9000]]) {
  await page.goto(base + url, { waitUntil: "load" });
  await page.waitForTimeout(7500);
  await page.getByRole("button", { name: /ENCENDER|IGNITE/i }).click().catch((e) => problems.push(`${name}: sin botón de encendido (${e.message.slice(0, 80)})`));
  await page.waitForTimeout(t);
  await page.screenshot({ path: `${out}/${name}.png` });
  if (name === "fire_base") { await drag(720, 420, 560, 360); await page.waitForTimeout(1200); await page.screenshot({ path: `${out}/${name}_drag.png` }); }
}
console.log(problems.join("\n") || "sin errores");
await browser.close();
