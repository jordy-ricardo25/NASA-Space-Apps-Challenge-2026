"use client";

/**
 * Estado global de la interfaz: idioma, preferencias, arranque del motor 3D y
 * paneles abiertos. Las preferencias se guardan solo en el navegador
 * (la plataforma no tiene cuentas ni datos personales).
 */
import { DEFAULT_LANG, type L, type Lang } from "@/content/i18n";
import { createStore } from "./store";

export type Units = "si" | "psi";
export type Quality = "auto" | "high" | "low";
export type Role = "operator" | "engineer" | "researcher" | "student";

export interface AppState {
  lang: Lang;
  units: Units;
  quality: Quality;
  reduceMotion: boolean;
  role: Role;
  /** Arranque: progreso (0–1), etapa actual y fin de la carga. */
  progress: number;
  stage: L;
  booted: boolean;
  /** El motor 3D no pudo iniciar (sin WebGL). */
  noWebgl: boolean;
  chatOpen: boolean;
  teamOpen: boolean;
  online: boolean | null;
  toast: L | null;
  /** El guía ya dio la bienvenida. */
  welcomed: boolean;
}

export const appStore = createStore<AppState>({
  lang: DEFAULT_LANG,
  units: "si",
  quality: "auto",
  reduceMotion: false,
  role: "engineer",
  progress: 0,
  stage: { es: "Iniciando sistemas", en: "Starting systems" },
  booted: false,
  noWebgl: false,
  chatOpen: false,
  teamOpen: false,
  online: null,
  toast: null,
  welcomed: false,
});

const KEY = "fif:prefs:v1";
type Prefs = Pick<AppState, "lang" | "units" | "quality" | "reduceMotion" | "role" | "welcomed">;

/** Restaura las preferencias guardadas (se llama una vez al montar la plataforma). */
export function loadPrefs(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) appStore.set(JSON.parse(raw) as Partial<Prefs>);
  } catch {
    /* almacenamiento no disponible: se usan los valores por defecto */
  }
}

/** Cambia preferencias y las guarda en el navegador. */
export function setPrefs(patch: Partial<Prefs>): void {
  appStore.set(patch);
  try {
    const { lang, units, quality, reduceMotion, role, welcomed } = appStore.get();
    localStorage.setItem(KEY, JSON.stringify({ lang, units, quality, reduceMotion, role, welcomed }));
  } catch {
    /* sin almacenamiento */
  }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

/** Muestra un aviso breve (por ejemplo, al cambiar de ambiente). */
export function toast(message: L): void {
  appStore.set({ toast: message });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => appStore.set({ toast: null }), 2600);
}
