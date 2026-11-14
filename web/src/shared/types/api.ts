/**
 * Sobre común de todas las respuestas de `/api` (pautas §9.2). El backend real
 * (FastAPI) devuelve el mismo contrato, así que cambiar de origen de datos no
 * obliga a tocar ningún componente.
 */
export type DataMode = "real" | "model" | "precomputed";
export type EvidenceLevel = "A" | "B" | "C" | "D" | "NONE";

export interface SourceRef {
  /** Clave en el catálogo de fuentes (`src/content/sources.ts`). */
  id: string;
  /** Tabla, figura o sección dentro de la fuente. */
  locator?: string;
}

export interface ApiAlert {
  id: string;
  level: "high" | "caution" | "info" | "evidence" | "none" | "phenomenon" | "domain";
  message: { es: string; en: string };
  cause: { es: string; en: string };
  sources: string[];
}

export interface ApiEnvelope<T> {
  data_mode: DataMode;
  kind: "prediction" | "measurement" | "derived" | "catalog";
  value: T;
  interval?: [number, number];
  evidence_level?: EvidenceLevel;
  alerts?: ApiAlert[];
  sources: SourceRef[];
  model_version?: string;
}

/** Construye un sobre con valores por defecto coherentes. */
export function envelope<T>(
  value: T,
  extra: Partial<Omit<ApiEnvelope<T>, "value">> = {},
): ApiEnvelope<T> {
  return { data_mode: "model", kind: "catalog", sources: [], ...extra, value };
}
