import { predictBody } from "@/features/laboratory/lib/query";
import { predictSolidBoundary } from "@/features/laboratory/server/laboratory.service";

/** POST /api/predict/solid-boundary — frontera de propagación, margen y alertas. */
export async function POST(req: Request) {
  const parsed = predictBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid scenario", issues: parsed.error.issues }, { status: 400 });
  return Response.json(predictSolidBoundary(parsed.data));
}
