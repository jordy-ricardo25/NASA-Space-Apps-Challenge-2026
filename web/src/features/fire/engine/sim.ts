/**
 * Motor de escenario: evolución temporal de un fuego dentro de un ambiente
 * habitable (zona de la llama + cabina bien mezclada + detección + respuesta).
 *
 * Balance de cabina según el documento maestro §10.2:
 *  - Calorimetría por consumo de O₂: 13,1 kJ por gramo de O₂ [B2].
 *  - CO₂ y CO por energía liberada, ajustados a Saffire IV–VI [B2].
 *  - Detección por dispersión de luz: alarma a 1 %/ft de obscuración [B12].
 *  - Procedimiento ISS: tras la alarma se cortan ventilación y energía [B17].
 */
import { clamp, gasMoles, sat } from "@/shared/lib/units";
import { MATERIALS, type MaterialId } from "./materials";
import {
  ALARM_OBSC,
  T_AMB,
  buoyFlow,
  dropletK,
  dropletPower,
  frontier,
  heatRelease,
  obscuration,
  pyroX,
  sootIndex,
  spreadRate,
  surfStep,
  tigNow,
} from "./physics";

export type FireState = "none" | "burning" | "cool" | "out" | "burnout";
export type LogKey =
  | "ignition"
  | "reignition"
  | "noSustain"
  | "extinguished"
  | "radiative"
  | "cool"
  | "coolOut"
  | "burnout"
  | "dropletGone"
  | "alarm"
  | "auto"
  | "pfe"
  | "mist"
  | "ventOff"
  | "ventOn"
  | "powerCut"
  | "powerOn"
  | "venting"
  | "ventStop";

export interface SimConfig {
  /** Gravedad en múltiplos de g₀. */
  g: number;
  /** O₂ de cabina (% vol), presión (kPa) y ventilación (cm/s). */
  o2: number;
  P: number;
  vent: number;
  mat: MaterialId;
  mode: "concurrent" | "opposed";
  /** Potencia (W) de un componente eléctrico sobrecalentado. */
  heater: number;
  /** Volumen libre del compartimento (m³). */
  volume: number;
  /** Intercambio de aire con el resto del vehículo (m³/s). */
  exchange: number;
  /** Respuesta automática tras la alarma. */
  auto: boolean;
}

export interface SimState {
  cfg: SimConfig;
  t: number;
  /** Temperatura del punto caliente (°C) y su ritmo de cambio (°C/s). */
  Ts: number;
  dTs: number;
  /** Ventilación real (cm/s), presión real (kPa) y chorro inducido por el extintor (cm/s). */
  ventA: number;
  P: number;
  jet: number;
  fire: FireState;
  /** Intensidad de la llama (0–1). */
  flame: number;
  /** Avance del frente (cm), diámetro de gota (mm), tiempo en llama (s) y energía liberada (kJ). */
  x: number;
  D: number;
  tBurn: number;
  burned: number;
  /** Zona de la llama: O₂ y CO₂ (% vol) y niebla de agua (fracción másica). */
  O2l: number;
  CO2l: number;
  mist: number;
  /** Salidas instantáneas. */
  Q: number;
  v: number;
  Tf: number;
  soot: number;
  M: number;
  loc: number;
  locLo: number;
  locHi: number;
  U: number;
  K: number;
  tCool: number;
  /** Cabina bien mezclada. */
  cab: { O2: number; CO2: number; CO: number; smoke: number; T: number };
  obsc: number;
  det: number;
  alarm: boolean;
  alarmT: number | null;
  tIgn: number | null;
  act: {
    ventOff: boolean;
    powerCut: boolean;
    pfe: number;
    pfeUsed: number;
    mistT: number;
    mistUsed: number;
    venting: boolean;
  };
  log: { t: number; key: LogKey }[];
}

/** CO₂ de fondo de una cabina tripulada (ppm). */
export const CO2_BASE = 3000;

