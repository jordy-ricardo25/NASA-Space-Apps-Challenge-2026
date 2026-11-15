/**
 * Datos reales de NASA PSI servidos por el backend del equipo (emberwatch API):
 * ranking de hallazgos por ambiente, cobertura por clase de material y brechas
 * declaradas. Solo servidor.
 *
 * Cada llamada es opcional: si el backend no está configurado, no responde a
 * tiempo o cambia de contrato, se usa la copia de respaldo guardada con
 * `npm run psi-snapshot`. La interfaz recibe siempre el mismo sobre.
 */
import { z } from "zod";
import { backendFetch } from "@/shared/lib/backend";
import { envelope, type ApiEnvelope } from "@/shared/types/api";
import { PSI_ENV, type PsiEnvKey } from "../lib/env";
import snapshotJson from "./snapshot.json";

const finding = z.object({
  key: z.string(),
  experiment: z.string(),
  facility: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  flame_mode: z.string().nullable().optional(),
  o2_min: z.number().nullable().optional(),
  o2_max: z.number().nullable().optional(),
  observations: z.number(),
  quality: z.number().nullable().optional(),
  rpi: z.number(),
  band: z.string(),
  relevance: z.string(),
  sources: z.array(z.string()).optional(),
});
const findingsOut = z.array(finding).min(1);

const gapsOut = z.object({
  cells: z.array(z.object({ environment: z.string(), material_class: z.string(), observations: z.number(), affinity: z.number().optional(), state: z.string() })),
  declared: z.array(z.object({ area: z.string(), detail: z.string(), bound: z.string() })),
  note: z.string().optional(),
});

const metaOut = z.object({
  kernel_version: z.string(),
  environments: z.record(z.string(), z.object({ key: z.string(), label: z.string(), gravity_g: z.number(), o2_fraction: z.number(), pressure_atm: z.number() })),
  bands: z.record(z.string(), z.number()).optional(),
});

const snapshotSchema = z.object({
  taken: z.string(),
  kernel_version: z.string(),
  environments: metaOut.shape.environments,
  bands: z.record(z.string(), z.number()).optional(),
  findings: z.record(z.string(), z.array(finding)),
  gaps: gapsOut,
});
const SNAPSHOT = snapshotSchema.parse(snapshotJson);

export type PsiFinding = z.infer<typeof finding>;

export interface PsiData {
  /** Clave del ambiente en el backend y sus condiciones allí. */
  environment: { key: PsiEnvKey; label: string; gravity_g: number; o2_fraction: number; pressure_atm: number } | null;
  /** Hallazgos ordenados por su índice RPI para ese ambiente (de mayor a menor). */
  findings: PsiFinding[];
  /** Observaciones por clase de material en ese ambiente. */
  coverage: { material_class: string; observations: number; state: string }[];
  /** Brechas que el propio corpus declara. */
  declared: { area: string; detail: string; bound: string }[];
  /** Total de observaciones del ranking. */
  observations: number;
}

const OPTIONS = { timeout: 5000, revalidate: 300 } as const;

/** Contrato de `GET /api/findings/{clave}/context` (api/app/dto.py · ContextOut). */
const factor = z.object({ name: z.string(), value: z.number(), weight: z.number(), contribution: z.number() });
const contextOut = z.object({
  finding: finding.extend({ factors: z.array(factor) }),
  environment: z.object({ key: z.string(), label: z.string(), gravity_g: z.number(), o2_fraction: z.number(), pressure_atm: z.number() }),
  evidence: z.array(z.object({ file: z.string(), row: z.number(), quality: z.number() })),
  messages: z.array(z.object({ role: z.string(), content: z.string() })),
});

export type PsiFactor = z.infer<typeof factor>;

