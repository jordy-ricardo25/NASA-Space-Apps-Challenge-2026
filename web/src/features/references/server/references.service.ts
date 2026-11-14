/**
 * Servicio de "Datos y referencias": todas las fuentes de la plataforma
 * agrupadas por tipo y las misiones (investigaciones) que cita cada una.
 * Lo usa la página `/referencias` (SSR).
 */
import { INVESTIGATIONS } from "@/content/investigations";
import { SOURCES, type Source } from "@/content/sources";
import { envelope, type ApiEnvelope } from "@/shared/types/api";

export type SourceGroup = "reports" | "papers" | "nasa" | "assets";

/** Misión o investigación con las fuentes que la documentan. */
export interface MissionRefs {
  id: string;
  name: string;
  sources: string[];
}

export interface References {
  groups: Record<SourceGroup, Source[]>;
  missions: MissionRefs[];
}

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

/**
 * Fuentes agrupadas (reportes NTRS, artículos con DOI, páginas de NASA y
 * recursos) y, para el buscador, qué fuentes respaldan cada misión. La
 * relación sale de las fichas de investigación: no se etiqueta nada a mano.
 */
export function listReferences(): ApiEnvelope<References> {
  const groups: Record<SourceGroup, Source[]> = { reports: [], papers: [], nasa: [], assets: [] };
  for (const s of SOURCES) groups[GROUP_OF[s.kind]].push(s);
  const known = new Set(SOURCES.map((s) => s.id));
  const missions = INVESTIGATIONS.map((i) => ({ id: i.id, name: i.name, sources: i.sources.filter((id) => known.has(id)) })).filter((m) => m.sources.length > 0);
  return envelope({ groups, missions }, { data_mode: "real", kind: "catalog", sources: [] });
}
