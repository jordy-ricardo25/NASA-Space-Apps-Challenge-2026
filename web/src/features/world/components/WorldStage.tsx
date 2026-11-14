"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { appStore } from "@/shared/lib/appStore";
import { bindWorld, worldStore } from "../controller";
import styles from "./WorldStage.module.scss";

/**
 * Lienzo 3D persistente del centro de mando. Vive en el layout de la
 * plataforma, así que no se desmonta al cambiar de ruta. three.js se importa
 * aquí de forma diferida: nunca se ejecuta en el servidor.
 */
export default function WorldStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    const fade = fadeRef.current;
    if (!canvas || !fade) return;
    let disposed = false;
    let instance: { dispose: () => void } | null = null;
    const { quality, reduceMotion } = appStore.get();
    const started = performance.now();

    void import("../engine/World")
      .then(({ World }) => {
        if (disposed) return;
        const world = new World(canvas, {
          fade,
          quality,
          reduceMotion,
          onProgress: (progress, stage) => appStore.set({ progress, stage }),
          onReady: () => {
            // La pantalla de carga se muestra un mínimo para que la animación se complete.
            const wait = Math.max(0, 2600 - (performance.now() - started));
            setTimeout(() => appStore.set({ booted: true }), wait);
          },
          onPick: (id) => router.push(`/modulos/${id}`),
          onHover: (hovered) => worldStore.set({ hovered }),
        });
        instance = world;
        bindWorld(world);
      })
      .catch(() => appStore.set({ noWebgl: true, booted: true, progress: 1 }));

    return () => {
      disposed = true;
      bindWorld(null);
      instance?.dispose();
    };
  }, [router]);

  return (
    <div className={styles.stage} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={fadeRef} className={styles.fade} />
    </div>
  );
}