/** Un hallazgo de PSI con todo lo que el asistente necesita para explicarlo. */
export interface FindingPack {
  /** `true` si respondió el backend; `false` si salió de la copia de respaldo (sin factores ni filas). */
  live: boolean;
  environment: { key: PsiEnvKey; label: string; gravity_g: number; o2_fraction: number; pressure_atm: number };
  finding: PsiFinding;
  /** Factores del índice RPI, de mayor a menor aporte. */
  factors: PsiFactor[];
  /** Filas del CSV que respaldan el hallazgo. */
  evidence: { file: string; row: number; quality: number }[];
  /** Resumen con la evidencia cruda que el backend prepara para un modelo de lenguaje. */
  brief: string | null;
  kernel: string;
}

/**
 * Paquete de un hallazgo para un módulo de la plataforma.
 * @param key Clave del hallazgo (`experimento::material::modo`).
 * @param moduleId Módulo de la plataforma (nave, estacion, rover, traje, base, marte).
 * @returns El paquete, o `null` si el hallazgo no existe para ese ambiente.
 */
export async function findingPack(key: string, moduleId: string | null | undefined): Promise<FindingPack | null> {
  const envKey: PsiEnvKey = PSI_ENV[moduleId ?? ""] ?? "lunar";
  const [live, meta] = await Promise.all([
    backendFetch(`/api/findings/${encodeURIComponent(key)}/context?environment=${envKey}`, contextOut, { timeout: 5000 }),
    backendFetch("/api/meta", metaOut, OPTIONS),
  ]);
  if (live) {
    const { factors, ...found } = live.finding;
    const e = live.environment;
    return {
      live: true,
      environment: { key: envKey, label: e.label, gravity_g: e.gravity_g, o2_fraction: e.o2_fraction, pressure_atm: e.pressure_atm },
      finding: found,
      factors: [...factors].sort((a, b) => b.contribution - a.contribution),
      evidence: live.evidence,
      brief: live.messages.find((m) => m.role === "user")?.content ?? null,
      kernel: meta?.kernel_version ?? SNAPSHOT.kernel_version,
    };
  }
  const saved = SNAPSHOT.findings[envKey]?.find((f) => f.key === key);
  const env = SNAPSHOT.environments[envKey];
  if (!saved || !env) return null;
  return {
    live: false,
    environment: { key: envKey, label: env.label, gravity_g: env.gravity_g, o2_fraction: env.o2_fraction, pressure_atm: env.pressure_atm },
    finding: saved,
    factors: [],
    evidence: [],
    brief: null,
    kernel: SNAPSHOT.kernel_version,
  };
}

/**
 * Datos de PSI para un módulo de la plataforma.
 * @param moduleId Módulo activo (nave, estacion, rover, traje, base, marte).
 * @returns Sobre con `data_mode: "real"` si respondió el backend o
 *          `"precomputed"` si se usó la copia de respaldo.
 */
export async function psiFor(moduleId: string | null | undefined): Promise<ApiEnvelope<PsiData>> {
  const key: PsiEnvKey = PSI_ENV[moduleId ?? ""] ?? "lunar";
  const [live, liveGaps, liveMeta] = await Promise.all([
    backendFetch(`/api/findings?environment=${key}&limit=100`, findingsOut, OPTIONS),
    backendFetch("/api/gaps", gapsOut, OPTIONS),
    backendFetch("/api/meta", metaOut, OPTIONS),
  ]);
  const real = !!live && !!liveGaps && !!liveMeta;
  const findings = [...(real ? live : (SNAPSHOT.findings[key] ?? []))].sort((a, b) => b.rpi - a.rpi);
  const gaps = real ? liveGaps : SNAPSHOT.gaps;
  const meta = real ? liveMeta : SNAPSHOT;
  const env = meta.environments[key];
  return envelope(
    {
      environment: env ? { key, label: env.label, gravity_g: env.gravity_g, o2_fraction: env.o2_fraction, pressure_atm: env.pressure_atm } : null,
      findings,
      coverage: gaps.cells.filter((c) => c.environment === key).map((c) => ({ material_class: c.material_class, observations: c.observations, state: c.state })),
      declared: gaps.declared,
      observations: findings.reduce((a, f) => a + f.observations, 0),
    },
    { data_mode: real ? "real" : "precomputed", kind: "derived", sources: [{ id: "PSI" }], model_version: `emberwatch ${meta.kernel_version}` },
  );
}
