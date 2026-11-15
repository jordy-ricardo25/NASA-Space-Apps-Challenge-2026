import { investigationCard } from "@/features/assistant/server/assistant.service";
import { knowledgeBase } from "@/features/assistant/server/knowledgeBase";
import { envelope } from "@/shared/types/api";

/**
 * GET /api/asistente/conocimiento — la base de conocimiento local de Flamey
 * en JSON: cada fragmento con su tipo, su texto en español e inglés y sus
 * fuentes. Es lo que el modelo de Ollama recibe como contexto, por fragmentos.
 */
export function GET() {
  const chunks = knowledgeBase(investigationCard).map(({ id, kind, title, text, sources, evidence }) => ({ id, kind, title, text, sources, evidence: evidence ?? null }));
  return Response.json(envelope({ count: chunks.length, chunks }, { kind: "catalog", sources: [...new Set(chunks.flatMap((c) => c.sources))].map((id) => ({ id })) }));
}
