/**
 * Catálogo de materiales del motor físico.
 *
 * Cada parámetro declara su origen:
 *  - "measured":   valor publicado tal cual (con fuente).
 *  - "calibrated": parámetro del modelo ajustado para reproducir valores publicados.
 *  - "estimate":   orden de magnitud de ingeniería; pendiente de validar con el asesor.
 *
 * Un material sin frontera publicada (`frontier: null`) se muestra como
 * "sin evidencia" (∅): el motor nunca le inventa un límite de oxígeno.
 */
import { l, type L } from "@/content/i18n";
import type { EvidenceLevel } from "@/shared/types/api";

export type MaterialId = "sibal" | "pmma" | "nomex" | "wire" | "heptane" | "methanol";
export type FuelForm = "sheet" | "slab" | "wire" | "droplet";
export type ParamOrigin = "measured" | "calibrated" | "estimate";

/** Frontera de propagación (LOC-FS) como curva en "U" frente al flujo. */
export interface FrontierModel {
  /** O₂ mínimo (% vol) a 101,3 kPa en el flujo más desfavorable (MLOC). */
  locMin: number;
  /** Flujo (cm/s) donde está el mínimo de la U. */
  uStar: number;
  /** Puntos de O₂ que sube el límite con aire quieto (extinción por pérdidas radiativas). */
  quenchA: number;
  /** Escala (cm/s) de la rama de flujo bajo. */
  quenchU: number;
  /** Puntos de O₂ entre el MLOC y el flujo equivalente a 1 g (35 cm/s). */
  gravityRise: number;
  /** Exponente de presión: LOC ∝ (101,3 / P)^pExp. */
  pExp: number;
  /** Incertidumbre (1σ, puntos de O₂) dentro del dominio ensayado. */
  sigma: number;
  /** Factor de compensación lunar (Urban et al. 2025): amplía el intervalo hacia abajo en gravedad parcial. */
  lunarComp: number;
  /** Puntos que baja el límite con calentamiento externo intenso (0 si no hay dato). */
  heatDrop: number;
  origin: ParamOrigin;
  sources: string[];
  /** Protocolo de la frontera (evento, criterio, geometría). */
  protocol: L;
  /** Dominio ensayado en microgravedad: O₂ (%), presión (kPa) y flujo (cm/s). */
  domain: { o2: [number, number]; p: [number, number]; flow: [number, number] };
  evidenceMicro: EvidenceLevel;
  evidenceGround: EvidenceLevel;
}

export interface DropletModel {
  /** Constante de combustión K (mm²/s) en aire a 1 atm. */
  k21: number;
  /** Diámetro inicial típico (mm). */
  d0: number;
  /** Número de transferencia de Spalding en aire (orden de magnitud). */
  b21: number;
  /** Densidad del líquido (kg/m³) y calor de combustión (MJ/kg). */
  rho: number;
  hc: number;
  /** Química de llama fría documentada. */
  coolFlame: boolean;
  /** Diámetro (mm) por encima del cual la llama caliente se extingue por radiación en aire quieto. */
  dRad: number;
  /** Diámetro de extinción visible en aire (mm) para el D₀ típico; 0 si quema hasta el final. */
  dExt: number;
  sources: string[];
}

export interface Material {
  id: MaterialId;
  name: L;
  short: L;
  /** Investigación o uso con el que se asocia. */
  tag: L;
  form: FuelForm;
  /** Color de la muestra en la escena 3D. */
  color: number;
  frontier: FrontierModel | null;
  /** Factor de velocidad de propagación relativo a SIBAL. */
  spreadK: number;
  /** Calor liberado por área quemada (kJ/cm²) en láminas delgadas. */
  qs: number;
  /** Flujo de calor liberado por área en llama (kW/m²) a 21,7 % O₂, en placas gruesas. */
  qFlux: number;
  /** Energía total disponible de la muestra (kJ). */
  energy: number;
  /** Ancho, largo (cm) y número de caras que arden. */
  width: number;
  length: number;
  sides: number;
  /** Temperatura de ignición de la superficie (°C) a 101,3 kPa. */
  tig: number;
  /** Tendencia a formar hollín (0–1). */
  soot: number;
  /** Productos por energía liberada (mol/MJ). */
  co2PerMJ: number;
  coPerMJ: number;
  /** Humo: masa por energía (mg/kJ), diámetro medio por número (nm), σg y respuesta del detector de dispersión. */
  smoke: { yield: number; dCount: number; sigmaG: number; detEff: number; sources: string[] };
  droplet?: DropletModel;
  /** Origen de los parámetros de propagación y productos. */
  origin: ParamOrigin;
  sources: string[];
  note: L;
}

