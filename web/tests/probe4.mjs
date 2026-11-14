// Sonda de QA: panel del equipo en ES y EN a dos alturas. node tests/probe4.mjs <salida>
import { chromium } from "@playwright/test";
const out = process.argv[2];
const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
const problems = [];
for (const [w, h] of [[1917, 880], [1366, 700]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on("console", (m) => m.type() === "error" && problems.push(m.text().slice(0, 300)));
  await page.goto(base + "/mapa", { waitUntil: "load" });
  await page.waitForTimeout(7000);
  await page.getByRole("button", { name: /Equipo|Team/ }).first().click();
  await page.waitForTimeout(800);
  const panel = page.locator("aside").last();
  await panel.screenshot({ path: `${out}/team_es_${h}.png` });
  const box = await panel.evaluate((el) => [el.scrollHeight, el.clientHeight]);
  if (box[0] > box[1]) problems.push(`panel con desborde a ${w}x${h}: ${box}`);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.waitForTimeout(400);
  await panel.screenshot({ path: `${out}/team_en_${h}.png` });
  await page.close();
}
console.log(problems.join("\n") || "sin errores");
await browser.close();
