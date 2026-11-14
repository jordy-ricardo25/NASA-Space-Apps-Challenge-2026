/**
 * Servicio de investigaciones (objetivo O1). Catálogo curado a partir del
 * documento maestro; es la capa que se sustituirá por el backend real sin
 * tocar los componentes.
 */
import { INVESTIGATIONS, VAR_KEYS, getInvestigation, type Coverage, type Investigation, type Pillar, type VarKey } from "@/content/investigations";
import { getModule } from "@/content/modules";
import { envelope, type ApiEnvelope } from "@/shared/types/api";
import { DEFAULT_WEIGHTS, rankInvestigations, type RankWeights, type Ranked } from "../lib/ranking";

/** Catálogo completo de fichas. */
export function listInvestigations(): ApiEnvelope<Investigation[]> {
  return envelope(INVESTIGATIONS, { data_mode: "real", kind: "catalog", sources: [{ id: "PSI" }] });
}

/** Ficha de una investigación. */
export function investigationById(id: string): ApiEnvelope<Investigation> | null {
  const inv = getInvestigation(id);
  return inv ? envelope(inv, { data_mode: "real", kind: "catalog", sources: inv.sources.map((s) => ({ id: s })) }) : null;
}

/** Ranking por ambiente y pilar con pesos explícitos. */
export function rankFor(envId: string | undefined, pillar: Pillar | null, weights: RankWeights = DEFAULT_WEIGHTS): ApiEnvelope<Ranked[]> {
  const m = getModule(envId) ?? getModule("base")!;
  const v = m.variants[0]!;
  return envelope(rankInvestigations({ o2: v.o2, p: v.P, g: v.g, pillar }, weights), { data_mode: "real", kind: "derived", sources: [{ id: "PSI" }] });
}

/** Investigaciones elegidas para el comparador, en el orden pedido. */
export function compareInvestigations(ids: string[]): ApiEnvelope<Investigation[]> {
  const list = ids.flatMap((id) => getInvestigation(id) ?? []);
  return envelope(list, { data_mode: "real", kind: "catalog", sources: [...new Set(list.flatMap((i) => i.sources))].map((id) => ({ id })) });
}

/** Matriz de cobertura: qué variable midió cada investigación. */
export function coverageMatrix(): ApiEnvelope<{ variables: VarKey[]; rows: { id: string; name: string; vars: Record<VarKey, Coverage> }[] }> {
  return envelope(
    { variables: VAR_KEYS, rows: INVESTIGATIONS.map((i) => ({ id: i.id, name: i.name, vars: i.vars })) },
    { data_mode: "real", kind: "derived", sources: [{ id: "PSI" }] },
  );
}
