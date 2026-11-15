import { Suspense } from "react";
import type { Metadata } from "next";
import type { ModuleId } from "@/content/modules";
import { listMyths } from "@/features/investigations/server/myths.service";
import { LocalView } from "@/features/local/components/LocalView";
import { LOCAL_ENVS } from "@/features/local/lib/local";
import { psiFor, type PsiData } from "@/features/psi/server/psi.service";

export const metadata: Metadata = { title: "PSI Analyst · Flame in Freefall" };

/**
 * Flamey local: conversación con un modelo de Ollama sobre los hallazgos de
 * NASA PSI. Página delgada: pide el ranking de cada ambiente y los mitos a
 * sus servicios y compone la vista.
 */
export default async function LocalPage() {
  const [myths, ...rankings] = await Promise.all([listMyths(), ...LOCAL_ENVS.map((id) => psiFor(id))]);
  const data: Partial<Record<ModuleId, PsiData>> = {};
  const live: ModuleId[] = [];
  LOCAL_ENVS.forEach((id, i) => {
    const ranking = rankings[i];
    if (!ranking) return;
    data[id] = ranking.value;
    if (ranking.data_mode === "real") live.push(id);
  });
  return (
    <Suspense fallback={null}>
      <LocalView data={data} live={live} myths={myths.value} />
    </Suspense>
  );
}
