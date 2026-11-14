import { coverageMatrix } from "@/features/investigations/server/investigations.service";

export const dynamic = "force-static";

/** GET /api/coverage — matriz investigación × variable (medida, no medida, no aplica). */
export function GET() {
  return Response.json(coverageMatrix());
}
