import { listMyths } from "@/features/investigations/server/myths.service";

/** GET /api/rules — mitos y hechos del fuego sin gravedad (guía oficial de NASA). */
export async function GET() {
  return Response.json(await listMyths());
}
