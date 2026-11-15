import { Suspense } from "react";
import type { Metadata } from "next";
import { GuideView } from "@/features/investigations/components/GuideView";
import { listInvestigations } from "@/features/investigations/server/investigations.service";
import { listMyths } from "@/features/investigations/server/myths.service";

export const metadata: Metadata = { title: "Guide · Flame in Freefall" };

/** Guía (objetivo O1). Página delgada: pide los catálogos a los servicios (SSR) y compone la vista. */
export default async function GuidePage() {
  const { value } = listInvestigations();
  const myths = await listMyths();
  return (
    <Suspense fallback={null}>
      <GuideView investigations={value} myths={myths.value} />
    </Suspense>
  );
}
