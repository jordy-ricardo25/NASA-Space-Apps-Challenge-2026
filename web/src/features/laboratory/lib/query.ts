/**
 * Escenario del Laboratorio en la URL (pautas §8), validado con Zod.
 * Ejemplo de la demo: /laboratorio?env=base&mat=pmma&o2=34&p=56.5&flow=10
 */
import { z } from "zod";
import { getModule, getVariant, type ModuleId } from "@/content/modules";
import { MATERIALS, type MaterialId } from "@/features/fire/engine/materials";

const materialIds = Object.keys(MATERIALS) as [MaterialId, ...MaterialId[]];
export const LAB_TABS = ["map", "droplet", "smoke", "cabin"] as const;
export type LabTab = (typeof LAB_TABS)[number];

export const labSchema = z.object({
  env: z.enum(["nave", "estacion", "rover", "base"]).catch("base"),
  atm: z.string().max(24).optional().catch(undefined),
  mat: z.enum(materialIds).optional().catch(undefined),
  o2: z.coerce.number().min(8).max(60).optional().catch(undefined),
  p: z.coerce.number().min(20).max(120).optional().catch(undefined),
  flow: z.coerce.number().min(0).max(40).optional().catch(undefined),
  co2: z.coerce.number().min(0).max(40).catch(0),
  he: z.coerce.number().min(0).max(40).catch(0),
  tab: z.enum(LAB_TABS).catch("map"),
});

export interface LabScenario {
  env: ModuleId;
  atm: string;
  mat: MaterialId;
  g: number;
  o2: number;
  p: number;
  flow: number;
  co2: number;
  he: number;
  tab: LabTab;
  undefinedAtmosphere: boolean;
}

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

/** Lee los parámetros del Laboratorio y aplica los valores del ambiente elegido. */
export function parseLab(sp: ParamSource): LabScenario {
  const rec = sp instanceof URLSearchParams ? Object.fromEntries(sp.entries()) : Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const q = labSchema.parse(rec);
  const m = getModule(q.env)!;
  const v = getVariant(m, q.atm);
  const tabMat: MaterialId | undefined = q.tab === "droplet" ? (q.mat && MATERIALS[q.mat].droplet ? q.mat : "heptane") : q.mat && MATERIALS[q.mat].droplet ? undefined : q.mat;
  return {
    env: m.id,
    atm: v.id,
    mat: tabMat ?? (q.tab === "droplet" ? "heptane" : "pmma"),
    g: v.g,
    o2: q.o2 ?? v.o2,
    p: q.p ?? v.P,
    flow: q.flow ?? (q.tab === "droplet" ? 0 : m.vent),
    co2: q.co2,
    he: q.he,
    tab: q.tab,
    undefinedAtmosphere: !!v.undefinedAtmosphere,
  };
}

/** Cuerpo de las peticiones de predicción (/api/predict/*). */
export const predictBody = z.object({
  mat: z.enum(materialIds),
  g: z.number().min(0).max(4),
  o2: z.number().min(0).max(100),
  p: z.number().min(5).max(400),
  flow: z.number().min(0).max(100),
  co2: z.number().min(0).max(60).default(0),
  he: z.number().min(0).max(60).default(0),
  undefinedAtmosphere: z.boolean().default(false),
});
export type PredictBody = z.infer<typeof predictBody>;
