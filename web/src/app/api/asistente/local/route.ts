import { z } from "zod";
import { HISTORY_TURNS, answerQuestion } from "@/features/assistant/server/assistant.service";
import { listModels, ollamaConfig, resolveModel } from "@/features/assistant/server/ollama";
import { envelope } from "@/shared/types/api";

export const maxDuration = 30;

const body = z.object({
  question: z.string().trim().min(1).max(400),
  lang: z.enum(["es", "en"]).catch("es"),
  /** "local": responde el modelo de Ollama. "fast": sin modelo, con las cifras ya calculadas. */
  engine: z.enum(["local", "fast"]).catch("local"),
  /** Modelo de Ollama elegido en la pantalla (nombre tal como sale en `ollama list`). */
  model: z
    .string()
    .regex(/^[\w.:/-]{1,80}$/)
    .optional(),
  /** Temas del hallazgo ya respondidos en esta conversación. */
  covered: z.array(z.string().max(16)).max(12).catch([]),
  history: z
    .array(z.object({ role: z.enum(["user", "bot"]), text: z.string().max(1500) }))
    .max(HISTORY_TURNS)
    .catch([]),
  context: z
    .object({
      module: z.string().max(24).optional(),
      mat: z.string().max(24).optional(),
      g: z.number().min(0).max(4).optional(),
      o2: z.number().min(0).max(100).optional(),
      p: z.number().min(0).max(400).optional(),
      vent: z.number().min(0).max(100).optional(),
      explain: z.boolean().optional(),
      finding: z.object({ key: z.string().min(3).max(160), env: z.string().max(24) }).optional(),
    })
    .optional(),
});

/**
 * GET /api/asistente/local — estado del modelo local: si Ollama está
 * configurado, qué modelos tiene instalados y cuál se usaría.
 */
export async function GET() {
  const cfg = ollamaConfig();
  const models = cfg ? await listModels(cfg) : [];
  const preferred = cfg && models.length ? await resolveModel(cfg) : null;
  return Response.json(envelope({ configured: !!cfg, models, preferred }, { kind: "catalog", sources: [] }));
}

/**
 * POST /api/asistente/local — respuesta de Flamey con el modelo de Ollama
 * (o sin modelo, en modo rápido), con su origen, fuentes y filas de respaldo.
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid question" }, { status: 400 });
  const { question, lang, context, history, engine, model, covered } = parsed.data;
  const a = await answerQuestion(question, lang, context ?? {}, history, { engine, model, covered });
  return Response.json(
    envelope(
      { text: a.text, lang: a.lang, origin: a.origin, citations: a.sources, rows: a.rows, by: a.by ?? null, suggestions: a.suggestions ?? [], topic: a.topic ?? null, extrapolated: a.extrapolated ?? false },
      { kind: a.origin === "analysis" ? "prediction" : a.origin === "psi" ? "derived" : "catalog", evidence_level: a.evidence, sources: a.sources.map((s) => ({ id: s.id })) },
    ),
  );
}
