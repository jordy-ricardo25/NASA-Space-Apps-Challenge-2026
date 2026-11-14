import { z } from "zod";
import { answerQuestion } from "@/features/assistant/server/assistant.service";
import { envelope } from "@/shared/types/api";

export const maxDuration = 30;

const body = z.object({
  question: z.string().trim().min(1).max(400),
  lang: z.enum(["es", "en"]).catch("es"),
  context: z
    .object({
      module: z.string().max(24).optional(),
      mat: z.string().max(24).optional(),
      g: z.number().min(0).max(4).optional(),
      o2: z.number().min(0).max(100).optional(),
      p: z.number().min(0).max(400).optional(),
      vent: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

/** POST /api/asistente/chat — respuesta del asistente con origen, fuentes y evidencia. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid question" }, { status: 400 });
  const { question, lang, context } = parsed.data;
  const a = await answerQuestion(question, lang, context ?? {});
  return Response.json(
    envelope(
      { text: a.text, origin: a.origin, citations: a.sources },
      { kind: a.origin === "analysis" ? "prediction" : "catalog", evidence_level: a.evidence, sources: a.sources.map((s) => ({ id: s.id })) },
    ),
  );
}
