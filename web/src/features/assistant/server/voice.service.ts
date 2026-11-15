/**
 * Voz del asistente (solo servidor). Por defecto la pone el navegador; si hay
 * una clave de Fish Audio en el servidor, la respuesta se sintetiza allí.
 * Una voz clonada con Fish Audio es contenido generado con IA y así se declara
 * en la interfaz.
 */
import type { Lang } from "@/content/i18n";

export type VoiceProvider = "browser" | "fish";

const fishKey = (): string | undefined => process.env.FISH_API_KEY?.trim() || undefined;

/** Qué voz hay disponible, sin exponer ninguna clave. */
export const voiceProvider = (): VoiceProvider => (fishKey() ? "fish" : "browser");

/**
 * Sintetiza `text` con Fish Audio.
 * @returns El audio MP3 en streaming, o `null` si no está configurado o falla
 *          (el navegador lee entonces la respuesta con su propia voz).
 */
export async function synthesize(text: string, lang: Lang): Promise<ReadableStream<Uint8Array> | null> {
  const key = fishKey();
  if (!key) return null;
  const voice = process.env.FISH_VOICE_ID?.trim();
  try {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        model: process.env.FISH_MODEL?.trim() || "s2.1-pro-free",
      },
      body: JSON.stringify({ text, format: "mp3", language: lang, ...(voice ? { reference_id: voice } : {}) }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok || !res.body) {
      console.warn(`[asistente] Fish Audio respondió HTTP ${res.status}; se usa la voz del navegador.`);
      return null;
    }
    return res.body;
  } catch (e) {
    console.warn(`[asistente] Fish Audio no respondió (${e instanceof Error ? e.name : "error"}); se usa la voz del navegador.`);
    return null;
  }
}
