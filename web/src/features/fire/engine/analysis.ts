/**
 * Capa de interpretación (documento maestro §13.7–§13.9): margen de
 * inflamabilidad, nivel de evidencia y alertas de análisis ALR-01…09.
 *
 * Reglas que este archivo garantiza:
 *  - "Sin evidencia" nunca se convierte en "riesgo bajo".
 *  - En gravedad parcial la frontera es una predicción (nivel D) y el
 *    intervalo usa el límite más conservador disponible.
 *  - Cada alerta lleva su causa y su fuente.
 */
import { l, type L } from "@/content/i18n";
import type { ApiAlert, EvidenceLevel } from "@/shared/types/api";
import { o2EnrichmentPct, ppO2 } from "@/shared/lib/units";
import { MATERIALS, type Material, type MaterialId } from "./materials";
import { dropletK, effFlow, frontier, richardson } from "./physics";

export interface Scenario {
  mat: MaterialId;
  g: number;
  o2: number;
  P: number;
  vent: number;
  /** Diluyentes añadidos (% vol). */
  co2?: number;
  he?: number;
  /** Ambiente sin atmósfera definida (cabina marciana). */
  undefinedAtmosphere?: boolean;
}

export type RiskLevel = "high" | "caution" | "low" | "none";

/** Banda de precaución (puntos de O₂). Supuesto del equipo [S]: se usa como sensibilidad. */
export const CAUTION_BAND = 2;

export interface Assessment {
  level: RiskLevel;
  evidence: EvidenceLevel;
  /** Frontera (% O₂) con su intervalo; null si el material no tiene frontera publicada. */
  loc: number | null;
  locLo: number | null;
  locHi: number | null;
  /** Margen = O₂ del ambiente − frontera (puntos), con intervalo. */
  margin: number | null;
  marginLo: number | null;
  marginHi: number | null;
  /** Probabilidad de propagación del modelo logístico de frontera (§13.5). */
  pSpread: number | null;
  ppO2: number;
  enrichment: number;
  U: number;
  Ri: number | null;
  alerts: ApiAlert[];
  sources: string[];
}

const partialG = (g: number): boolean => g > 0.02 && g < 0.9;

/** Nivel de evidencia de la consulta (se asigna por consulta y variable, §13.9). */
export function evidenceFor(m: Material, s: Scenario): EvidenceLevel {
  const f = m.frontier;
  if (!f) return "NONE";
  if (partialG(s.g)) return "D";
  const inDomain = s.o2 >= f.domain.o2[0] && s.o2 <= f.domain.o2[1] && s.P >= f.domain.p[0] - 0.5 && s.P <= f.domain.p[1] + 0.5;
  if (s.g >= 0.9) return inDomain ? f.evidenceGround : "B";
  if (!inDomain) return f.evidenceMicro === "A" ? "B" : "D";
  return f.evidenceMicro;
}

/** Variables fuera del dominio de los datos (instalaciones de §12.3). */
export function outOfDomain(s: Scenario): L[] {
  const out: L[] = [];
  if (s.o2 > 40 || s.o2 < 10) out.push(l("fracción de O₂ (ensayado: 10–40 %)", "O₂ fraction (tested: 10–40%)"));
  if (s.P < 20 || s.P > 152) out.push(l("presión (ensayado: 20–152 kPa)", "pressure (tested: 20–152 kPa)"));
  if (s.vent > 55) out.push(l("flujo (ensayado: 0–55 cm/s)", "flow (tested: 0–55 cm/s)"));
  if (s.g > 1.05) out.push(l("gravedad (referencia: 0–1 g)", "gravity (reference: 0–1 g)"));
  return out;
}

const alert = (
  id: string,
  level: ApiAlert["level"],
  message: L,
  cause: L,
  sources: string[],
): ApiAlert => ({ id, level, message, cause, sources });

const f1 = (x: number): string => x.toFixed(1);

