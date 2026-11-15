/**
 * Base de conocimiento local de Flamey: todo lo que la plataforma sabe, en una
 * sola lista de fragmentos con su fuente. Es el equivalente, para el modelo de
 * Ollama, del documento maestro que Gemini consulta con File Search: como un
 * modelo pequeño no puede leer el documento entero, recibe solo los fragmentos
 * más cercanos a la pregunta.
 *
 * No añade ningún dato: reúne fichas de conocimiento, fichas de
 * investigaciones, mitos y hechos, y preguntas con respuesta aprobada.
 * `GET /api/asistente/conocimiento` la publica como JSON.
 */
import type { L } from "@/content/i18n";
import { INVESTIGATIONS, type Investigation } from "@/content/investigations";
import { KNOWLEDGE, type KnowledgeCard } from "@/content/knowledge";
import { MYTHS } from "@/content/myths";
import { PLATFORM_QUESTIONS } from "@/content/questionBank";
import { FAQ, normalize } from "../lib/faq";

export type ChunkKind = "card" | "investigation" | "myth" | "question";

/** Un fragmento citable: una ficha con su tipo y un título corto. */
export interface KnowledgeChunk extends KnowledgeCard {
  kind: ChunkKind;
  title: L;
}

/** Palabras de un título que sirven para encontrar el fragmento. */
const keysOf = (...texts: string[]): string[] => [...new Set(texts.flatMap((x) => normalize(x).split(" ")).filter((w) => w.length >= 4))];

let cache: KnowledgeChunk[] | null = null;

/**
 * Lista completa de fragmentos.
 * @param investigationCard Convierte la ficha de una investigación en texto citable
 *        (la misma función que usa el asistente, para que digan lo mismo).
 */
export function knowledgeBase(investigationCard: (inv: Investigation) => KnowledgeCard): KnowledgeChunk[] {
  if (cache) return cache;
  const cards: KnowledgeChunk[] = KNOWLEDGE.map((card) => ({ ...card, kind: "card", title: { es: card.id, en: card.id } }));
  const investigations: KnowledgeChunk[] = INVESTIGATIONS.map((inv) => ({
    ...investigationCard(inv),
    keys: keysOf(inv.id, inv.name, inv.full),
    kind: "investigation",
    title: { es: inv.name, en: inv.name },
  }));
  const myths: KnowledgeChunk[] = MYTHS.map((m) => ({
    id: `myth:${m.id}`,
    // Sin palabras clave propias: un mito solo gana a una ficha revisada si su texto coincide mucho.
    keys: [],
    text: { es: `Mito: ${m.myth.es} Hecho: ${m.fact.es}`, en: `Myth: ${m.myth.en} Fact: ${m.fact.en}` },
    sources: m.sources,
    kind: "myth",
    title: m.myth,
  }));
  // Las preguntas que responden con una ficha ya están cubiertas por esa ficha.
  const questions: KnowledgeChunk[] = [...PLATFORM_QUESTIONS.map((q) => ({ ...q, sources: [] as string[] })), ...FAQ.filter((f) => !f.card).map((f) => ({ q: f.q, a: f.a, sources: f.sources ?? [] }))].map((item, i) => ({
    id: `question:${i + 1}`,
    keys: [],
    text: { es: `${item.q.es} ${item.a.es}`, en: `${item.q.en} ${item.a.en}` },
    sources: item.sources,
    kind: "question",
    title: item.q,
  }));
  cache = [...cards, ...investigations, ...myths, ...questions];
  return cache;
}