export function makeState(cfg: SimConfig): SimState {
  const m = MATERIALS[cfg.mat];
  return {
    cfg: { ...cfg },
    t: 0,
    Ts: T_AMB,
    dTs: 0,
    ventA: cfg.vent,
    P: cfg.P,
    jet: 0,
    fire: "none",
    flame: 0,
    x: 0,
    D: m.droplet?.d0 ?? 0,
    tBurn: 0,
    burned: 0,
    O2l: cfg.o2,
    CO2l: CO2_BASE / 1e4,
    mist: 0,
    Q: 0,
    v: 0,
    Tf: 0,
    soot: 0,
    M: 0,
    loc: 0,
    locLo: 0,
    locHi: 0,
    U: 0,
    K: 0,
    tCool: 0,
    cab: { O2: cfg.o2, CO2: CO2_BASE, CO: 0, smoke: 0, T: T_AMB },
    obsc: 0,
    det: 0,
    alarm: false,
    alarmT: null,
    tIgn: null,
    act: { ventOff: false, powerCut: false, pfe: 0, pfeUsed: 0, mistT: 0, mistUsed: 0, venting: false },
    log: [],
  };
}

const note = (S: SimState, key: LogKey): void => {
  S.log.push({ t: S.t, key });
  if (S.log.length > 40) S.log.shift();
};

/** Enciende la muestra si el ambiente sostiene la llama. Devuelve false si no hay margen. */
export function ignite(S: SimState): boolean {
  if (S.fire === "burning" || S.fire === "burnout") return false;
  const m = MATERIALS[S.cfg.mat];
  if (!m.frontier || S.M <= 0) {
    note(S, "noSustain");
    return false;
  }
  const again = S.fire === "out" || S.fire === "cool";
  S.fire = "burning";
  S.flame = 0.15;
  S.tBurn = 0;
  if (!again) {
    S.x = 0;
    S.D = m.droplet?.d0 ?? 0;
    S.burned = 0;
  }
  if (S.tIgn == null) S.tIgn = S.t;
  S.Ts = Math.max(S.Ts, tigNow(m, S.P));
  note(S, again ? "reignition" : "ignition");
  return true;
}

export type ActionKey = "vent" | "power" | "pfe" | "mist" | "venting";

/** Aplica una acción de respuesta de la tripulación. */
export function act(S: SimState, key: ActionKey): void {
  const a = S.act;
  if (key === "vent") {
    a.ventOff = !a.ventOff;
    note(S, a.ventOff ? "ventOff" : "ventOn");
  } else if (key === "power") {
    a.powerCut = !a.powerCut;
    note(S, a.powerCut ? "powerCut" : "powerOn");
  } else if (key === "pfe" && a.pfe <= 0) {
    a.pfe = 45;
    a.pfeUsed++;
    note(S, "pfe");
  } else if (key === "mist" && a.mistT <= 0) {
    a.mistT = 30;
    a.mistUsed++;
    note(S, "mist");
  } else if (key === "venting") {
    a.venting = !a.venting;
    note(S, a.venting ? "venting" : "ventStop");
  }
}

