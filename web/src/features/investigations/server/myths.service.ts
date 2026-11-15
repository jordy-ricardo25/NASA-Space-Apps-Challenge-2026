/**
 * Servicio de "mitos y hechos" (objetivo O1). Usa las reglas que sirve el
 * backend del equipo (`GET /api/rules`) y, si no está disponible, la copia
 * tipada del contenido. Los componentes no saben de dónde llegó cada regla.
 */
import { z } from "zod";
import { l } from "@/content/i18n";
import { MYTHS, type Myth } from "@/content/myths";
import { backendFetch } from "@/shared/lib/backend";
import { envelope, type ApiEnvelope } from "@/shared/types/api";

/** Contrato de `GET /api/rules` del backend (api/app/dto.py · RulesOut). */
const rulesOut = z.object({
  rules: z.array(z.object({ id: z.string().min(1), mito: z.string().min(1), hecho: z.string().min(1), fuente: z.string().optional() })).min(1),
});

/** Quita el rótulo inicial ("Mito: ", "Falso. ") para que la interfaz ponga el suyo. */
const strip = (text: string): string => text.replace(/^\s*(Mito|Hecho)\s*:\s*/i, "").replace(/^\s*Falso\.\s*/i, "").trim();

/** Mitos y hechos de la guía oficial de NASA, cada uno con su fuente. */
export async function listMyths(): Promise<ApiEnvelope<Myth[]>> {
  const remote = await backendFetch("/api/rules", rulesOut, { revalidate: 300 });
  const local = new Map(MYTHS.map((m) => [m.id, m]));
  const value: Myth[] = remote
    ? remote.rules.map((r) => {
        const known = local.get(r.id);
        // El backend aporta el texto en español; la versión en inglés y la fuente tipada vienen del catálogo.
        return known
          ? { ...known, myth: { ...known.myth, es: strip(r.mito) }, fact: { ...known.fact, es: strip(r.hecho) } }
          : { id: r.id, myth: l(strip(r.mito), strip(r.mito)), fact: l(strip(r.hecho), strip(r.hecho)), sources: ["GUIDE15"] };
      })
    : MYTHS;
  return envelope(value, { data_mode: "real", kind: "catalog", sources: [{ id: "GUIDE15" }] });
}
