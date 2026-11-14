import { Suspense } from "react";
import type { Metadata } from "next";
import { EarthView } from "@/features/earth/components/EarthView";
import { listEarthCases } from "@/features/earth/server/earth.service";

export const metadata: Metadata = { title: "Earth · Flame in Freefall" };

/** Aplicaciones en la Tierra (objetivo O4): casos de transferencia tecnológica. */
export default function EarthPage() {
  const { value } = listEarthCases();
  return (
    <Suspense fallback={null}>
      <EarthView cases={value} />
    </Suspense>
  );
}
