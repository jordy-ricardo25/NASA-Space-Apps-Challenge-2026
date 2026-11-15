// Sonda de QA: pestaña "Materiales" de Flamey (prueba de un material en un ambiente).
// node tests/probe8.mjs <salida>
import { chromium } from "@playwright/test";
const out = process.argv[2];
const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const problems = [];
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "OK  " : "FALLA"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) problems.push(`falla: ${name}`);
};

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => localStorage.setItem("fif:prefs:v1", JSON.stringify({ welcomed: true, toured: true, autoSpeak: false })));
const page = await context.newPage();
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

await page.goto(base + "/modulos", { waitUntil: "commit" });
await page.getByRole("button", { name: "Asistente Flamey" }).waitFor({ timeout: 60000 });
await page.waitForTimeout(4000);
await page.keyboard.press("/");
const chat = page.getByRole("complementary", { name: "Asistente Flamey" });
await chat.waitFor({ timeout: 10000 });
await chat.getByRole("tab", { name: "Materiales" }).click();
const panel = chat.getByRole("tabpanel");
const result = panel.locator("section");
const settled = async () => {
  await page.waitForTimeout(400);
  await panel.locator('section[aria-busy="false"]').waitFor({ timeout: 15000 });
};
await settled();

// Parte de la base lunar con PMMA.
check("arranca en base lunar con PMMA", (await panel.getByRole("button", { name: "BASE · LUNA" }).getAttribute("aria-pressed")) === "true" && (await panel.getByRole("button", { name: "PMMA", exact: true }).getAttribute("aria-pressed")) === "true");
const first = await result.innerText();
check("da frontera, margen y evidencia", /Frontera/i.test(first) && /Margen/i.test(first), first.replace(/\s+/g, " ").slice(0, 150));
check("muestra el modelo del backend aparte", /emberwatch/.test(first), (first.match(/emberwatch[^\n]*\n?[^\n]*/) ?? [""])[0].replace(/\s+/g, " "));
await page.screenshot({ path: `${out}/material-base.png` });

// Cambiar de ambiente cambia la atmósfera y el resultado.
await panel.getByRole("button", { name: "ESTACIÓN" }).click();
await settled();
const station = await result.innerText();
check("la estación cambia el resultado", station !== first && (await panel.getByText("21 % O₂").count()) > 0, (await result.locator("h3").innerText()));

// Subir el oxígeno en vivo.
const o2 = panel.getByRole("slider").first();
await o2.focus();
for (let i = 0; i < 30; i += 1) await page.keyboard.press("ArrowRight");
await settled();
const richer = await result.innerText();
check("mover el oxígeno recalcula", richer !== station, (await result.locator("h3").innerText()));

// Material que solo tiene el backend: sin evidencia, nunca en verde.
await panel.getByRole("button", { name: "Teflón" }).click();
await settled();
check("material sin fuente queda sin evidencia", (await result.getAttribute("data-level")) === "none" && /Sin evidencia/.test(await result.innerText()));
await page.screenshot({ path: `${out}/material-teflon.png` });

// Explicación de Flamey con el escenario probado.
await panel.getByRole("button", { name: "PMMA", exact: true }).click();
await settled();
await panel.getByRole("button", { name: "Que Flamey lo explique" }).click();
await chat.getByText("Calculado por el modelo").first().waitFor({ timeout: 40000 });
const answer = await chat.innerText();
check("Flamey explica el escenario probado", /PMMA/.test(answer) && (await chat.getByRole("tab", { name: "Conversación" }).getAttribute("aria-selected")) === "true");
await page.screenshot({ path: `${out}/material-explicado.png` });

// Al volver, la pestaña conserva lo elegido.
await chat.getByRole("tab", { name: "Materiales" }).click();
check("la pestaña conserva lo elegido", (await panel.getByRole("button", { name: "ESTACIÓN" }).getAttribute("aria-pressed")) === "true" && (await panel.getByText("51 % O₂").count()) > 0);

// Otro material, por escrito.
await panel.getByRole("textbox", { name: "Otro material" }).fill("velcro");
await panel.getByRole("button", { name: "Preguntar a Flamey por ese material" }).click();
await chat.getByText(/velcro/).first().waitFor({ timeout: 10000 });
await page.waitForFunction(() => !document.querySelector('[class*="typing"]'), null, { timeout: 40000 });
check("un material escrito va a la conversación", (await chat.getByText(/velcro/).count()) >= 1);

// Enlace al Laboratorio con el mismo escenario.
await chat.getByRole("tab", { name: "Materiales" }).click();
const href = await panel.getByRole("link", { name: "Abrir en el Laboratorio" }).getAttribute("href");
check("enlaza al Laboratorio con el escenario", href === "/laboratorio?env=estacion&mat=pmma&o2=51&p=101.3", href ?? "");
const overflow = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth);
check("sin desplazamiento de página", !overflow);

console.log(problems.join("\n") || "sin errores");
await browser.close();
process.exit(problems.length ? 1 : 0);
