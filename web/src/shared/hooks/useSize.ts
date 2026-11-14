"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mide un elemento y avisa cuando cambia de tamaño. Las gráficas SVG lo usan
 * para dibujarse a tamaño real: ocupan todo su panel y los rótulos conservan
 * un tamaño de letra legible en cualquier pantalla.
 * @param fallback Tamaño usado en el servidor y antes de la primera medición.
 * @returns `ref` para el contenedor y su `width` / `height` en píxeles.
 */
export function useSize<T extends HTMLElement>(fallback: { width: number; height: number }): {
  ref: React.RefObject<T | null>;
  width: number;
  height: number;
  /** false hasta la primera medición real (evita un destello al tamaño provisional). */
  ready: boolean;
} {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ ...fallback, ready: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry?.contentRect;
      if (!r || r.width < 40 || r.height < 40) return;
      setSize((prev) =>
        prev.ready && Math.abs(prev.width - r.width) < 1 && Math.abs(prev.height - r.height) < 1 ? prev : { width: Math.round(r.width), height: Math.round(r.height), ready: true },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ...size };
}
