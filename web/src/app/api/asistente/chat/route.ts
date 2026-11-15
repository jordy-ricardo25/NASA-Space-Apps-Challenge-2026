import { z } from "zod";
import { HISTORY_TURNS, answerQuestion } from "@/features/assistant/server/assistant.service";
import { envelope } from "@/shared/types/api";

export const maxDuration = 30;

const body = z.object({
  question: z.string().trim().min(1).max(400),
  lang: z.enum(["es", "en"]).catch("es"),
  // Turnos anteriores: dan memoria al modelo y permiten responder "sí" a lo que Flamey ofreció.
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

/** POST /api/asistente/chat — respuesta del asistente con origen, fuentes y evidencia. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid question" }, { status: 400 });
  const { question, lang, context, history } = parsed.data;
  const a = await answerQuestion(question, lang, context ?? {}, history);
  return Response.json(
    envelope(
      { text: a.text, lang: a.lang, origin: a.origin, citations: a.sources, rows: a.rows },
      { kind: a.origin === "analysis" ? "prediction" : a.origin === "psi" ? "derived" : "catalog", evidence_level: a.evidence, sources: a.sources.map((s) => ({ id: s.id })) },
    ),
  );
}
