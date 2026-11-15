/**
 * Preguntas de un toque del chat, según lo que la persona tiene delante:
 * un hallazgo de NASA PSI fijado, un escenario (cabina o Laboratorio) o nada.
 * Las generales son las preguntas preparadas del asistente, con respuesta aprobada.
 */
import { l, type L, type Lang } from "@/content/i18n";
import { featuredQuestions } from "./faq";

export interface QuickContext {
  /** Hay un hallazgo de NASA PSI fijado en el chat. */
  finding: boolean;
  /** Material y lugar del escenario en pantalla, ya en el idioma de la interfaz. */
  scenario: { material: string; place: string } | null;
}

/** Preguntas sobre el hallazgo fijado: las responde el paquete del backend. */
const ABOUT_FINDING: L[] = [
  l("¿Qué tan fiable es esta evidencia?", "How reliable is this evidence?"),
  l("¿Qué falta por verificar?", "What remains unverified?"),
  l("¿Qué pesa más en su índice?", "What weighs most in its index?"),
];

/**
 * Preguntas sugeridas para el contexto actual, de la más específica a la más general.
 * @param limit Cuántas devolver como máximo.
 */
export function quickQuestions(ctx: QuickContext, lang: Lang, limit = 4): string[] {
  const out: string[] = [];
  if (ctx.finding) out.push(...ABOUT_FINDING.map((q) => q[lang]));
  if (ctx.scenario) {
    const { material, place } = ctx.scenario;
    out.push(lang === "es" ? `¿Arde ${material} en ${place}?` : `Does ${material} burn in the ${place}?`);
  }
  out.push(...featuredQuestions(lang));
  return [...new Set(out)].slice(0, limit);
}