/** Evalúa un escenario: margen, evidencia y alertas. */
export function assess(s: Scenario): Assessment {
  const m = MATERIALS[s.mat];
  const U = effFlow(s.vent, s.g);
  const pp = ppO2(s.o2, s.P);
  const enrich = o2EnrichmentPct(s.o2);
  const alerts: ApiAlert[] = [];
  const f = m.frontier;
  const evidence = evidenceFor(m, s);
  let level: RiskLevel = "none";
  let loc: number | null = null;
  let locLo: number | null = null;
  let locHi: number | null = null;
  let margin: number | null = null;
  let mLo: number | null = null;
  let mHi: number | null = null;
  let pSpread: number | null = null;
  const o2Eff = s.o2 * (1 - (s.co2 ?? 0) / 100 - (s.he ?? 0) / 100);

  if (f) {
    const fr = frontier(f, { g: s.g, U, P: s.P, co2: s.co2, he: s.he });
    loc = fr.loc;
    locLo = fr.lo;
    locHi = fr.hi;
    margin = o2Eff - fr.loc;
    mLo = o2Eff - fr.hi;
    mHi = o2Eff - fr.lo;
    pSpread = 1 / (1 + Math.exp(-(o2Eff - fr.loc) / Math.max(0.35, f.sigma * 0.6)));
    if (mLo > 0) level = "high";
    else if (mHi < 0 && Math.abs(mHi) > CAUTION_BAND) level = "low";
    else level = "caution";

    if (level === "high")
      alerts.push(
        alert(
          "ALR-01",
          "high",
          l(`El O₂ del ambiente supera la frontera de ${m.short.es} en todo el intervalo`, `Cabin O₂ exceeds the ${m.short.en} boundary across the whole interval`),
          l(`Margen +${f1(mLo)} a +${f1(mHi)} puntos de O₂ (frontera ${f1(fr.loc)} %).`, `Margin +${f1(mLo)} to +${f1(mHi)} O₂ points (boundary ${f1(fr.loc)}%).`),
          f.sources,
        ),
      );
    if (level === "caution")
      alerts.push(
        alert(
          "ALR-02",
          "caution",
          l("El margen cruza cero o queda dentro de la banda de precaución", "The margin crosses zero or sits inside the caution band"),
          l(`Margen ${f1(mLo)} a ${f1(mHi)} puntos; banda de precaución de ${CAUTION_BAND} puntos.`, `Margin ${f1(mLo)} to ${f1(mHi)} points; ${CAUTION_BAND}-point caution band.`),
          f.sources,
        ),
      );
    if (Math.abs(U - f.uStar) <= 5 && f.origin !== "estimate" && m.form !== "droplet")
      alerts.push(
        alert(
          "ALR-06",
          "caution",
          l("Flujo cercano al de mayor inflamabilidad", "Flow close to the most flammable condition"),
          l(`Flujo efectivo ${f1(U)} cm/s; el mínimo de la curva en U de este material está cerca de ${f.uStar} cm/s.`, `Effective flow ${f1(U)} cm/s; this material's U-curve minimum sits near ${f.uStar} cm/s.`),
          ["B4", "B8", "ISSFIRE"],
        ),
      );
    if (s.g < 0.9 && f.evidenceMicro !== "A" && !partialG(s.g))
      alerts.push(
        alert(
          "ALR-08",
          "phenomenon",
          l("Material evaluado sobre todo en 1 g", "Material evaluated mostly at 1 g"),
          l("El ensayo estándar (NASA-STD-6001B, Test 1) se hace en 1 g y podría no ser conservador en baja gravedad.", "The standard test (NASA-STD-6001B Test 1) is run at 1 g and may not be conservative in low gravity."),
          ["B9", "ISSFIRE"],
        ),
      );
  } else {
    alerts.push(
      alert(
        "ALR-05",
        "none",
        l(`Sin evidencia de frontera para ${m.short.es}`, `No boundary evidence for ${m.short.en}`),
        l("Nuestras fuentes no publican un límite de O₂ comparable para este material: no se genera ningún número.", "Our sources publish no comparable O₂ limit for this material: no number is generated."),
        m.sources,
      ),
    );
  }

  if (s.o2 >= 30)
    alerts.push(
      alert(
        "ALR-03",
        "info",
        l(`Fracción de O₂ ${Math.round(enrich)} % mayor que la terrestre`, `O₂ fraction ${Math.round(enrich)}% above Earth's`),
        l(`Se respira casi igual (ppO₂ ${f1(pp)} kPa frente a 21,2 kPa), pero la llama responde a la fracción, no a la presión parcial.`, `Breathing is nearly the same (ppO₂ ${f1(pp)} kPa vs 21.2 kPa), but the flame responds to the fraction, not the partial pressure.`),
        ["CHALLENGE", "B7"],
      ),
    );
  if (partialG(s.g))
    alerts.push(
      alert(
        "ALR-04",
        "evidence",
        l("Gravedad parcial: sin datos directos en PSI", "Partial gravity: no direct PSI data"),
        l("La frontera es una predicción sin validación en gravedad parcial. NASA reporta que la gravedad lunar podría ser el peor caso; la evidencia disponible son vuelos parabólicos, centrífugas y LUCI.", "The boundary is a prediction with no partial-gravity validation. NASA reports lunar gravity could be the worst case; available evidence is parabolic flights, centrifuges and LUCI."),
        ["B7", "B8", "B5", "LUCI"],
      ),
    );
  if (s.undefinedAtmosphere)
    alerts.push(
      alert(
        "ALR-05M",
        "none",
        l("Atmósfera de cabina marciana sin definir", "Martian cabin atmosphere undefined"),
        l("Ningún documento fija todavía O₂ y presión para un hábitat en Marte. Los valores actuales son una hipótesis del usuario.", "No document yet fixes O₂ and pressure for a Mars habitat. Current values are a user hypothesis."),
        ["CHALLENGE"],
      ),
    );
  if (m.droplet?.coolFlame)
    alerts.push(
      alert(
        "ALR-07",
        "phenomenon",
        l("Posible llama fría tras apagarse la visible", "Possible cool flame after the visible one goes out"),
        l("El heptano tiene química de llama fría documentada en FLEX: que no haya luz no prueba que el fuego esté apagado (riesgo de reignición).", "Heptane has cool-flame chemistry documented in FLEX: no light does not prove the fire is out (re-ignition risk)."),
        ["FLEX15", "B3"],
      ),
    );
  const out = outOfDomain(s);
  if (out.length)
    alerts.push(
      alert(
        "ALR-09",
        "domain",
        l(`Fuera del rango de los datos en: ${out.map((o) => o.es).join(", ")}`, `Outside the data range in: ${out.map((o) => o.en).join(", ")}`),
        l("La consulta sale de las condiciones ensayadas en CIR, SoFIE, MSG y Saffire: el resultado es una extrapolación.", "The query leaves the conditions tested in CIR, SoFIE, MSG and Saffire: the result is an extrapolation."),
        ["SOFIE", "B2"],
      ),
    );

  return {
    level,
    evidence: s.undefinedAtmosphere && evidence !== "NONE" ? "D" : evidence,
    loc,
    locLo,
    locHi,
    margin,
    marginLo: mLo,
    marginHi: mHi,
    pSpread,
    ppO2: pp,
    enrichment: enrich,
    U,
    Ri: richardson(s.g, s.vent),
    alerts,
    sources: f?.sources ?? m.sources,
  };
}

