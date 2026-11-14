"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { l, type L } from "@/content/i18n";
import { getModule, type ModuleDef } from "@/content/modules";
import { parseScenario, type SceneScenario } from "@/features/scene/lib/scenario";

export interface ActiveEnv {
  module: ModuleDef | null;
  scenario: SceneScenario | null;
  /** Gravedad del contexto actual (g₀). */
  g: number;
  label: L;
  /** Sección de la plataforma: decide el mensaje del guía. */
  section: "home" | "module" | "cabin" | "modules" | "lab" | "guide" | "radar" | "earth" | "refs" | "settings" | "map" | "other";
}

/**
 * Ambiente activo según la ruta: el módulo abierto y su escenario, o el
 * contexto general (sitio lunar, Tierra). Lo usan el chip de ambiente, el guía
 * y el asistente. Requiere estar dentro de <Suspense> (lee los query params).
 */
export function useActiveEnv(): ActiveEnv {
  const pathname = usePathname();
  const sp = useSearchParams();
  const query = sp.toString();
  return useMemo<ActiveEnv>(() => {
    const parts = pathname.split("/").filter(Boolean);
    const m = parts[0] === "modulos" ? getModule(parts[1]) : undefined;
    if (m) {
      const scenario = parseScenario(m, new URLSearchParams(query));
      return { module: m, scenario, g: scenario.g, label: m.label, section: scenario.view === "cabina" ? "cabin" : "module" };
    }
    const first = parts[0];
    const section: ActiveEnv["section"] =
      pathname === "/" ? "home"
      : first === "modulos" ? "modules"
      : first === "laboratorio" ? "lab"
      : first === "guia" ? "guide"
      : first === "radar" ? "radar"
      : first === "tierra" ? "earth"
      : first === "referencias" ? "refs"
      : first === "ajustes" ? "settings"
      : first === "mapa" ? "map"
      : "other";
    if (section === "earth") return { module: null, scenario: null, g: 1, label: l("TIERRA", "EARTH"), section };
    return { module: null, scenario: null, g: 0.165, label: l("SITIO LUNAR", "LUNAR SITE"), section };
  }, [pathname, query]);
}
