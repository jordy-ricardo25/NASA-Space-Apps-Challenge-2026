import { z } from "zod";
import { assistantStats } from "@/features/assistant/server/assistant.service";
import { MATERIAL_LIST } from "@/features/fire/engine/materials";
import { backendFetch, backendUrl } from "@/shared/lib/backend";

const backendHealth = z.object({ status: z.string(), kernel: z.string().optional() });

/**
 * GET /api/health — estado de los servicios (alimenta el indicador "SISTEMA EN LÍNEA").
 * Incluye el estado del backend del equipo si está configurado; que no responda
 * no afecta al resto de la plataforma.
 */
export async function GET() {
  const backend = backendUrl() ? await backendFetch("/health", backendHealth, { timeout: 1200 }) : null;
  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    services: {
      physics: "ok",
      assistant: assistantStats(),
      materials: MATERIAL_LIST.length,
      backend: !backendUrl() ? "not_configured" : backend ? "ok" : "unreachable",
    },
    model_version: "fif-physics-1.0",
    backend_kernel: backend?.kernel ?? null,
  });
}
