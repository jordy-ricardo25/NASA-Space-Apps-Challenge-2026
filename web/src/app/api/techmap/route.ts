import { getTechMap } from "@/features/radar/server/radar.service";

export const dynamic = "force-static";

/** GET /api/techmap — grafo del Radar tecnológico y mapa de brechas. */
export function GET() {
  return Response.json(getTechMap());
}
