import type { Metadata } from "next";
import { ModulesView } from "@/features/modules/components/ModulesView";

export const metadata: Metadata = { title: "Modules · Flame in Freefall" };

/** Selector de módulos: los cuatro ambientes y las herramientas de análisis. */
export default function ModulesPage() {
  return <ModulesView />;
}
