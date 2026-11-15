/**
 * Genera los recursos de marca de Andora Labs a partir de la hoja de marca
 * (public/img/andora-labs-marca.jpg):  node scripts/make-brand.mjs
 *
 * - public/img/andora-mark.png y andora-wordmark.png: el ícono y el texto como
 *   máscaras blancas con transparencia, para pintarlos con el color del tema.
 * - src/app/icon.png y apple-icon.png: ícono del sitio (rey sobre la Luna en
 *   blanco sobre Azul Andora, #0B1F6B).
 */
import sharp from "sharp";

const SHEET = "public/img/andora-labs-marca.jpg";
const NAVY = "#0b1f6b";

/** Recorta una zona de la hoja y la convierte en blanco con alfa según la tinta. */
async function mask(region, width) {
  const ink = await sharp(SHEET).extract(region).resize({ width }).greyscale().negate().linear(1.45, -40).toColourspace("b-w").raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = ink.info;
  return sharp({ create: { width: w, height: h, channels: 3, background: "#ffffff" } }).joinChannel(ink.data, { raw: { width: w, height: h, channels: 1 } }).png();
}

const mark = await mask({ left: 228, top: 98, width: 394, height: 350 }, 788);
await mark.toFile("public/img/andora-mark.png");
const wordmark = await mask({ left: 150, top: 452, width: 552, height: 146 }, 1104);
await wordmark.toFile("public/img/andora-wordmark.png");

/** Ícono cuadrado con esquinas redondeadas. */
async function icon(size, file) {
  const inner = await sharp("public/img/andora-mark.png").resize({ width: Math.round(size * 0.72), height: Math.round(size * 0.72), fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const r = Math.round(size * 0.2);
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="${NAVY}"/></svg>`);
  await sharp(bg).composite([{ input: inner, gravity: "centre" }]).png().toFile(file);
}
await icon(192, "src/app/icon.png");
await icon(180, "src/app/apple-icon.png");
console.log("Recursos de marca generados.");
