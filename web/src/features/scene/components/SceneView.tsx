"use client";

import { getModule, type ModuleId } from "@/content/modules";
import { useScenario } from "../hooks/useScenario";
import { CabinConsole } from "./CabinConsole";
import { ExteriorHud } from "./ExteriorHud";

/**
 * Escena individual de un módulo. La URL decide si se ve el exterior
 * (`view` ausente) o la cabina (`?view=cabina`); el mundo 3D sigue a la URL.
 */
export function SceneView({ moduleId }: { moduleId: ModuleId }) {
  const m = getModule(moduleId)!;
  const { scenario } = useScenario(m);
  return scenario.view === "cabina" ? <CabinConsole module={m} /> : <ExteriorHud module={m} />;
}
