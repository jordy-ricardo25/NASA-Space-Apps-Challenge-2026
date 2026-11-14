import { MODULES } from "@/content/modules";
import { envelope } from "@/shared/types/api";

export const dynamic = "force-static";

/** GET /api/environments — catálogo de ambientes habitables y sus atmósferas. */
export function GET() {
  return Response.json(envelope(MODULES, { data_mode: "real", kind: "catalog", sources: [{ id: "CHALLENGE" }, { id: "B7" }, { id: "B4" }] }));
}
