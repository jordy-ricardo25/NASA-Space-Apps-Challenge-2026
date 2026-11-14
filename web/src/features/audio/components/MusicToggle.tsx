"use client";

import { AUDIO_ENABLED } from "../config";

/**
 * Botón de música de la barra superior. Devuelve null mientras el módulo está apagado.
 * TODO(audio): botón con aria-pressed que llama a toggle() del contexto.
 */
export function MusicToggle() {
  if (!AUDIO_ENABLED) return null;
  return null;
}
