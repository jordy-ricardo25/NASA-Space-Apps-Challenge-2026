/**
 * Correspondencia entre los módulos de la plataforma y los ambientes del
 * backend (emberwatch API, `GET /api/meta`). El backend no tiene un ambiente
 * propio para la nave en tránsito: comparte condiciones con la ISS
 * (microgravedad, 21 % de O₂ a 1 atm).
 */
export type PsiEnvKey = "iss" | "lunar" | "rover" | "eva" | "mars";

export const PSI_ENV: Record<string, PsiEnvKey> = {
  nave: "iss",
  estacion: "iss",
  rover: "rover",
  traje: "eva",
  base: "lunar",
  marte: "mars",
};
