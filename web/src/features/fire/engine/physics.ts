/**
 * Física de la combustión en baja gravedad: modelo de orden reducido.
 *
 * No es CFD. Son correlaciones cuyo fundamento y calibración vienen del
 * documento maestro del proyecto (secciones §4–§10) y de las fuentes de NASA
 * citadas en cada función. Unidades: O₂ en % vol, presión en kPa, flujo en
 * cm/s, gravedad en múltiplos de g₀.
 */
import { clamp, sat } from "@/shared/lib/units";
import type { DropletModel, FrontierModel, Material } from "./materials";

/** Flujo equivalente a la flotabilidad en 1 g (cm/s). Takahashi 2026a [B5]; Urban 2025 [B6]. */
export const U_BUOY_1G = 35;

/**
 * Velocidad inducida por flotabilidad (cm/s). Escala térmica g^(1/3):
 * 15,3 / 19,3 / 25,2 / 35 cm/s para 1/12, 1/6, 3/8 y 1 g a 101,3 kPa [B5].
 */
export const buoyFlow = (g: number): number => U_BUOY_1G * Math.cbrt(Math.max(g, 0));

/**
 * Flujo efectivo que ve la llama: ventilación forzada (a lo largo de la
 * muestra) y flotabilidad (vertical) son perpendiculares, así que se combinan
 * como vectores.
 */
export const effFlow = (vent: number, g: number): number => Math.hypot(vent, buoyFlow(g));

/**
 * Número de Richardson Ri = g·β·ΔT·L / U² (documento maestro §5.5):
 * Ri ≫ 1 manda la flotabilidad; Ri ≪ 1 manda el ventilador.
 * Devuelve null si U = 0 (convección natural o difusión pura).
 */
export function richardson(g: number, ventCms: number, L = 0.1, dT = 1000): number | null {
  const u = ventCms / 100;
  if (u <= 0) return null;
  return (g * 9.80665 * (1 / 300) * dT * L) / (u * u);
}

export interface FrontierInput {
  g: number;
  /** Flujo efectivo (cm/s). */
  U: number;
  P: number;
  /** Diluyentes y agentes en la zona de la llama: CO₂ y He en % vol; niebla de agua como fracción másica. */
  co2?: number;
  he?: number;
  mist?: number;
  /** Potencia de calentamiento externo (W). */
  heat?: number;
}

export interface FrontierResult {
  /** Límite de O₂ para propagación (% vol). */
  loc: number;
  /** Intervalo de la frontera. */
  lo: number;
  hi: number;
}

/**
 * Frontera de propagación: oxígeno mínimo (% vol) con el que el frente avanza.
 *
 *  - Curva en "U" frente al flujo (§8.2.1): rama de flujo bajo por pérdidas
 *    radiativas, mínimo (MLOC) y subida por enfriamiento convectivo hasta 1 g.
 *  - Presión: LOC ∝ (101,3/P)^n (Thomsen 2017 [B19]: Nomex 24 % a 100 kPa → 35 % a 40 kPa).
 *  - Diluyentes: CO₂ y He elevan el límite por capacidad calorífica y conductividad;
 *    coeficientes ajustados a las relaciones críticas agente/O₂ de Ruff 2004 [B17]
 *    (CO₂ 1,12; He 2,1; N₂ 2,92).
 *  - Niebla de agua: enfría la llama (Mist STS-107 [B18]).
 *  - Calentamiento externo: compensa la falta de O₂ (Thomsen 2019).
 *
 * En gravedad parcial el intervalo se amplía hacia abajo con el factor de
 * compensación lunar del material (Urban 2025 [B6]): no hay ensayos directos.
 */
export function frontier(f: FrontierModel, a: FrontierInput): FrontierResult {
  const U = Math.max(0, a.U);
  const quench = f.quenchA * Math.exp(-U / f.quenchU);
  const rise = f.gravityRise * Math.pow(Math.max(0, (U - f.uStar) / (U_BUOY_1G - f.uStar)), 1.5);
  const blow = 8 * Math.pow(Math.max(0, U - 120) / 120, 2);
  const pf = Math.pow(101.3 / clamp(a.P, 15, 320), f.pExp);
  const agents = 1 + 1.62 * ((a.co2 ?? 0) / 100) + 0.4 * ((a.he ?? 0) / 100) + 2.5 * (a.mist ?? 0);
  const heat = f.heatDrop * sat((a.heat ?? 0) / 250);
  const loc = (f.locMin + quench + rise + blow) * pf * agents - heat;
  const partial = a.g > 0.02 && a.g < 0.9;
  const lo = loc - f.sigma - (partial ? f.lunarComp : 0);
  const hi = loc + f.sigma;
  return { loc, lo, hi };
}

export interface SpreadInput {
  U: number;
  g: number;
  o2: number;
  P: number;
  mode: "concurrent" | "opposed";
  /** Margen de inflamabilidad (puntos de O₂). */
  M: number;
}

/**
 * Velocidad del frente de llama (cm/s). Calibrada con Saffire-1 [B10]:
 * tela SIBAL a 20 cm/s y 21,7 % O₂ → 1,8 mm/s a favor del flujo y 1,3 mm/s en contra.
 * En gravedad, la propagación a favor de la flotabilidad se acelera (§6.1).
 */
