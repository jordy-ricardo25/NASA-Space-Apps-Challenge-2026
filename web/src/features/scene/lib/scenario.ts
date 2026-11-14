/**
 * Estado del escenario en la URL (pautas §8): todo lo que define "qué está
 * viendo el usuario" vive en los query params, validados con Zod. Así un
 * escenario exacto se puede compartir con un enlace y el botón Atrás funciona.
 */
import { z } from "zod";
import { getVariant, type AtmosphereVariant, type ModuleDef } from "@/content/modules";
import { MATERIALS, type MaterialId } from "@/features/fire/engine/materials";
import type { SimConfig } from "@/features/fire/engine/sim";

const materialIds = Object.keys(MATERIALS) as [MaterialId, ...MaterialId[]];

const schema = z.object({
  view: z.enum(["exterior", "cabina"]).catch("exterior"),
  atm: z.string().max(24).optional().catch(undefined),
  mat: z.enum(materialIds).optional().catch(undefined),
  o2: z.coerce.number().min(8).max(60).optional().catch(undefined),
  p: z.coerce.number().min(20).max(120).optional().catch(undefined),
  vent: z.coerce.number().min(0).max(40).optional().catch(undefined),
  mode: z.enum(["concurrent", "opposed"]).catch("concurrent"),
  heat: z.coerce.number().min(0).max(250).catch(0),
  panel: z.enum(["details"]).optional().catch(undefined),
});

export interface SceneScenario {
  view: "exterior" | "cabina";
  variant: AtmosphereVariant;
  mat: MaterialId;
  g: number;
  o2: number;
  p: number;
  vent: number;
  mode: "concurrent" | "opposed";
  heat: number;
  panel: "details" | undefined;
  undefinedAtmosphere: boolean;
  /** true si el usuario cambió O₂ o presión respecto a la variante. */
  custom: boolean;
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function toRecord(sp: ParamSource): Record<string, string | undefined> {
  if (sp instanceof URLSearchParams) return Object.fromEntries(sp.entries());
  return Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}

/** Lee y valida los parámetros de la escena de un módulo, aplicando sus valores por defecto. */
export function parseScenario(m: ModuleDef, sp: ParamSource): SceneScenario {
  const q = schema.parse(toRecord(sp));
  const variant = getVariant(m, q.atm);
  const mat = q.mat ?? m.defaultMaterial;
  const droplet = MATERIALS[mat].form === "droplet";
  return {
    view: q.view,
    variant,
    mat,
    g: variant.g,
    o2: q.o2 ?? variant.o2,
    p: q.p ?? variant.P,
    vent: q.vent ?? (droplet ? 0 : m.vent),
    mode: q.mode,
    heat: q.heat,
    panel: q.panel,
    undefinedAtmosphere: !!variant.undefinedAtmosphere,
    custom: q.o2 !== undefined || q.p !== undefined,
  };
}

/** Configuración del motor físico para un módulo y su escenario. */
export function toSimConfig(m: ModuleDef, s: SceneScenario): SimConfig {
  return { g: s.g, o2: s.o2, P: s.p, vent: s.vent, mat: s.mat, mode: s.mode, heater: s.heat, volume: m.volume, exchange: m.exchange, auto: true };
}

export type ScenarioPatch = Partial<Record<"view" | "atm" | "mat" | "o2" | "p" | "vent" | "mode" | "heat" | "panel", string | number | null>>;

/** Aplica un parche a una cadena de consulta; `null` elimina el parámetro. */
export function patchQuery(current: string, patch: ScenarioPatch): string {
  const sp = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") sp.delete(k);
    else sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
