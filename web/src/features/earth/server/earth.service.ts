/**
 * Servicio de aplicaciones en la Tierra (objetivo O4). Lo usan la página
 * (SSR) y el Route Handler `/api/earth`.
 */
import { EARTH_CASES, type EarthCase } from "@/content/earth";
import { envelope, type ApiEnvelope } from "@/shared/types/api";

/** Casos de transferencia tecnológica, cada uno con su fuente. */
export function listEarthCases(): ApiEnvelope<EarthCase[]> {
  const ids = new Set(EARTH_CASES.flatMap((c) => c.sources));
  return envelope(EARTH_CASES, { data_mode: "real", kind: "catalog", sources: [...ids].map((id) => ({ id })) });
}
