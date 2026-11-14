"use client";

import { createContext, useContext } from "react";
import { useAmbientAudio, type AmbientAudio } from "../hooks/useAmbientAudio";

const AudioContext = createContext<AmbientAudio | null>(null);

/**
 * Proveedor de audio montado en el shell. Hoy no hace nada (módulo apagado);
 * está aquí para que activarlo después no obligue a tocar el shell.
 * TODO(audio): ver README.md de este módulo.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audio = useAmbientAudio();
  return <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>;
}

/** Acceso al control de audio (duck/unduck) desde el asistente. */
export const useAudio = (): AmbientAudio | null => useContext(AudioContext);
