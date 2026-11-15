// Sonda de QA: recorrido de Flamey que navega y chat que sigue a la persona.
// node tests/probe7.mjs <salida>
import { chromium } from "@playwright/test";
const out = process.argv[2];
const base = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const problems = [];
const watch = (page) => {
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
};
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "OK  " : "FALLA"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) problems.push(`falla: ${name}`);
};

// 1. Recorrido: cada paso abre su pantalla.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.goto(base + "/", { waitUntil: "commit" });
  const tour = page.getByRole("dialog");
  await tour.waitFor({ timeout: 60000 });
  const visited = [];
  for (let step = 1; step <= 6; step += 1) {
    await tour.getByText(`${step}/6`).waitFor({ timeout: 15000 });
    // Cada paso espera su pantalla (en desarrollo, la primera visita a una ruta tarda en compilar).
    const expected = ["/", "/reto", "/modulos", "/laboratorio", "/guia", "/"][step - 1];
    await page.waitForFunction((path) => location.pathname === path, expected, { timeout: 30000 }).catch(() => undefined);
    await page.waitForTimeout(600);
    visited.push(new URL(page.url()).pathname);
    if (step === 3) await page.screenshot({ path: `${out}/tour3.png` });
    await tour.getByRole("button").first().click();
  }
  check("el recorrido navega", visited.join(" ") === "/ /reto /modulos /laboratorio /guia /", visited.join(" → "));
  await page.waitForTimeout(800);
  check("el recorrido termina y no vuelve", (await tour.count()) === 0 && new URL(page.url()).pathname === "/");
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth);
  check("sin desplazamiento de página", !overflow);
  await page.close();
}

// 2. Chat: hallazgo fijado, filas de respaldo, preguntas rápidas y conversación que se conserva.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => localStorage.setItem("fif:prefs:v1", JSON.stringify({ welcomed: true, toured: true, autoSpeak: false })));
  const page = await context.newPage();
  watch(page);
  await page.goto(base + "/guia?tab=psi&env=base", { waitUntil: "commit" });
  const askButton = page.getByRole("button", { name: /Preguntar a Flamey sobre/ }).first();
  await askButton.waitFor({ timeout: 60000 });
  await page.waitForTimeout(3000);
  await askButton.click();
  const chat = page.getByRole("complementary", { name: "Asistente Flamey" });
  await chat.getByText("Datos de NASA PSI").first().waitFor({ timeout: 40000 });
  check("el hallazgo queda fijado", (await chat.getByText("Hallazgo:").count()) === 1);
  check("la explicación se pide una sola vez", (await chat.locator("details").count()) === 1);
  const rows = chat.locator("details").first();
  check("la respuesta trae filas del CSV", (await rows.count()) === 1, await rows.locator("summary").innerText());
  await rows.locator("summary").click();
  check("las filas se despliegan", (await rows.locator("li").count()) > 0, `${await rows.locator("li").count()} filas`);
  const quick = chat.getByRole("button", { name: "¿Qué falta por verificar?" });
  check("hay preguntas del hallazgo", (await quick.count()) === 1);
  await quick.click();
  await chat.getByText("Datos de NASA PSI").nth(1).waitFor({ timeout: 40000 });
  check("no quedan asteriscos a la vista", !(await chat.innerText()).includes("**"));
  await page.screenshot({ path: `${out}/chat-hallazgo.png` });

  // Cerrar, ir al Laboratorio por la barra lateral y volver a abrir.
  await page.keyboard.press("Escape");
  check("Escape cierra el chat", (await chat.count()) === 0);
  await page.getByRole("link", { name: "Laboratorio" }).first().click();
  await page.waitForURL("**/laboratorio**", { timeout: 20000 });
  await page.waitForTimeout(2500);
  await page.keyboard.press("/");
  await chat.waitFor({ timeout: 10000 });
  check("la conversación se conserva", (await chat.getByText("Datos de NASA PSI").count()) === 2);
  const head = await chat.locator("header").innerText();
  check("Flamey ve el escenario del Laboratorio", head.includes("Viendo"), head.replace(/\s+/g, " "));
  await chat.getByRole("button", { name: "Quitar el hallazgo y preguntar en general" }).click();
  const burn = chat.getByRole("button", { name: /^¿Arde / });
  check("pregunta por el material del escenario", (await burn.count()) >= 1, (await burn.first().innerText().catch(() => "")) || "");
  await burn.first().click();
  await chat.getByText("Calculado por el modelo").first().waitFor({ timeout: 40000 });
  check("responde con el motor físico", true);
  await page.screenshot({ path: `${out}/chat-laboratorio.png` });
  await chat.getByRole("button", { name: "Empezar una conversación nueva" }).click();
  check("conversación nueva la vacía", (await chat.getByText("Datos de NASA PSI").count()) === 0);
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth);
  check("sin desplazamiento de página", !overflow);
  await context.close();
}

console.log(problems.join("\n") || "sin errores");
await browser.close();
process.exit(problems.length ? 1 : 0);