export interface CurvePoint {
  u: number;
  loc: number;
  lo: number;
  hi: number;
}

/** Curva de la frontera frente a la ventilación forzada (0–40 cm/s) para una gravedad y presión. */
export function boundaryCurve(mat: MaterialId, g: number, P: number, co2 = 0, he = 0): CurvePoint[] {
  const f = MATERIALS[mat].frontier;
  if (!f) return [];
  const pts: CurvePoint[] = [];
  for (let u = 0; u <= 40; u += 1) {
    const r = frontier(f, { g, U: effFlow(u, g), P, co2, he });
    pts.push({ u, loc: r.loc, lo: r.lo, hi: r.hi });
  }
  return pts;
}

export interface RefPoint {
  mat: MaterialId;
  /** Panel de gravedad: µg, Luna o 1 g. */
  panel: "micro" | "moon" | "earth";
  u: number;
  o2: number;
  /** Para intervalos publicados (frontera entre o2 y o2Hi). */
  o2Hi?: number;
  p: number;
  outcome: "spread" | "no_spread" | "limit";
  label: string;
  origin: "measured" | "predicted";
  source: string;
}

/** Ensayos y límites publicados que se dibujan sobre el mapa de inflamabilidad (§12.4). */
export const REFERENCE_POINTS: RefPoint[] = [
  { mat: "sibal", panel: "micro", u: 20, o2: 21.7, p: 101.3, outcome: "spread", label: "Saffire 1-1 · 1.8 mm/s", origin: "measured", source: "B10" },
  { mat: "sibal", panel: "micro", u: 20, o2: 22.1, p: 101.3, outcome: "spread", label: "Saffire 2-5 · 2.1 mm/s", origin: "measured", source: "B10" },
  { mat: "sibal", panel: "micro", u: 25, o2: 22.1, p: 101.3, outcome: "spread", label: "Saffire 2-6 · 2.6 mm/s", origin: "measured", source: "B10" },
  { mat: "sibal", panel: "micro", u: 20, o2: 31.0, p: 54.1, outcome: "spread", label: "Saffire VI-2 · 3.2 kW", origin: "measured", source: "B2" },
  { mat: "sibal", panel: "micro", u: 20, o2: 22.0, p: 100, outcome: "spread", label: "Saffire IV-1 · 3.15 kW", origin: "measured", source: "B2" },
  { mat: "sibal", panel: "earth", u: 20, o2: 21.7, p: 101.3, outcome: "spread", label: "Saffire 1 g · complete", origin: "measured", source: "B10" },
  { mat: "sibal", panel: "moon", u: 0, o2: 18.6, p: 56.5, outcome: "limit", label: "Takahashi 2026a · paper 18.6%", origin: "predicted", source: "B5" },
  { mat: "pmma", panel: "micro", u: 20, o2: 22.0, p: 101.3, outcome: "spread", label: "Saffire 2-8 · anchored flame", origin: "measured", source: "B10" },
  { mat: "pmma", panel: "micro", u: 20, o2: 30.3, p: 54.6, outcome: "spread", label: "Saffire VI-3 · 3.08 kW", origin: "measured", source: "B2" },
  { mat: "pmma", panel: "micro", u: 20, o2: 28.8, p: 55.2, outcome: "spread", label: "Saffire VI-4 · 1.5 kW", origin: "measured", source: "B2" },
  { mat: "pmma", panel: "micro", u: 10, o2: 13.6, o2Hi: 22.2, p: 101.3, outcome: "limit", label: "Olson & Ferkul 2017 · 13.6–22.2%", origin: "measured", source: "OLSON17" },
  { mat: "pmma", panel: "moon", u: 0, o2: 13.2, o2Hi: 15.2, p: 57.6, outcome: "limit", label: "Olson 2024 · 13.2–15.2%", origin: "measured", source: "OLSON24" },
  { mat: "pmma", panel: "earth", u: 20, o2: 22.0, p: 101.3, outcome: "spread", label: "Saffire 1 g · accelerating", origin: "measured", source: "B10" },
  { mat: "nomex", panel: "micro", u: 20, o2: 22.1, p: 101.3, outcome: "no_spread", label: "Saffire 2-7 · no spread", origin: "measured", source: "B10" },
  { mat: "nomex", panel: "earth", u: 10, o2: 24, p: 100, outcome: "limit", label: "Thomsen 2017 · LOC 24%", origin: "measured", source: "B19" },
  { mat: "nomex", panel: "earth", u: 10, o2: 35, p: 40, outcome: "limit", label: "Thomsen 2017 · LOC 35% @40 kPa", origin: "measured", source: "B19" },
  { mat: "nomex", panel: "earth", u: 20, o2: 22.1, p: 101.3, outcome: "no_spread", label: "Saffire 1 g · ≈0", origin: "measured", source: "B10" },
];

