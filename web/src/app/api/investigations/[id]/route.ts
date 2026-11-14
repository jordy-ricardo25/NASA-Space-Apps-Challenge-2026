import { investigationById } from "@/features/investigations/server/investigations.service";

/** GET /api/investigations/[id] — ficha completa de una investigación. */
export async function GET(_req: Request, ctx: RouteContext<"/api/investigations/[id]">) {
  const { id } = await ctx.params;
  const found = investigationById(id);
  return found ? Response.json(found) : Response.json({ error: "Investigation not found" }, { status: 404 });
}
