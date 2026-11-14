import type { Lang } from "@/content/i18n";
import { kpaToPsi } from "./units";

/** Número con decimales fijos y separador decimal según el idioma. */
export function num(x: number | null | undefined, digits = 1, lang: Lang = "es"): string {
  if (x == null || !Number.isFinite(x)) return "—";
  return x.toLocaleString(lang === "es" ? "es-ES" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Presión con la unidad elegida en Ajustes (kPa o psi). */
export function pressure(kpa: number, units: "si" | "psi", lang: Lang): string {
  return units === "psi" ? `${num(kpaToPsi(kpa), 1, lang)} psi` : `${num(kpa, 1, lang)} kPa`;
}

/** Gravedad legible: µg para microgravedad, o fracción de g. */
export function gravity(g: number, lang: Lang): string {
  if (g < 1e-3) return "µg";
  return `${num(g, g < 1 ? 3 : 0, lang).replace(/0+$/, "").replace(/[.,]$/, "")} g`;
}

/** Tiempo mm:ss. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Con signo explícito (+/−). */
export function signed(x: number, digits = 1, lang: Lang = "es"): string {
  return `${x >= 0 ? "+" : "−"}${num(Math.abs(x), digits, lang)}`;
}

/**
 * Porcentaje para variables CSS, con dos decimales. Redondear evita que el
 * servidor y el navegador difieran en el último dígito (desajuste de hidratación).
 */
export const pct = (fraction: number): string => `${(Math.max(0, Math.min(1, fraction)) * 100).toFixed(2)}%`;
