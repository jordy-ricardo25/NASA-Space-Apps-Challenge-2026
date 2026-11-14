/**
 * Servicio de "Datos y referencias": todas las fuentes de la plataforma
 * agrupadas por tipo. Lo usa la página `/referencias` (SSR).
 */
import { SOURCES, type Source } from "@/content/sources";
import { envelope, type ApiEnvelope } from "@/shared/types/api";

export type SourceGroup = "reports" | "papers" | "nasa" | "assets";

const GROUP_OF: Record<Source["kind"], SourceGroup> = {
  ntrs: "reports",
  doi: "papers",
  psi: "nasa",
  nasa: "nasa",
  standard: "nasa",
  spinoff: "nasa",
  history: "nasa",
  asset: "assets",
};

/** Fuentes agrupadas: reportes NTRS, artículos con DOI, páginas de NASA y recursos. */
export function listReferences(): ApiEnvelope<Record<SourceGroup, Source[]>> {
  const groups: Record<SourceGroup, Source[]> = { reports: [], papers: [], nasa: [], assets: [] };
  for (const s of SOURCES) groups[GROUP_OF[s.kind]].push(s);
  return envelope(groups, { data_mode: "real", kind: "catalog", sources: [] });
}