export function spreadRate(m: Material, s: SpreadInput): number {
  if (m.form === "droplet" || m.form === "wire") return 0;
  const f = Math.pow(s.o2 / 21.7, 1.6) * Math.pow(s.P / 101.3, 0.3) * sat(s.M / 1.5) * m.spreadK;
  const Uc = Math.max(s.U, 0.5);
  const base = s.mode === "opposed" ? 0.13 * (Uc / 20) * Math.exp(1 - Uc / 20) : 0.009 * Uc;
  const buoy = s.mode === "opposed" ? 1 : 1 + 2 * Math.cbrt(Math.max(s.g, 0));
  return f * base * buoy;
}

/**
 * Potencia del fuego (kW).
 *  - Lámina delgada: Q = q_s · V_f · ancho (se consume detrás del frente).
 *  - Placa gruesa: Q = q'' · área en llama; q'' ajustado al pico de 3,08 kW de Saffire VI-3 [B2].
 */
export function heatRelease(m: Material, v: number, x: number, o2: number, M: number): number {
  if (m.form === "sheet") return m.qs * v * m.width;
  if (m.form === "slab") {
    const area = (Math.min(x, m.length) * m.width * m.sides) / 1e4;
    return m.qFlux * Math.pow(o2 / 21.7, 1.6) * sat(M / 2) * area;
  }
  return 0;
}

/**
 * Índice de hollín (0–1): decide el color de la llama. Crece con el flujo, el
 * O₂ y la presión; cerca del límite la llama es azul y tenue (§7.3).
 */
export function sootIndex(m: Material, U: number, o2: number, P: number, M: number): number {
  return sat(m.soot * (U / (U + 8)) * Math.pow(o2 / 21, 1.5) * Math.pow(P / 101.3, 0.8) * sat(0.25 + M / 6));
}

/**
 * Constante de combustión de una gota, K (mm²/s). Ley d²: D²(t) = D₀² − K·t.
 * Depende del O₂ a través del número de Spalding, K ∝ ln(1 + B) (§9.1).
 */
export function dropletK(d: DropletModel, o2: number, P: number, U: number, co2 = 0, he = 0): number {
  const b = d.b21 * (o2 / 21);
  const kO2 = Math.log(1 + b) / Math.log(1 + d.b21);
  // La convección solo acelera el quemado por encima del flujo residual de microgravedad.
  const conv = 1 + 0.3 * Math.sqrt(Math.max(0, U - 0.5) / 10);
  const dil = (1 - 0.3 * (co2 / 100)) * (1 + 0.6 * (he / 100));
  return d.k21 * kO2 * conv * dil * Math.pow(P / 101.3, 0.1);
}

/** Potencia de una gota (kW): ṁ = (π/4)·ρ·D·K. */
export function dropletPower(d: DropletModel, Dmm: number, K: number): number {
  return (Math.PI / 4) * d.rho * (Dmm / 1000) * (K * 1e-6) * d.hc * 1000;
}

/** Temperatura de ignición de la superficie (°C): baja ligeramente con la presión. */
export const tigNow = (m: Material, P: number): number => m.tig * (1 - 0.15 * (1 - clamp(P, 20, 101.3) / 101.3));

/** Coeficiente de convección (W/m²·K): cae sin flotabilidad, por eso los materiales se enfrían menos en µg (§5.3). */
export const hConv = (U: number, P: number): number => 5 + 2.2 * Math.sqrt(Math.max(U, 0)) * Math.sqrt(P / 101.3);

const HOT_C = 30; // J/K, capacidad térmica del punto caliente
const HOT_A = 0.02; // m², área de intercambio
export const T_AMB = 22;

/** Avanza la temperatura (°C) de un componente sobrecalentado con potencia W. */
export function surfStep(Ts: number, W: number, U: number, P: number, dt: number): number {
  return Ts + (dt * (W - hConv(U, P) * HOT_A * (Ts - T_AMB))) / HOT_C;
}

/** Temperatura de equilibrio del punto caliente (°C). */
export const surfEq = (W: number, U: number, P: number): number => T_AMB + W / (hConv(U, P) * HOT_A);

/** Fracción de pirólisis (0–1) antes de la ignición: genera humo sin llama. */
export function pyroX(m: Material, Ts: number, P: number): number {
  const Tig = tigNow(m, P);
  const Tp = 0.6 * Tig;
  return sat((Ts - Tp) / (Tig - Tp));
}

/**
 * Obscuración (%/ft) a partir de la concentración de humo (mg/m³).
 * La ISS alarma a 1 %/ft [B12].
 */
export const obscuration = (smokeMgM3: number): number => 100 * (1 - Math.exp(-0.0087 * smokeMgM3 * 0.3048));

export const ALARM_OBSC = 1.0;

/** Diámetro de masa media D₁.₅ (µm) de una distribución lognormal (§10.1.1). */
export const massMeanDiameter = (dCountNm: number, sigmaG: number): number =>
  (dCountNm / 1000) * Math.exp(1.5 * Math.pow(Math.log(sigmaG), 2));

/** Densidad de probabilidad lognormal (por ln D) para dibujar la firma de humo. */
export function lognormal(dUm: number, dgUm: number, sigmaG: number): number {
  const s = Math.log(sigmaG);
  const z = Math.log(dUm / dgUm) / s;
  return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI));
}
