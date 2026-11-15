"use client";

import { useSyncExternalStore } from "react";

/** Teléfono o tableta: pantalla estrecha o dispositivo táctil sin ratón. */
export const HANDHELD_QUERY = "(max-width: 1100px), (pointer: coarse) and (hover: none)";

const subscribe = (fn: () => void): (() => void) => {
  const media = window.matchMedia(HANDHELD_QUERY);
  media.addEventListener("change", fn);
  return () => media.removeEventListener("change", fn);
};

/**
 * Indica si la plataforma se está usando en un teléfono o una tableta. Sirve
 * para aligerar comportamientos (avances automáticos, mensajes emergentes)
 * sin cambiar nada en escritorio.
 * @returns `true` en pantallas de hasta 1100 px o en dispositivos táctiles; en el servidor, `false`.
 */
export function useHandheld(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(HANDHELD_QUERY).matches, () => false);
}
