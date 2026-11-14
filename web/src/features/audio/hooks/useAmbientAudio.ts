"use client";

/**
 * Firma final del hook de música ambiental.
 * TODO(audio): crear un único HTMLAudioElement en bucle tras el primer gesto del usuario,
 * guardar la preferencia en localStorage y exponer duck()/unduck() para el asistente.
 */
export interface AmbientAudio {
  enabled: boolean;
  playing: boolean;
  toggle: () => void;
  duck: () => void;
  unduck: () => void;
}

export function useAmbientAudio(): AmbientAudio {
  return { enabled: false, playing: false, toggle: () => {}, duck: () => {}, unduck: () => {} };
}
