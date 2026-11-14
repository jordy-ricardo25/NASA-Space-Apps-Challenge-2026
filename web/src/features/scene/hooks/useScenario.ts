"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ModuleDef } from "@/content/modules";
import { parseScenario, patchQuery, type SceneScenario, type ScenarioPatch } from "../lib/scenario";

/**
 * Escenario activo de un módulo, leído de la URL.
 * @returns el escenario validado y dos formas de actualizarlo:
 *  - `set`: reemplaza la URL sin recargar ni añadir historial (controles deslizantes).
 *  - `go`: navega añadiendo historial (entrar a la cabina, abrir detalles).
 */
export function useScenario(m: ModuleDef): {
  scenario: SceneScenario;
  set: (patch: ScenarioPatch) => void;
  go: (patch: ScenarioPatch) => void;
  href: (patch: ScenarioPatch) => string;
} {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = sp.toString();
  const scenario = useMemo(() => parseScenario(m, new URLSearchParams(query)), [m, query]);
  const href = useCallback((patch: ScenarioPatch) => pathname + patchQuery(query, patch), [pathname, query]);
  const set = useCallback(
    (patch: ScenarioPatch) => {
      // La URL real puede ir por delante del render: se parte de window.location.
      window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
    },
    [],
  );
  const go = useCallback((patch: ScenarioPatch) => router.push(href(patch)), [router, href]);
  return { scenario, set, go, href };
}
