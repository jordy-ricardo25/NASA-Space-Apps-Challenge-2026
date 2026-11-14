/**
 * Servicio del Laboratorio (capa única de datos de la feature). Lo usan tanto
 * las páginas del servidor como los Route Handlers de /api/predict. Cuando el
 * equipo conecte el backend real (FastAPI), solo cambia esta capa: las
 * respuestas mantienen el mismo sobre.
 */
import { assess, boundaryCurve, dropletCurve, REFERENCE_POINTS, type Assessment, type CurvePoint, type DropletCurve, type RefPoint } from "@/features/fire/engine/analysis";
import { MATERIALS } from "@/features/fire/engine/materials";
import { envelope, type ApiEnvelope, type EvidenceLevel } from "@/shared/types/api";
import type { PredictBody } from "../lib/query";

export const MODEL_VERSION = "fif-physics-1.0";

export interface BoundaryPanel {
  id: "micro" | "moon" | "earth";
  g: number;
  curve: CurvePoint[];
  evidence: EvidenceLevel;
  refs: RefPoint[];
}

export interface BoundaryResult {
  panels: BoundaryPanel[];
  assessment: Assessment;
}

const PANELS: { id: BoundaryPanel["id"]; g: number }[] = [
  { id: "micro", g: 1e-6 },
  { id: "moon", g: 0.165 },
  { id: "earth", g: 1 },
];

/** Frontera de propagación por gravedad, margen del escenario y alertas. */
export function predictSolidBoundary(q: PredictBody): ApiEnvelope<BoundaryResult> {
  const m = MATERIALS[q.mat];
  const assessment = assess({ mat: q.mat, g: q.g, o2: q.o2, P: q.p, vent: q.flow, co2: q.co2, he: q.he, undefinedAtmosphere: q.undefinedAtmosphere });
  const panels = PANELS.map((p) => {
    const a = assess({ mat: q.mat, g: p.g, o2: q.o2, P: q.p, vent: q.flow });
    return {
      id: p.id,
      g: p.g,
      curve: boundaryCurve(q.mat, p.g, q.p, q.co2, q.he),
      evidence: a.evidence,
      refs: REFERENCE_POINTS.filter((r) => r.mat === q.mat && r.panel === p.id),
    };
  });
  return envelope(
    { panels, assessment },
    {
      kind: "prediction",
      evidence_level: assessment.evidence,
      interval: assessment.marginLo != null && assessment.marginHi != null ? [assessment.marginLo, assessment.marginHi] : undefined,
      alerts: assessment.alerts,
      sources: (m.frontier?.sources ?? m.sources).map((id) => ({ id })),
      model_version: MODEL_VERSION,
    },
  );
}

/** Constante de combustión K y curva D²(t) de una gota con sus diluyentes. */
export function predictDropletK(q: PredictBody): ApiEnvelope<DropletCurve | null> {
  const m = MATERIALS[q.mat];
  const curve = dropletCurve(q.mat, { o2: q.o2, P: q.p, vent: q.flow, g: q.g, co2: q.co2, he: q.he });
  return envelope(curve, {
    kind: "prediction",
    evidence_level: q.g < 0.02 ? "A" : q.g < 0.9 ? "D" : "B",
    sources: (m.droplet?.sources ?? m.sources).map((id) => ({ id })),
    model_version: MODEL_VERSION,
  });
}

/** Índice de riesgo: nivel, margen, evidencia y alertas (derivado de la frontera). */
export function riskIndex(q: PredictBody): ApiEnvelope<Pick<Assessment, "level" | "margin" | "marginLo" | "marginHi" | "loc" | "ppO2" | "U">> {
  const a = assess({ mat: q.mat, g: q.g, o2: q.o2, P: q.p, vent: q.flow, co2: q.co2, he: q.he, undefinedAtmosphere: q.undefinedAtmosphere });
  return envelope(
    { level: a.level, margin: a.margin, marginLo: a.marginLo, marginHi: a.marginHi, loc: a.loc, ppO2: a.ppO2, U: a.U },
    { kind: "derived", evidence_level: a.evidence, alerts: a.alerts, sources: a.sources.map((id) => ({ id })), model_version: MODEL_VERSION },
  );
}
