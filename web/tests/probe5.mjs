// Sonda de QA: aspecto y fluidez (ms por cuadro) con el posprocesado. node tests/probe5.mjs <salida>
import { chromium } from "@playwright/test";
const out = process.argv[2];
const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];
page.on("console", (m) => m.type() === "error" && problems.push(m.text().slice(0, 400)));
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
const frameMs = () => page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => (++n < 90 ? requestAnimationFrame(f) : res(((performance.now() - t0) / 90).toFixed(1))); requestAnimationFrame(f); }));
for (const [name, url, ignite] of [["fx_home", "/", false], ["fx_base", "/modulos/base", false], ["fx_rover_fire", "/modulos/rover?view=cabina&mat=pmma", true], ["fx_iss_drop", "/modulos/estacion?view=cabina&mat=heptane", true], ["fx_suit", "/modulos/traje?view=cabina", true]]) {
  await page.goto(base + url, { waitUntil: "load" });
  await page.waitForTimeout(9000);
  if (ignite) { await page.getByRole("button", { name: /ENCENDER|IGNITE/i }).click(); await page.waitForTimeout(6000); }
  console.log(name, "ms/cuadro:", await frameMs());
  await page.screenshot({ path: `${out}/${name}.png` });
}
console.log(problems.join("\n") || "sin errores");
await browser.close();
