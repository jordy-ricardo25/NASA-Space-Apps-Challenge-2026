import { Suspense } from "react";
import type { Metadata } from "next";
import { LabView } from "@/features/laboratory/components/LabView";
import { parseLab } from "@/features/laboratory/lib/query";
import { predictDropletK, predictSolidBoundary } from "@/features/laboratory/server/laboratory.service";

export const metadata: Metadata = { title: "Laboratory · Flame in Freefall" };

/**
 * Laboratorio (objetivo O2). Página delgada: lee el escenario de la URL, pide
 * la predicción inicial al servicio (SSR) y compone la vista.
 */
export default async function LaboratoryPage({ searchParams }: PageProps<"/laboratorio">) {
  const s = parseLab(await searchParams);
  const q = { mat: s.mat, g: s.g, o2: s.o2, p: s.p, flow: s.flow, co2: s.co2, he: s.he, undefinedAtmosphere: s.undefinedAtmosphere };
  const droplet = s.tab === "droplet";
  const boundary = predictSolidBoundary(q);
  const dropletCurve = predictDropletK(droplet ? q : { ...q, mat: "heptane", flow: 0 });
  return (
    <Suspense fallback={null}>
      <LabView initialBoundary={boundary} initialDroplet={dropletCurve} />
    </Suspense>
  );
}
