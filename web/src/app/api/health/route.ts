import { assistantStats } from "@/features/assistant/server/assistant.service";
import { MATERIAL_LIST } from "@/features/fire/engine/materials";

/** GET /api/health — estado de los servicios (alimenta el indicador "SISTEMA EN LÍNEA"). */
export function GET() {
  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    services: { physics: "ok", assistant: assistantStats(), materials: MATERIAL_LIST.length },
    model_version: "fif-physics-1.0",
  });
}
