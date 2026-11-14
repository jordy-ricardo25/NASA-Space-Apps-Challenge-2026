/**
 * Idiomas de la plataforma. Cada texto de contenido se escribe una sola vez
 * como par { es, en }; así ambos idiomas nunca se desincronizan.
 */
export type Lang = "es" | "en";

/** Texto bilingüe. */
export interface L {
  es: string;
  en: string;
}

/** Atajo para declarar un texto bilingüe. */
export const l = (es: string, en: string): L => ({ es, en });

export const DEFAULT_LANG: Lang = process.env.NEXT_PUBLIC_DEFAULT_LANG === "en" ? "en" : "es";

export const APP_NAME = "FLAME IN FREEFALL";
export const APP_TAGLINE = l("Centro de mando de seguridad contra incendios", "Fire Safety Command Center");
