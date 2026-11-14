import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODULES, getModule } from "@/content/modules";
import { SceneView } from "@/features/scene/components/SceneView";

export function generateStaticParams() {
  return MODULES.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/modulos/[moduleId]">): Promise<Metadata> {
  const m = getModule((await params).moduleId);
  return { title: m ? `${m.name.en} · Flame in Freefall` : "Flame in Freefall" };
}

/** Escena individual: el mismo esqueleto para los cuatro ambientes. */
export default async function ModulePage({ params }: PageProps<"/modulos/[moduleId]">) {
  const m = getModule((await params).moduleId);
  if (!m) notFound();
  return (
    <Suspense fallback={null}>
      <SceneView moduleId={m.id} />
    </Suspense>
  );
}
