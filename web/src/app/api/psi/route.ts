import { psiFor } from "@/features/psi/server/psi.service";

/**
 * GET /api/psi?env=<módulo> — hallazgos de NASA PSI ordenados para un ambiente,
 * cobertura por clase de material y brechas declaradas (backend del equipo,
 * con copia de respaldo).
 */
export async function GET(req: Request) {
  const env = new URL(req.url).searchParams.get("env");
  return Response.json(await psiFor(env));
}
