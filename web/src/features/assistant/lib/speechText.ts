import type { Lang } from "@/content/i18n";

/** Símbolos que se leen mejor como palabra. */
const WORDS: [RegExp, Record<Lang, string>][] = [
  [/CO₂/g, { es: "CO2", en: "CO2" }],
  [/ppO₂/g, { es: "presión parcial de oxígeno", en: "oxygen partial pressure" }],
  [/O₂/g, { es: "oxígeno", en: "oxygen" }],
  [/≥/g, { es: " al menos ", en: " at least " }],
  [/≤/g, { es: " como máximo ", en: " at most " }],
  [/[≈~]/g, { es: " aproximadamente ", en: " about " }],
  [/±/g, { es: " más o menos ", en: " plus or minus " }],
  [/×/g, { es: " por ", en: " times " }],
  [/[µμ]g\b/g, { es: "microgravedad", en: "microgravity" }],
  [/[µμ]/g, { es: "micro", en: "micro" }],
  [/(\d)\s*[–—]\s*(\d)/g, { es: "$1 a $2", en: "$1 to $2" }],
];

const SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉";
const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/**
 * Prepara un texto para leerlo en voz alta: sin enlaces, sin formato y sin
 * símbolos sueltos (✓, ∅, →, *, #…). Los que tienen lectura clara se cambian
 * por su palabra.
 * @param text Respuesta del asistente tal como se muestra.
 * @param lang Idioma en que se va a leer.
 * @returns Texto limpio; cadena vacía si no queda nada que leer.
 */
export function speechText(text: string, lang: Lang): string {
  let out = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // enlaces con formato: queda su texto
    .replace(/https?:\/\/\S+/g, " ");
  for (const [pattern, word] of WORDS) out = out.replace(pattern, word[lang]);
  return out
    .replace(/[₀-₉]/g, (c) => String(SUBSCRIPT.indexOf(c)))
    .replace(/[⁰¹²³⁴-⁹]/g, (c) => String(SUPERSCRIPT.indexOf(c)))
    .replace(/[*_#`|<>[\]{}\\]/g, " ")
    // Se conservan letras, cifras, puntuación y los signos que sí se leen.
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}+=%°]/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

/**
 * Parte un texto en frases cortas: los navegadores cortan las locuciones
 * largas, así que se encolan una a una.
 */
export function speechChunks(text: string, max = 220): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if (current && (current + s).length > max) {
      chunks.push(current.trim());
      current = "";
    }
    current += s;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
