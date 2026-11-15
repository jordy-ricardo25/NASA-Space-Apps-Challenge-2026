/**
 * Materiales que se pueden probar desde Flamey. Cada uno declara con qué se
 * calcula: el motor físico de la plataforma (materiales con fuente publicada),
 * el modelo del backend del equipo (emberwatch), o los dos. Un material sin
 * ninguno de los dos no aparece aquí: se pregunta por escrito y el asistente
 * responde con las fuentes, sin cifras.
 */
import { l, type L } from "@/content/i18n";
import { MATERIALS, type MaterialId } from "@/features/fire/engine/materials";

export const MATERIAL_OPTION_IDS = ["pmma", "sibal", "nomex", "wire", "heptane", "methanol", "kapton", "teflon", "silicone"] as const;
export type MaterialOptionId = (typeof MATERIAL_OPTION_IDS)[number];

export interface MaterialOption {
  id: MaterialOptionId;
  label: L;
  /** Material del motor físico (frontera con fuente); `null` si no está en el catálogo. */
  engine: MaterialId | null;
  /** Nombre del material en el backend (`MATERIAL_LOI` de api/app/engine/environments.py); `null` si no lo tiene. */
  backend: string | null;
}

const fromEngine = (id: MaterialId, backend: string | null): MaterialOption => ({ id, label: MATERIALS[id].short, engine: id, backend });

export const MATERIAL_OPTIONS: MaterialOption[] = [
  fromEngine("pmma", "PMMA"),
  fromEngine("sibal", "SIBAL"),
  fromEngine("nomex", null),
  fromEngine("wire", null),
  fromEngine("heptane", "Heptane"),
  fromEngine("methanol", "Methanol"),
  { id: "kapton", label: l("Kapton", "Kapton"), engine: null, backend: "Kapton" },
  { id: "teflon", label: l("Teflón", "Teflon"), engine: null, backend: "Teflon" },
  { id: "silicone", label: l("Silicona", "Silicone"), engine: null, backend: "Silicone" },
];

export const getMaterialOption = (id: string | null | undefined): MaterialOption | undefined => MATERIAL_OPTIONS.find((m) => m.id === id);

/** Límites de los controles (los mismos que acepta el Laboratorio en su URL). */
export const O2_RANGE = { min: 8, max: 100 } as const;
export const P_RANGE = { min: 20, max: 120 } as const;
