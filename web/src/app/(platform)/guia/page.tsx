import { Suspense } from "react";
import type { Metadata } from "next";
import { GuideView } from "@/features/investigations/components/GuideView";
import { listInvestigations } from "@/features/investigations/server/investigations.service";

export const metadata: Metadata = { title: "Guide · Flame in Freefall" };

/** Guía (objetivo O1). Página delgada: pide el catálogo al servicio (SSR) y compone la vista. */
export default function GuidePage() {
  const { value } = listInvestigations();
  return (
    <Suspense fallback={null}>
      <GuideView investigations={value} />
    </Suspense>
  );
}
