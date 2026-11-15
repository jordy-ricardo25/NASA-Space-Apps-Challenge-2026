import { z } from "zod";
import { MATERIAL_OPTION_IDS, O2_RANGE, P_RANGE } from "@/features/assistant/lib/materialOptions";
import { testMaterial } from "@/features/assistant/server/materialTest.service";

const body = z.object({
  module: z.enum(["nave", "estacion", "rover", "traje", "base", "marte"]),
  material: z.enum(MATERIAL_OPTION_IDS),
  o2: z.number().min(O2_RANGE.min).max(O2_RANGE.max),
  p: z.number().min(P_RANGE.min).max(P_RANGE.max),
  lang: z.enum(["es", "en"]).catch("es"),
});

/** POST /api/asistente/material — prueba de un material en un ambiente (motor físico y modelo del backend). */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid material test" }, { status: 400 });
  return Response.json(await testMaterial(parsed.data));
}