export const MATERIALS: Record<MaterialId, Material> = {
  sibal: {
    id: "sibal",
    name: l("Tela SIBAL (algodón 75 % / fibra de vidrio 25 %)", "SIBAL fabric (75% cotton / 25% fiberglass)"),
    short: l("Tela SIBAL", "SIBAL fabric"),
    tag: l("Saffire I–VI", "Saffire I–VI"),
    form: "sheet",
    color: 0xe7dfc6,
    frontier: {
      locMin: 15.5,
      uStar: 8,
      quenchA: 6.5,
      quenchU: 2.5,
      gravityRise: 0.82,
      pExp: 0.3,
      sigma: 0.8,
      lunarComp: 0.82,
      heatDrop: 0,
      origin: "calibrated",
      sources: ["B5", "B6", "B10", "B2"],
      protocol: l(
        "Lámina delgada de celulosa; frontera de propagación. Calibrada con la predicción de 18,6 % O₂ para papel en base lunar y el MLOC cerca de 0,01 g (Takahashi 2026a).",
        "Thin cellulosic sheet; flame-spread boundary. Calibrated to the 18.6% O₂ prediction for paper at a lunar base and the MLOC near 0.01 g (Takahashi 2026a).",
      ),
      domain: { o2: [21.5, 31], p: [54, 101.3], flow: [20, 25] },
      evidenceMicro: "A",
      evidenceGround: "A",
    },
    spreadK: 1,
    qs: 0.205,
    qFlux: 0,
    energy: 0.205 * 40.6 * 94,
    width: 40.6,
    length: 94,
    sides: 2,
    tig: 350,
    soot: 0.75,
    co2PerMJ: 1.9,
    coPerMJ: 0.08,
    smoke: { yield: 0.7, dCount: 350, sigmaG: 1.9, detEff: 1, sources: ["B11", "B13"] },
    origin: "calibrated",
    sources: ["B10", "B2"],
    note: l(
      "Material de referencia de Saffire: 1,8 mm/s a favor del flujo y 1,3 mm/s en contra a 20 cm/s (Saffire-1).",
      "Saffire reference material: 1.8 mm/s concurrent and 1.3 mm/s opposed at 20 cm/s (Saffire-1).",
    ),
  },
  pmma: {
    id: "pmma",
    name: l("PMMA (acrílico) en placa de 1 cm", "PMMA (acrylic) 1 cm slab"),
    short: l("PMMA", "PMMA"),
    tag: l("BASS-II · Saffire VI", "BASS-II · Saffire VI"),
    form: "slab",
    color: 0xb8d6dc,
    frontier: {
      locMin: 13.6,
      uStar: 10,
      quenchA: 6.5,
      quenchU: 3,
      gravityRise: 3.5,
      pExp: 0.1,
      sigma: 0.8,
      lunarComp: 1.9,
      heatDrop: 0,
      origin: "calibrated",
      sources: ["OLSON17", "OLSON24", "LIV26", "B8", "B6"],
      protocol: l(
        "PMMA grueso; frontera de propagación. Calibrada con el rango ensayado en µg (13,6–22,2 % O₂), la diferencia de 3–4 puntos entre 1 g y µg y el mínimo cerca de la gravedad lunar.",
        "Thick PMMA; flame-spread boundary. Calibrated to the µg tested range (13.6–22.2% O₂), the 3–4 point gap between 1 g and µg and the minimum near lunar gravity.",
      ),
      domain: { o2: [13.6, 30.3], p: [40, 101.3], flow: [0, 55] },
      evidenceMicro: "A",
      evidenceGround: "A",
    },
    spreadK: 0.14,
    qs: 0,
    qFlux: 12.3,
    energy: 21900,
    width: 41,
    length: 18,
    sides: 2,
    tig: 320,
    soot: 0.9,
    co2PerMJ: 2.5,
    coPerMJ: 0.09,
    smoke: { yield: 0.9, dCount: 260, sigmaG: 1.8, detEff: 0.8, sources: ["B11"] },
    origin: "calibrated",
    sources: ["B2", "B10"],
    note: l(
      "En Saffire VI la placa de dos caras alcanzó 3,08 kW y creció de forma continua hasta reducir el flujo.",
      "In Saffire VI the two-sided slab reached 3.08 kW and kept growing until the flow was reduced.",
    ),
  },
  nomex: {
    id: "nomex",
    name: l("Tejido Nomex HT90-40", "Nomex HT90-40 fabric"),
    short: l("Nomex", "Nomex"),
    tag: l("Ropa y bolsas de carga", "Clothing and cargo bags"),
    form: "sheet",
    color: 0xc9b58a,
    frontier: {
      locMin: 23.7,
      uStar: 10,
      quenchA: 5,
      quenchU: 2.5,
      gravityRise: 0.32,
      pExp: 0.41,
      sigma: 1,
      lunarComp: 0.32,
      heatDrop: 7,
      origin: "calibrated",
      sources: ["B19", "THOM19", "B6", "B10"],
      protocol: l(
        "Tejido resistente al fuego; LOC de propagación a 10 cm/s entre 40 y 100 kPa (24–35 % O₂). Con calentamiento externo propaga hasta ≈17 % O₂.",
        "Fire-resistant fabric; flame-spread LOC at 10 cm/s between 40 and 100 kPa (24–35% O₂). With external heating it spreads down to ≈17% O₂.",
      ),
      domain: { o2: [21, 35], p: [40, 101.3], flow: [10, 20] },
      evidenceMicro: "B",
      evidenceGround: "A",
    },
    spreadK: 0.6,
    qs: 0.16,
    qFlux: 0,
    energy: 0.16 * 40.6 * 94,
    width: 40.6,
    length: 94,
    sides: 2,
    tig: 500,
    soot: 0.55,
    co2PerMJ: 1.9,
    coPerMJ: 0.1,
    smoke: { yield: 0.8, dCount: 300, sigmaG: 1.8, detEff: 0.85, sources: ["B11"] },
    origin: "estimate",
    sources: ["B19", "B10"],
    note: l(
      "No propagó en Saffire-2 a 22 % O₂; en una atmósfera de exploración (34 % O₂) sí supera su límite.",
      "Did not spread in Saffire-2 at 22% O₂; in an exploration atmosphere (34% O₂) it exceeds its limit.",
    ),
  },
  wire: {
    id: "wire",
    name: l("Aislante de cable (Kapton / Teflon)", "Wire insulation (Kapton / Teflon)"),
    short: l("Aislante de cable", "Wire insulation"),
    tag: l("Aviónica · SAME", "Avionics · SAME"),
    form: "wire",
    color: 0xd9a441,
    frontier: null,
    spreadK: 0,
    qs: 0,
    qFlux: 0,
    energy: 0,
    width: 1.2,
    length: 120,
    sides: 1,
    tig: 520,
    soot: 0.6,
    co2PerMJ: 0,
    coPerMJ: 0,
    smoke: { yield: 0, dCount: 120, sigmaG: 1.7, detEff: 0.3, sources: ["B11", "B13"] },
    origin: "estimate",
    sources: ["B11", "B13", "B12"],
    note: l(
      "Sin frontera de propagación publicada en nuestras fuentes: se analiza como fuente de humo por sobrecalentamiento. Su humo fino es el que el detector de la ISS no vio con frecuencia en SAME.",
      "No published spread boundary in our sources: analysed as an overheating smoke source. Its fine smoke is the one the ISS detector frequently missed in SAME.",
    ),
  },
  heptane: {
    id: "heptane",
    name: l("Gota de n-heptano", "n-Heptane droplet"),
    short: l("n-Heptano", "n-Heptane"),
    tag: l("FLEX · llamas frías", "FLEX · cool flames"),
    form: "droplet",
    color: 0xcfe0f0,
    frontier: {
      locMin: 13,
      uStar: 6,
      quenchA: 1.5,
      quenchU: 1.5,
      gravityRise: 2,
      pExp: 0.1,
      sigma: 1.5,
      lunarComp: 2,
      heatDrop: 0,
      origin: "estimate",
      sources: ["FLEX15", "ISSFIRE"],
      protocol: l(
        "Gota aislada; índice de oxígeno límite menor en µg que en 1 g (FLEX). Valor de orden de magnitud.",
        "Isolated droplet; limiting oxygen index lower in µg than in 1 g (FLEX). Order-of-magnitude value.",
      ),
      domain: { o2: [10, 40], p: [50, 304], flow: [0, 5] },
      evidenceMicro: "A",
      evidenceGround: "B",
    },
    spreadK: 0,
    qs: 0,
    qFlux: 0,
    energy: 0,
    width: 0,
    length: 0,
    sides: 1,
    tig: 215,
    soot: 0.5,
    co2PerMJ: 1.55,
    coPerMJ: 0.05,
    smoke: { yield: 0.3, dCount: 200, sigmaG: 1.7, detEff: 0.7, sources: ["B11"] },
    droplet: { k21: 0.75, d0: 4, b21: 8.4, rho: 684, hc: 44.6, coolFlame: true, dRad: 2.6, dExt: 0, sources: ["FLEX15", "PSI69"] },
    origin: "estimate",
    sources: ["FLEX15", "PSI69"],
    note: l(
      "En FLEX, tras apagarse la llama visible de gotas grandes de heptano, siguió una llama fría casi invisible.",
      "In FLEX, after the visible flame of large heptane droplets went out, a nearly invisible cool flame kept burning.",
    ),
  },
  methanol: {
    id: "methanol",
    name: l("Gota de metanol", "Methanol droplet"),
    short: l("Metanol", "Methanol"),
    tag: l("FLEX · PSI-69", "FLEX · PSI-69"),
    form: "droplet",
    color: 0xd8ecf5,
    frontier: {
      locMin: 12.5,
      uStar: 6,
      quenchA: 1.5,
      quenchU: 1.5,
      gravityRise: 2,
      pExp: 0.1,
      sigma: 1.5,
      lunarComp: 2,
      heatDrop: 0,
      origin: "estimate",
      sources: ["FLEX15", "PSI69"],
      protocol: l(
        "Gota aislada (FLEX). Valor de orden de magnitud.",
        "Isolated droplet (FLEX). Order-of-magnitude value.",
      ),
      domain: { o2: [10, 40], p: [50, 304], flow: [0, 5] },
      evidenceMicro: "A",
      evidenceGround: "B",
    },
    spreadK: 0,
    qs: 0,
    qFlux: 0,
    energy: 0,
    width: 0,
    length: 0,
    sides: 1,
    tig: 385,
    soot: 0.05,
    co2PerMJ: 1.57,
    coPerMJ: 0.03,
    smoke: { yield: 0.02, dCount: 150, sigmaG: 1.6, detEff: 0.4, sources: ["B11"] },
    droplet: { k21: 0.478, d0: 1.92, b21: 2.8, rho: 792, hc: 19.9, coolFlame: false, dRad: 99, dExt: 0.81, sources: ["PSI69"] },
    origin: "measured",
    sources: ["PSI69"],
    note: l(
      "Ensayo 30CAL03 de PSI-69: D₀ = 1,92 mm, extinción visible a 0,81 mm tras 6,34 s (K media ≈ 0,48 mm²/s).",
      "PSI-69 test 30CAL03: D₀ = 1.92 mm, visible extinction at 0.81 mm after 6.34 s (mean K ≈ 0.48 mm²/s).",
    ),
  },
};

export const MATERIAL_LIST: Material[] = Object.values(MATERIALS);

/** Devuelve el material o SIBAL si la clave no existe. */
export const getMaterial = (id: string | null | undefined): Material =>
  (id && id in MATERIALS ? MATERIALS[id as MaterialId] : MATERIALS.sibal);
