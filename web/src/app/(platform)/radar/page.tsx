import { Suspense } from "react";
import type { Metadata } from "next";
import { RadarView } from "@/features/radar/components/RadarView";
import { getTechMap } from "@/features/radar/server/radar.service";

export const metadata: Metadata = { title: "Technology radar · Flame in Freefall" };

/** Radar tecnológico (objetivo O3): evidencia → hallazgo → brecha → tecnología. */
export default function RadarPage() {
  const { value } = getTechMap();
  return (
    <Suspense fallback={null}>
      <RadarView data={value} />
    </Suspense>
  );
}
