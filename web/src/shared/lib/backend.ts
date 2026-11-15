/**
 * Cliente del backend del equipo (FastAPI, carpeta `api/` del repositorio).
 * Solo se usa en el servidor: la URL nunca llega al navegador.
 *
 * Regla de integración: cada llamada es opcional. Si no hay backend
 * configurado, si no responde a tiempo o si su respuesta no cumple el esquema
 * esperado, se devuelve `null` y el servicio de la feature sigue con su propia
 * fuente. Así, conectar o desconectar el backend nunca deja una pantalla sin datos.
 */
import type { z } from "zod";

/** URL base del backend, sin barra final; cadena vacía si no está configurado. */
export const backendUrl = (): string => (process.env.API_BASE_URL ?? "").trim().replace(/\/+$/, "");

interface BackendOptions {
  /** Tiempo máximo de espera (ms). */
  timeout?: number;
  /** Segundos que Next puede reutilizar la respuesta (0 = siempre fresca). */
  revalidate?: number;
  method?: "GET" | "POST";
  body?: unknown;
}

/**
 * Pide un recurso al backend y lo valida.
 * @returns El valor validado, o `null` si el backend no está, falla o responde otra cosa.
 */
export async function backendFetch<T>(path: string, schema: z.ZodType<T>, opts: BackendOptions = {}): Promise<T | null> {
  const base = backendUrl();
  if (!base) return null;
  const { timeout = 1500, revalidate = 0, method = "GET", body } = opts;
  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
      ...(revalidate > 0 && method === "GET" ? { next: { revalidate } } : { cache: "no-store" as const }),
    });
    if (!res.ok) return null;
    const parsed = schema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