export interface DropletCurve {
  K: number;
  d0: number;
  /** Tiempo hasta el final de la combustión visible (s) y diámetro en ese instante (mm). */
  tEnd: number;
  dEnd: number;
  /** Modo de terminación. */
  mode: "burnout" | "extinction" | "radiative_cool" | "radiative" | "no_ignition";
  points: { t: number; d2: number }[];
  /** Tramo de llama fría (heptano en aire quieto). */
  cool: { t: number; d2: number }[];
}

/** Curva D²(t) de una gota según la ley d², con el modo de terminación observado en FLEX. */
export function dropletCurve(mat: MaterialId, s: { o2: number; P: number; vent: number; g: number; co2?: number; he?: number }): DropletCurve | null {
  const m = MATERIALS[mat];
  const d = m.droplet;
  if (!d || !m.frontier) return null;
  const U = effFlow(s.vent, s.g);
  const o2Eff = s.o2 * (1 - (s.co2 ?? 0) / 100 - (s.he ?? 0) / 100);
  const fr = frontier(m.frontier, { g: s.g, U, P: s.P, co2: s.co2, he: s.he });
  const K = dropletK(d, o2Eff, s.P, U, s.co2 ?? 0, s.he ?? 0);
  const d02 = d.d0 * d.d0;
  if (o2Eff <= fr.loc) return { K, d0: d.d0, tEnd: 0, dEnd: d.d0, mode: "no_ignition", points: [{ t: 0, d2: d02 }], cool: [] };
  let tEnd = d02 / K;
  let mode: DropletCurve["mode"] = "burnout";
  const cool: { t: number; d2: number }[] = [];
  const radT = 6;
  const dAtRad = Math.sqrt(Math.max(0, d02 - K * radT));
  if (U < 4 && dAtRad > d.dRad) {
    tEnd = radT;
    mode = d.coolFlame && o2Eff > 14 ? "radiative_cool" : "radiative";
    if (mode === "radiative_cool") {
      const d2a = d02 - K * radT;
      const tCool = Math.min(40, (d2a - 1.6 * 1.6) / 0.35);
      for (let i = 0; i <= 10; i++) cool.push({ t: radT + (tCool * i) / 10, d2: d2a - 0.35 * ((tCool * i) / 10) });
    }
  } else if (d.dExt > 0) {
    const dExt = d.dExt * Math.pow(21 / Math.max(o2Eff, 8), 1.2);
    if (dExt < d.d0) {
      tEnd = (d02 - dExt * dExt) / K;
      mode = "extinction";
    }
  }
  const points: { t: number; d2: number }[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = (tEnd * i) / 24;
    points.push({ t, d2: Math.max(0, d02 - K * t) });
  }
  return { K, d0: d.d0, tEnd, dEnd: Math.sqrt(Math.max(0, d02 - K * tEnd)), mode, points, cool };
}

/** Ensayos de Saffire IV–VI a escala de nave (documento maestro §10.2.2) [B2]. */
export const SAFFIRE_CABIN = [
  { id: "IV-1", material: "SIBAL", p: 100.0, o2: 22.0, duration: 130, hrr: 3150, energy: 409, co2: 1390, co: 80 },
  { id: "V-2", material: "Cotton jersey", p: 70.7, o2: 26.2, duration: 200, hrr: 2800, energy: 560, co2: 2360, co: 83 },
  { id: "VI-2", material: "SIBAL", p: 54.1, o2: 31.0, duration: 112, hrr: 3217, energy: 580, co2: 2800, co: 120 },
  { id: "VI-3", material: "PMMA 2 sides (1 cm)", p: 54.6, o2: 30.3, duration: 780, hrr: 3080, energy: 1280, co2: 8539, co: 308 },
  { id: "VI-4", material: "PMMA 1 side (0.5 cm)", p: 55.2, o2: 28.8, duration: 1200, hrr: 1507, energy: 830, co2: 8117, co: 320 },
] as const;

/** Límites de exposición SMAC para CO (ppm), JSC 20584 rev. C. */
export const SMAC_CO = { h1: 425, h24: 100 } as const;
