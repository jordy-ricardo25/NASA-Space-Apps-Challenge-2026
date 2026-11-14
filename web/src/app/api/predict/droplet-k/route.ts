import { predictBody } from "@/features/laboratory/lib/query";
import { predictDropletK } from "@/features/laboratory/server/laboratory.service";

/** POST /api/predict/droplet-k — constante de combustión K y curva D²(t). */
export async function POST(req: Request) {
  const parsed = predictBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid scenario", issues: parsed.error.issues }, { status: 400 });
  return Response.json(predictDropletK(parsed.data));
}
