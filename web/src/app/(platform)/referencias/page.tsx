import { Suspense } from "react";
import type { Metadata } from "next";
import { ReferencesView } from "@/features/references/components/ReferencesView";
import { listReferences } from "@/features/references/server/references.service";

export const metadata: Metadata = { title: "Data and references · Flame in Freefall" };

/** Datos y referencias: fuentes, licencias y declaración de uso de IA. */
export default function ReferencesPage() {
  const { value } = listReferences();
  return (
    <Suspense fallback={null}>
      <ReferencesView groups={value} />
    </Suspense>
  );
}
