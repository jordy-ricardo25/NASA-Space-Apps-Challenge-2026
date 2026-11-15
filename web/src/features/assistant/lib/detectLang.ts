import type { Lang } from "@/content/i18n";

const ES = new Set("el la los las un una unos unas de del al que y o en es son por para con como qué que cuál cual cuáles dónde donde cuándo cuando quién quien cuánto cuanto porqué porque hola gracias sí no más pero si sobre entre hay fue ser está están puede pueden puedo quiero dime explica explícame fuego llama arde quema incendio gravedad oxígeno presión ventilación luna marte nave estación traje".split(" "));
const EN = new Set("the a an of and or in is are was were be for with to on at by from what which who when where why how does do did can could would should will hello hi thanks yes not more but if about between there this that it its tell explain me fire flame burn burns burning gravity oxygen pressure ventilation moon mars spacecraft station suit".split(" "));

/**
 * Idioma en que está escrita una pregunta, para responder en ese mismo
 * idioma sin una segunda petición de traducción.
 * @returns "es" o "en" cuando se reconoce con claridad; `null` si la pregunta
 *          es demasiado corta o ambigua (se usa entonces el idioma de la conversación).
 */
export function detectLang(question: string): Lang | null {
  const text = question.toLowerCase();
  let es = /[¿¡ñ]/.test(text) ? 2 : 0;
  let en = 0;
  if (/[áéíóú]/.test(text)) es += 1;
  for (const word of text.split(/[^a-záéíóúüñ]+/)) {
    if (!word) continue;
    if (ES.has(word)) es += 1;
    if (EN.has(word)) en += 1;
  }
  if (es === en) return null;
  return es > en ? "es" : "en";
}
