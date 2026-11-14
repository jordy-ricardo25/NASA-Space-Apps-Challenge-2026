import { PILLAR_LABEL, type Pillar } from "@/content/investigations";
import { listInvestigations, rankFor } from "@/features/investigations/server/investigations.service";

/**
 * GET /api/investigations — catálogo de fichas. Con `?env=` (y opcionalmente
 * `?pillar=`) devuelve el ranking de investigaciones para ese ambiente.
 */
export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const env = sp.get("env");
  if (!env) return Response.json(listInvestigations());
  const p = sp.get("pillar");
  const pillar = p && p in PILLAR_LABEL ? (p as Pillar) : null;
  return Response.json(rankFor(env, pillar));
}
