/**
 * Conversión de unidades (documento maestro §12.6). Única fuente de verdad:
 * ningún componente convierte por su cuenta. El sistema interno usa kPa, cm/s,
 * % en volumen y fracciones de g₀.
 */

export const KPA_PER_ATM = 101.325;
export const KPA_PER_PSI = 6.89476;
export const KPA_PER_MMHG = 0.133322;
export const G0 = 9.80665; // m/s²
export const X_O2_AIR = 0.209;
export const P_STD_KPA = 101.325;

export const psiToKpa = (psi: number): number => psi * KPA_PER_PSI;
export const kpaToPsi = (kpa: number): number => kpa / KPA_PER_PSI;
export const atmToKpa = (atm: number): number => atm * KPA_PER_ATM;
export const mmHgToKpa = (mmHg: number): number => mmHg * KPA_PER_MMHG;
export const cmsToMs = (cms: number): number => cms * 0.01;
export const pctToFraction = (pct: number): number => pct * 0.01;
export const kcalToKj = (kcal: number): number => kcal * 4.184;
export const fahrenheitToCelsius = (f: number): number => ((f - 32) * 5) / 9;

/** Presión parcial de O₂ (kPa): ppO₂ = xO₂ · P. `o2Pct` en % en volumen. */
export const ppO2 = (o2Pct: number, pKpa: number): number => (o2Pct / 100) * pKpa;

/** Aumento relativo de la fracción de O₂ respecto al aire terrestre (20,9 %), en %. */
export const o2EnrichmentPct = (o2Pct: number): number => (o2Pct / (X_O2_AIR * 100) - 1) * 100;

/** Moles de gas ideal en un volumen (m³) a presión (kPa) y temperatura (K). */
export const gasMoles = (pKpa: number, volumeM3: number, tempK = 295): number =>
  (pKpa * 1000 * volumeM3) / (8.314462618 * tempK);

export const clamp = (x: number, a: number, b: number): number => Math.min(b, Math.max(a, x));
export const sat = (x: number): number => clamp(x, 0, 1);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number): number => {
  const t = sat((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
