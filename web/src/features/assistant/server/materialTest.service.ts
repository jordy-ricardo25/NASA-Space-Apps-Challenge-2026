/**
 * Prueba de un material en un ambiente, para la pestaña "Materiales" de Flamey.
 * Solo servidor. Junta dos cálculos y nunca los mezcla:
 *  - el motor físico de la plataforma: frontera de propagación, margen con su
 *    intervalo y nivel de evidencia (solo materiales con fuente publicada);
 *  - el modelo del backend del equipo (`POST /api/lab/simulate`): límite de
 *    oxígeno y velocidad de propagación. Es opcional: si no responde o no
 *    conoce el material, la prueba sigue sin él.
 * Un material que no tiene ninguno de los dos se devuelve como "sin evidencia".
 */
import { z } from "zod";
import type { Lang } from "@/content/i18n";
import { getModule, type ModuleId } from "@/content/modules";
import { assess, outOfDomain, type RiskLevel } from "@/features/fire/engine/analysis";
import { backendFetch } from "@/shared/lib/backend";
import { envelope, type ApiEnvelope, type EvidenceLevel } from "@/shared/types/api";
import { getMaterialOption, type MaterialOptionId } from "../lib/materialOptions";
import { scenarioVerdict } from "./assistant.service";

export const MODEL_VERSION = "fif-physics-1.0";

/** Contrato de `POST /api/lab/simulate` (api/app/dto.py · LabOut). */
const labOut = z.object({ limit: z.number(), excess: z.number(), quenched: z.boolean(), rate_mm_s: z.number() });

export interface MaterialTestInput {
  module: ModuleId;
  material: MaterialOptionId;
  /** Fracción de oxígeno (% vol). */
  o2: number;
  /** Presión total (kPa). */
  p: number;
  lang: Lang;
}

export interface MaterialTest {
  /** Condiciones con las que se calculó (la gravedad y la ventilación las pone el ambiente). */
  scenario: { module: ModuleId; g: number; o2: number; p: number; vent: number };
  /** Resultado del motor físico; `null` si el material no está en su catálogo. */
  engine: {
    level: RiskLevel;
    /** Frontera de propagación (% O₂) e intervalo del margen (puntos de O₂); `null` sin frontera publicada. */
    loc: number | null;
    marginLo: number | null;
    marginHi: number | null;
    evidence: EvidenceLevel;
    /** Conclusión en una frase, en el idioma pedido. */
    text: string;
    /** Variables fuera del rango ensayado, ya en el idioma pedido. */
    outOfDomain: string[];
  } | null;
  /** Resultado del modelo del backend; `null` si no respondió o no conoce el material. */
  backend: { limit: number; quenched: boolean; rate: number } | null;
  /** Por qué falta el resultado del backend, si falta. */
  backendState: "ok" | "unknown_material" | "unavailable";
}

/**
 * Calcula la prueba de un material.
 * @returns Sobre con `evidence_level` del motor físico, o "NONE" si el material no tiene frontera con fuente.
 */
export async function testMaterial(q: MaterialTestInput): Promise<ApiEnvelope<MaterialTest>> {
  const env = getModule(q.module)!;
  const option = getMaterialOption(q.material)!;
  const variant = env.variants[0]!;
  const scenario = { module: env.id, g: variant.g, o2: q.o2, p: q.p, vent: env.vent };

  const remote = option.backend
    ? await backendFetch("/api/lab/simulate", labOut, {
        method: "POST",
        timeout: 2500,
        body: { material: option.backend, o2_fraction: q.o2 / 100, pressure_atm: q.p / 101.325, gravity_g: Math.min(1.8, variant.g), flow_cm_s: env.vent, ignition_w: 0, co2_pct: 0, he_pct: 0, diluent: "N2", mode: "opposed" },
      })
    : null;

  let engine: MaterialTest["engine"] = null;
  let sources: string[] = [];
  if (option.engine) {
    const s = { mat: option.engine, g: variant.g, o2: q.o2, P: q.p, vent: env.vent, undefinedAtmosphere: !!variant.undefinedAtmosphere };
    const a = assess(s);
    sources = a.sources;
    engine = {
      level: a.level,
      loc: a.loc,
      marginLo: a.marginLo,
      marginHi: a.marginHi,
      evidence: a.evidence,
      text: scenarioVerdict(option.engine, { module: env.id, g: variant.g, o2: q.o2, p: q.p, vent: env.vent }, q.lang).text,
      outOfDomain: outOfDomain(s).map((x) => x[q.lang]),
    };
  }

  return envelope(
    {
      scenario,
      engine,
      backend: remote ? { limit: Math.round(remote.limit * 1000) / 10, quenched: remote.quenched, rate: remote.rate_mm_s } : null,
      backendState: remote ? "ok" : option.backend ? "unavailable" : "unknown_material",
    },
    {
      kind: "prediction",
      evidence_level: engine?.evidence ?? "NONE",
      interval: engine?.marginLo != null && engine.marginHi != null ? [engine.marginLo, engine.marginHi] : undefined,
      sources: sources.map((id) => ({ id })),
      model_version: MODEL_VERSION,
    },
  );
}
