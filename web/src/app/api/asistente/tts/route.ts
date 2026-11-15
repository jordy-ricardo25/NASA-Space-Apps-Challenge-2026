import { z } from "zod";
import { synthesize, voiceProvider } from "@/features/assistant/server/voice.service";
import { envelope } from "@/shared/types/api";

export const maxDuration = 30;

const body = z.object({
  text: z.string().trim().min(1).max(1500),
  lang: z.enum(["es", "en"]).catch("es"),
});

/** GET /api/asistente/tts — qué voz usa el asistente: la del navegador o Fish Audio. */
export function GET() {
  return Response.json(envelope({ provider: voiceProvider() }));
}

/**
 * POST /api/asistente/tts — audio MP3 de la respuesta (solo con Fish Audio
 * configurado). Si no hay audio, el navegador lee con su propia voz.
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid text" }, { status: 400 });
  const audio = await synthesize(parsed.data.text, parsed.data.lang);
  if (!audio) return Response.json({ error: "Voice service unavailable" }, { status: 503 });
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}
