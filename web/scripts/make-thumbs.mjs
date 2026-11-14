// Genera las miniaturas de /modulos a partir de la propia plataforma en marcha.
// Uso: npm run dev (en otra terminal) y luego: node scripts/make-thumbs.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.env.BASE ?? "http://localhost:3000";
const SCENES = { home: "/", nave: "/modulos/nave", estacion: "/modulos/estacion", rover: "/modulos/rover", base: "/modulos/base" };
const SCREENS = { lab: "/laboratorio", radar: "/radar", earth: "/tierra" };
const HIDE = "header, nav, main, aside, [role=status], [class*=dock], [class*=vignette], [class*=toast] { visibility: hidden !important; }";

const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const shoot = async (name, route, hideUi) => {
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(9000);
  if (hideUi) await page.addStyleTag({ content: HIDE });
  await page.waitForTimeout(400);
  const png = await page.screenshot();
  await sharp(png).resize(720, 450, { fit: "cover" }).webp({ quality: 78 }).toFile(`public/img/card-${name}.webp`);
  console.log("ok", name);
};
for (const [name, route] of Object.entries(SCENES)) await shoot(name, route, true);
for (const [name, route] of Object.entries(SCREENS)) await shoot(name, route, false);
await browser.close();
