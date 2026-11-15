// Genera las miniaturas de /modulos a partir de la propia plataforma en marcha.
// Uso: npm run dev (en otra terminal) y luego: node scripts/make-thumbs.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.env.BASE ?? "http://localhost:3000";
const SCENES = { home: "/", nave: "/modulos/nave", estacion: "/modulos/estacion", rover: "/modulos/rover", traje: "/modulos/traje", base: "/modulos/base", marte: "/modulos/marte" };
const SCREENS = { guide: "/guia", lab: "/laboratorio", radar: "/radar", earth: "/tierra" };
const HIDE = "header, nav, main, aside, [role=status], [class*=dock], [class*=vignette], [class*=toast] { visibility: hidden !important; }";

const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const shoot = async (name, route, hideUi) => {
  await page.goto(base + route, { waitUntil: "load" });
  // La pantalla de carga (sello y viaje) debe haberse retirado antes de capturar.
  await page.waitForFunction(() => !document.querySelector("[role=status][data-phase]"), null, { timeout: 90000 });
  await page.waitForTimeout(7000);
  if (hideUi) await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(400);
  const png = await page.screenshot();
  await sharp(png).resize(720, 450, { fit: "cover" }).webp({ quality: 78 }).toFile(`public/img/card-${name}.webp`);
  console.log("ok", name);
};
// ONLY=base,marte limita las miniaturas que se regeneran.
const only = process.env.ONLY?.split(",");
const wanted = (entries) => Object.entries(entries).filter(([name]) => !only || only.includes(name));
for (const [name, route] of wanted(SCENES)) await shoot(name, route, true);
for (const [name, route] of wanted(SCREENS)) await shoot(name, route, false);
await browser.close();
