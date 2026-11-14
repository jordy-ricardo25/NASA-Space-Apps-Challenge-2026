"use client";

/**
 * Estado del escenario de fuego que comparte el motor 3D con la interfaz.
 * El motor publica una "foto" del estado físico varias veces por segundo; los
 * paneles solo leen esa foto (nunca tocan el motor directamente).
 */
import { createStore } from "@/shared/lib/store";
import type { FireState, LogKey, SimConfig } from "./engine/sim";

export interface FireSnapshot {
  t: number;
  fire: FireState;
  flame: number;
  /** Potencia (kW), velocidad del frente (cm/s), margen y frontera (puntos y % de O₂). */
  Q: number;
  v: number;
  M: number;
  loc: number;
  locLo: number;
  locHi: number;
  U: number;
  O2l: number;
  CO2l: number;
  Ts: number;
  tig: number;
  D: number;
  K: number;
  soot: number;
  P: number;
  ventA: number;
  x: number;
  mist: number;
  Tf: number;
  cab: { O2: number; CO2: number; CO: number; smoke: number; T: number };
  obsc: number;
  det: number;
  alarm: boolean;
  alarmT: number | null;
  tIgn: number | null;
  act: { ventOff: boolean; powerCut: boolean; pfe: number; pfeUsed: number; mistT: number; mistUsed: number; venting: boolean };
  log: { t: number; key: LogKey }[];
}

/** Series temporales para las gráficas de telemetría (un punto por segundo). */
export interface FireHistory {
  t: number[];
  q: number[];
  o2: number[];
  loc: number[];
  co: number[];
  co2: number[];
  det: number[];
}

export const emptyHistory = (): FireHistory => ({ t: [], q: [], o2: [], loc: [], co: [], co2: [], det: [] });

export interface FireStoreState {
  snap: FireSnapshot | null;
  hist: FireHistory;
  /** Contador que cambia cada vez que se añade un punto al historial. */
  histTick: number;
  speed: number;
  paused: boolean;
  cfg: SimConfig | null;
}

export const fireStore = createStore<FireStoreState>({
  snap: null,
  hist: emptyHistory(),
  histTick: 0,
  speed: 1,
  paused: false,
  cfg: null,
});
