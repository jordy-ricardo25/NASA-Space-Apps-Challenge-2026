/**
 * Servicio del Radar tecnológico (objetivo O3). Catálogo curado del documento
 * maestro; lo usan la página (SSR) y el Route Handler `/api/techmap`.
 */
import { GAPS, RADAR, type GapItem, type RadarLane } from "@/content/radar";
import { envelope, type ApiEnvelope } from "@/shared/types/api";

export interface TechMap {
  lanes: RadarLane[];
  gaps: GapItem[];
}

/** Grafo evidencia → hallazgo → brecha → tecnología y mapa de brechas. */
export function getTechMap(): ApiEnvelope<TechMap> {
  const ids = new Set<string>();
  for (const lane of RADAR) for (const node of Object.values(lane.nodes)) node.sources.forEach((s) => ids.add(s));
  for (const gap of GAPS) gap.sources.forEach((s) => ids.add(s));
  return envelope({ lanes: RADAR, gaps: GAPS }, { data_mode: "real", kind: "catalog", sources: [...ids].map((id) => ({ id })) });
}
