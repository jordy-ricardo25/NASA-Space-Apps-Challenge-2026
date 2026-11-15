"use client";

import { useSyncExternalStore } from "react";
import { appStore } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (fn: () => void): (() => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", fn);
  return () => media.removeEventListener("change", fn);
};

/**
 * Indica si hay que reducir el movimiento: lo pide el sistema operativo
 * (`prefers-reduced-motion`) o la persona lo activó en Ajustes.
 * @returns `true` cuando no deben usarse animaciones ni avances automáticos.
 */
export function useReducedMotion(): boolean {
  const system = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const preference = useStore(appStore, (s) => s.reduceMotion);
  return system || preference;
}
