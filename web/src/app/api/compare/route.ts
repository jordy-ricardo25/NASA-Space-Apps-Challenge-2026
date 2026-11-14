import { compareInvestigations } from "@/features/investigations/server/investigations.service";

/** GET /api/compare?inv=a,b — variables alineadas de 2 a 4 investigaciones. */
export function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("inv") ?? "").split(",").filter(Boolean).slice(0, 4);
  if (ids.length < 2) return Response.json({ error: "Provide 2 to 4 investigation ids in ?inv=" }, { status: 400 });
  return Response.json(compareInvestigations(ids));
}
