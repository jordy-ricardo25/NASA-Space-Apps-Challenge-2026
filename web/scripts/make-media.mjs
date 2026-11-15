/**
 * Capturas de la plataforma en marcha para compartir el proyecto:
 *
 *   npm run media            (con "npm run dev" o "npm run start" en el puerto 3000)
 *
 * - src/app/opengraph-image.jpg y twitter-image.jpg: la vista previa que se
 *   ve al compartir el enlace (1200 × 630), con el inicio de fondo y el título.
 * - ../docs/media/*.jpg: capturas de 1440 × 900 para el README del repositorio.
 *
 * Usa el Chrome instalado (GPU real) y la interfaz en inglés.
 */
import { chromium } from "@playwright/test";
import { copyFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://localhost:3000";
const MEDIA = "../docs/media";
/** ONLY=cabin,home limita las capturas del README; ONLY=og hace solo la vista previa. */
const ONLY = process.env.ONLY?.split(",");
const SHOTS = [
  ["home", "/", 9000],
  ["challenge", "/reto", 4000],
  ["modules", "/modulos", 5000],
  ["cabin", "/modulos/marte?view=cabina", 9000],
  ["laboratory", "/laboratorio", 6000],
  ["guide", "/guia", 4000],
  ["radar", "/radar", 4000],
];

mkdirSync(MEDIA, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=default", "--enable-gpu", "--ignore-gpu-blocklist"] });

/** Página con la interfaz en inglés, sin el indicador de desarrollo de Next. */
async function open(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    localStorage.setItem("fif:prefs:v1", JSON.stringify({ lang: "en", welcomed: true, autoSpeak: false }));
    const style = document.createElement("style");
    style.textContent = "nextjs-portal{display:none!important}";
    document.addEventListener("DOMContentLoaded", () => document.head.append(style));
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForFunction(() => !document.querySelector("[role=status][data-phase]"), null, { timeout: 90000 });
  return page;
}

const save = (png, file, quality = 84) => sharp(png).jpeg({ quality, mozjpeg: true }).toFile(file);

// ── Capturas del README ──────────────────────────────────────────────────────
const page = await open(1440, 900);
for (const [name, route, wait] of SHOTS.filter(([n]) => !ONLY || ONLY.includes(n))) {
  await page.goto(BASE + route, { waitUntil: "load" });
  // Cada carga pasa por la pantalla inicial: se espera a que se retire.
  await page.waitForFunction(() => !document.querySelector("[role=status][data-phase]"), null, { timeout: 90000 });
  await page.waitForTimeout(wait);
  // En la cabina se enciende la muestra para que se vea la llama.
  if (name === "cabin") {
    await page.getByRole("button", { name: /IGNITE|ENCENDER/i }).click();
    await page.waitForTimeout(7000);
  }
  await save(await page.screenshot(), `${MEDIA}/${name}.jpg`);
  console.log(`✓ ${MEDIA}/${name}.jpg`);
}
await page.context().close();

// ── Vista previa al compartir (Open Graph) ───────────────────────────────────
if (ONLY && !ONLY.includes("og")) {
  await browser.close();
  process.exit(0);
}
const og = await open(1200, 630);
await og.waitForTimeout(9000);
await og.evaluate(() => {
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:0 64px 54px;background:linear-gradient(180deg,rgba(3,10,20,.15) 0%,rgba(3,10,20,.35) 45%,rgba(3,10,20,.94) 100%);font-family:var(--font-display);color:#eaf3f8";
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;font:600 17px var(--font-display);letter-spacing:.3em;color:#35d8f2">NASA SPACE APPS CHALLENGE 2026</div>
    <div style="font:700 74px/1 var(--font-display);letter-spacing:.12em;text-shadow:0 0 40px rgba(53,216,242,.5)">FLAME IN FREEFALL</div>
    <div style="font:500 27px/1.3 var(--font-body);color:#a9c3d6;max-width:900px">Fire-safety command center for spacecraft, stations, rovers and bases on the Moon and Mars</div>
    <div style="display:flex;align-items:center;gap:12px;margin-top:10px;font:600 19px var(--font-display);letter-spacing:.2em">
      <span style="width:40px;height:36px;background:#eaf3f8;-webkit-mask:url(/img/andora-mark.png) center/contain no-repeat;mask:url(/img/andora-mark.png) center/contain no-repeat"></span>
      BY ANDORA LABS
    </div>`;
  // Fuera la interfaz: queda el mundo 3D de fondo.
  document.querySelectorAll("header, nav, [class*=dock], [class*=hud], [class*=Hud]").forEach((n) => (n.style.visibility = "hidden"));
  document.body.append(el);
});
await og.waitForTimeout(800);
await save(await og.screenshot(), "src/app/opengraph-image.jpg", 88);
copyFileSync("src/app/opengraph-image.jpg", "src/app/twitter-image.jpg");
copyFileSync("src/app/opengraph-image.jpg", `${MEDIA}/banner.jpg`);
console.log("✓ src/app/opengraph-image.jpg, twitter-image.jpg y banner del README");
await browser.close();