/** Avanza el escenario un paso de tiempo `dt` (s). */
export function step(S: SimState, dt: number): void {
  const c = S.cfg;
  const m = MATERIALS[c.mat];
  const a = S.act;
  S.t += dt;

  // ── Actuadores ────────────────────────────────────────────────────────────
  S.ventA += ((a.ventOff ? 0 : c.vent) - S.ventA) * Math.min(1, dt / 6);
  if (a.pfe > 0) a.pfe = Math.max(0, a.pfe - dt);
  if (a.mistT > 0) a.mistT = Math.max(0, a.mistT - dt);
  // Descargar un extintor induce flujo hacia la llama (Ruff 2004).
  const jetTarget = a.pfe > 0 ? 12 : a.mistT > 0 ? 5 : 0;
  S.jet += (jetTarget - S.jet) * Math.min(1, dt / 1.5);
  S.P += ((a.venting ? 30 : c.P) - S.P) * Math.min(1, dt / (a.venting ? 35 : 25));
  const U = Math.max(0.05, Math.hypot(S.ventA + S.jet, buoyFlow(c.g)));
  S.U = U;

  // ── Punto caliente (sobrecarga eléctrica) ─────────────────────────────────
  const W = a.powerCut ? 0 : c.heater;
  const T0 = S.Ts;
  S.Ts = surfStep(S.Ts, W, U, S.P, dt);
  S.dTs = (S.Ts - T0) / dt;

  // ── Zona de la llama (0,25 m³) ────────────────────────────────────────────
  const nLoc = gasMoles(S.P, 0.25);
  const kmix = (U + 0.6) / 50;
  const o2Burn = S.Q / 419.2; // mol/s de O₂: 13,1 kJ/g · 32 g/mol
  const co2Gen = (m.co2PerMJ * S.Q) / 1000; // mol/s
  const pfeMol = a.pfe > 0 ? 2.72 / 45 / 0.044 : 0; // 2,72 kg de CO₂ en 45 s
  S.O2l += dt * (kmix * (S.cab.O2 - S.O2l) - (o2Burn / nLoc) * 100);
  S.CO2l += dt * (kmix * (S.cab.CO2 / 1e4 - S.CO2l) + ((co2Gen + pfeMol * 0.4) / nLoc) * 100);
  S.O2l = clamp(S.O2l, 0, 100);
  S.CO2l = clamp(S.CO2l, 0, 70);
  // Niebla fina: en µg las gotas quedan suspendidas (St ≪ 1); con gravedad sedimentan.
  const mistTau = a.mistT > 0 ? 3 : c.g > 0.01 ? 25 : 90;
  S.mist += ((a.mistT > 0 ? 0.3 : 0) - S.mist) * Math.min(1, dt / mistTau);
  const o2Eff = S.O2l * (1 - S.CO2l / 100);

  if (m.frontier) {
    const fr = frontier(m.frontier, { g: c.g, U, P: S.P, co2: S.CO2l, mist: S.mist, heat: W });
    S.loc = fr.loc;
    S.locLo = fr.lo;
    S.locHi = fr.hi;
    S.M = o2Eff - fr.loc;
  } else {
    S.loc = S.locLo = S.locHi = NaN;
    S.M = -99;
  }

  // Ignición (o reignición) por temperatura de la superficie
  if ((S.fire === "none" || S.fire === "out") && m.frontier && S.Ts >= tigNow(m, S.P) && S.M > 0) ignite(S);

  // ── Llama ─────────────────────────────────────────────────────────────────
  if (S.fire === "burning") {
    S.tBurn += dt;
    if (S.M > 0) S.flame += (1 - S.flame) * Math.min(1, dt / 3);
    else S.flame -= dt / (S.M < -3 ? 1.5 : 5);
    S.soot = sootIndex(m, U, o2Eff, S.P, S.M);
    S.Tf = (1100 + 900 * sat(S.M / 8)) * (0.75 + 0.25 * sat(S.flame));
    if (m.droplet) {
      const d = m.droplet;
      S.K = dropletK(d, o2Eff, S.P, U, S.CO2l);
      S.D = Math.sqrt(Math.max(0, S.D * S.D - S.K * dt));
      S.Q = S.flame * dropletPower(d, S.D, S.K);
      S.v = 0;
      const dExt = d.dExt > 0 ? d.dExt * Math.pow(21 / Math.max(o2Eff, 8), 1.2) : 0.15;
      if (U < 4 && S.D > d.dRad && S.tBurn > 6) {
        // Extinción radiativa de gotas grandes en aire quieto (FLEX)
        note(S, "radiative");
        if (d.coolFlame && o2Eff > 14) {
          S.fire = "cool";
          S.tCool = 0;
          S.flame = 0.3;
          note(S, "cool");
        } else {
          S.fire = "out";
          S.flame = 0;
          S.Q = 0;
        }
      } else if (S.D <= dExt) {
        S.fire = d.dExt > 0 ? "out" : "burnout";
        S.flame = 0;
        S.Q = 0;
        note(S, d.dExt > 0 ? "extinguished" : "dropletGone");
      }
    } else {
      S.v = spreadRate(m, { U, g: c.g, o2: o2Eff, P: S.P, mode: c.mode, M: S.M });
      S.x = Math.min(m.length, S.x + S.v * dt);
      S.Q = S.flame * heatRelease(m, S.v, S.x, o2Eff, S.M);
      S.burned += S.Q * dt;
      const done = m.form === "sheet" ? S.x >= m.length : S.burned >= m.energy;
      if (done) {
        S.fire = "burnout";
        S.Q = 0;
        S.flame = 0;
        note(S, "burnout");
      }
    }
    if (S.flame <= 0.03 && S.fire === "burning") {
      if (m.droplet?.coolFlame && S.D > 1 && S.M > -5) {
        S.fire = "cool";
        S.tCool = 0;
        S.flame = 0.3;
        note(S, "cool");
      } else {
        S.fire = "out";
        S.flame = 0;
        S.Q = 0;
        note(S, "extinguished");
      }
    }
  } else if (S.fire === "cool") {
    // Llama fría: oxidación a baja temperatura (≈500–800 K), casi invisible (§4.2)
    S.tCool += dt;
    S.Tf = 430;
    S.soot = 0;
    S.K = 0.35;
    S.D = Math.sqrt(Math.max(0, S.D * S.D - S.K * dt));
    S.Q = m.droplet ? 0.12 * dropletPower(m.droplet, S.D, S.K) : 0;
    if (S.D <= 1.6 || S.tCool > 40 || o2Eff < 12) {
      S.fire = "out";
      S.flame = 0;
      S.Q = 0;
      note(S, "coolOut");
    }
  } else {
    S.Q = 0;
    S.v = 0;
    S.flame = 0;
  }

  // ── Productos y cabina bien mezclada ──────────────────────────────────────
  const burning = S.Q > 0;
  const px = pyroX(m, S.Ts, S.P);
  const pyro = S.fire === "none" || S.fire === "out" ? (m.form === "wire" ? 40 : 22) * px * px : 0; // mg/s
  const smokeGen = (burning ? S.Q * m.smoke.yield * (0.6 + S.soot) : 0) + pyro; // mg/s
  const coGen = burning ? ((m.coPerMJ * S.Q) / 1000) * (1 + 2 * (1 - sat(S.M / 4))) : pyro * 4e-7; // mol/s
  const z = S.cab;
  const n = gasMoles(S.P, c.volume, z.T + 273);
  z.O2 -= (dt * (S.Q / 419.2) * 100) / n;
  z.CO2 += (dt * (co2Gen + pfeMol) * 1e6) / n;
  z.CO += (dt * coGen * 1e6) / n;
  z.smoke += (dt * smokeGen) / c.volume;
  z.T += (dt * S.Q * 1000 * 0.6) / (n * 29);
  z.T += (dt * (T_AMB - z.T)) / 600;
  // Soporte vital: repone O₂, retira CO₂ lentamente y filtra partículas si hay ventilación.
  z.O2 += (dt * (c.o2 - z.O2)) / 900;
  z.CO2 += (dt * (CO2_BASE - z.CO2)) / 3600;
  z.smoke -= dt * z.smoke * 0.0008 * Math.min(2, S.ventA / 15);
  if (a.venting) {
    const k = dt / 60;
    z.smoke -= z.smoke * k;
    z.CO -= z.CO * k;
  }
  if (c.exchange > 0 && S.ventA > 0.5) {
    const k = (c.exchange * dt * Math.min(2, S.ventA / 15)) / c.volume;
    z.O2 += k * (c.o2 - z.O2);
    z.CO2 += k * (CO2_BASE - z.CO2);
    z.CO -= k * z.CO;
    z.smoke -= k * z.smoke;
    z.T += k * (T_AMB - z.T);
  }
  z.O2 = clamp(z.O2, 0, 100);
  z.smoke = Math.max(0, z.smoke);
  z.CO = Math.max(0, z.CO);

  // ── Detección ─────────────────────────────────────────────────────────────
  // En µg el humo no sube: solo llega al detector si la ventilación lo lleva.
  // Con gravedad sube al techo; una corriente forzada dispersa esa capa [B14].
  S.obsc = obscuration(z.smoke);
  const grav = c.g > 0.01;
  const reach = grav ? (S.ventA > 4 ? 0.75 : 1) : S.ventA > 0.5 ? 1 : 0.12;
  const tau = grav ? 250 / buoyFlow(c.g) : 300 / Math.max(S.ventA, 0.5);
  S.det += (S.obsc * m.smoke.detEff * reach - S.det) * Math.min(1, dt / tau);
  if (!S.alarm && S.det >= ALARM_OBSC) {
    S.alarm = true;
    S.alarmT = S.t;
    note(S, "alarm");
    if (c.auto) {
      a.ventOff = true;
      a.powerCut = true;
      note(S, "auto");
    }
  }
}
