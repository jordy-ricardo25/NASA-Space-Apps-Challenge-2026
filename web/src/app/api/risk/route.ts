import { predictBody } from "@/features/laboratory/lib/query";
import { riskIndex } from "@/features/laboratory/server/laboratory.service";

/** POST /api/risk — índice de riesgo: nivel, margen, evidencia y alertas. */
export async function POST(req: Request) {
  const parsed = predictBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid scenario", issues: parsed.error.issues }, { status: 400 });
  return Response.json(riskIndex(parsed.data));
}
