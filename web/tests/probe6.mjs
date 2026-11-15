// Sonda de QA: coste del posprocesado. Compara ms por cuadro con calidad alta (efectos) y baja (sin efectos).
import { chromium } from "@playwright/test";
const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const frameMs = (page) => page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => (++n < 120 ? requestAnimationFrame(f) : res(((performance.now() - t0) / 120).toFixed(1))); requestAnimationFrame(f); }));
for (const round of [1, 2, 3]) for (const fx of ["1", "0"]) {
  const quality = "high";
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((q) => localStorage.setItem("fif:prefs:v1", JSON.stringify({ quality: q, welcomed: true })), quality);
  const page = await ctx.newPage();
  const res = [];
  for (const [url, ignite] of [["/?fx=" + fx, false], ["/modulos/rover?view=cabina&mat=pmma&fx=" + fx, true]]) {
    await page.goto(base + url, { waitUntil: "load" });
    await page.waitForTimeout(9000);
    if (ignite) { await page.getByRole("button", { name: /ENCENDER|IGNITE/i }).click(); await page.waitForTimeout(5000); }
    res.push(await frameMs(page));
  }
  console.log(`ronda ${round} · efectos ${fx}: inicio ${res[0]} ms · cabina con fuego ${res[1]} ms`);
  await ctx.close();
}
console.log(await (async () => { const p = await browser.newPage(); await p.goto("chrome://gpu"); await p.waitForTimeout(1500); const t = await p.evaluate(() => document.body.innerText); await p.close(); return (t.match(/GL_RENDERER[^\n]*/) || ["?"])[0].slice(0, 160); })());
await browser.close();
