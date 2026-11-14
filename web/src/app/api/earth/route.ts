import { listEarthCases } from "@/features/earth/server/earth.service";

export const dynamic = "force-static";

/** GET /api/earth — casos de transferencia tecnológica a la Tierra. */
export function GET() {
  return Response.json(listEarthCases());
}
