/** Configuración del módulo de audio. TODO(audio): definir la pista cuando se elija una con licencia libre. */
export const AUDIO_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MUSIC === "true";
export const AUDIO_TRACK = "/audio/ambient.mp3";
export const AUDIO_DEFAULT_VOLUME = 0.35;
