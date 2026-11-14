/**
 * Ranking de investigaciones por ambiente (documento maestro §13.8):
 *   d(q, e) = Σ wⱼ · dⱼ / Σ wⱼ      puntaje = 1 − d
 * Los pesos son visibles y ajustables. La cobertura de atributos se informa
 * aparte para no premiar fichas incompletas. No es una probabilidad de incendio.
 */
import { l, type L } from "@/content/i18n";
import { INVESTIGATIONS, type Investigation, type Pillar } from "@/content/investigations";

export type Criterion = "atmosphere" | "gravity" | "scale" | "data" | "pillar";
export type RankWeights = Record<Criterion, number>;

export const CRITERIA: Criterion[] = ["atmosphere", "gravity", "scale", "data", "pillar"];
export const DEFAULT_WEIGHTS: RankWeights = { atmosphere: 3, gravity: 3, scale: 1, data: 2, pillar: 2 };

export const CRITERION_LABEL: Record<Criterion, L> = {
  atmosphere: l("Atmósfera (O₂ y presión)", "Atmosphere (O₂ and pressure)"),
  gravity: l("Régimen de gravedad", "Gravity regime"),
  scale: l("Escala del ensayo", "Test scale"),
  data: l("Disponibilidad de datos", "Data availability"),
  pillar: l("Pilar de seguridad", "Safety pillar"),
};

export interface RankQuery {
  o2: number;
  p: number;
  g: number;
  pillar?: Pillar | null;
}

export interface Ranked {
  inv: Investigation;
  /** Puntaje 0–1 (1 = más relevante). */
  score: number;
  /** Cercanía por criterio (1 = coincide). */
  parts: RankWeights;
  /** Fracción de atributos numéricos publicados (O₂, presión, flujo). */
  coverage: number;
}

const regime = (g: number): Investigation["regime"] => (g < 0.02 ? "micro" : g < 0.9 ? "partial" : "earth");
const gap = (x: number, r: [number, number], scale: number): number => Math.min(1, Math.max(0, r[0] - x, x - r[1]) / scale);

function distances(inv: Investigation, q: RankQuery): RankWeights {
  const dO2 = inv.o2 ? gap(q.o2, inv.o2, 15) : 1;
  const dP = inv.p ? gap(q.p, inv.p, 50) : 0.6;
  const rq = regime(q.g);
  const gravity = inv.regime === rq ? 0 : inv.regime === "earth" || rq === "earth" ? 1 : 0.7;
  const pillar = q.pillar ? (inv.pillars.includes(q.pillar) ? 0 : 1) : inv.pillars.length === 1 && inv.pillars[0] === "fundamental" ? 0.5 : 0;
  return {
    atmosphere: (dO2 + dP) / 2,
    gravity,
    scale: inv.scale === "bench" ? 0.6 : 0,
    data: (3 - inv.data) / 3,
    pillar,
  };
}

/** Ordena las investigaciones por relevancia para el ambiente consultado. */
export function rankInvestigations(q: RankQuery, w: RankWeights = DEFAULT_WEIGHTS, list: Investigation[] = INVESTIGATIONS): Ranked[] {
  const total = CRITERIA.reduce((a, c) => a + w[c], 0) || 1;
  return list
    .map((inv) => {
      const d = distances(inv, q);
      const dist = CRITERIA.reduce((a, c) => a + w[c] * d[c], 0) / total;
      const parts = Object.fromEntries(CRITERIA.map((c) => [c, 1 - d[c]])) as RankWeights;
      const coverage = [inv.o2, inv.p, inv.flow].filter(Boolean).length / 3;
      return { inv, score: 1 - dist, parts, coverage };
    })
    .sort((a, b) => b.score - a.score);
}
