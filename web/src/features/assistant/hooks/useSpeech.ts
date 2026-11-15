"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/content/i18n";
import type { ApiEnvelope } from "@/shared/types/api";
import { speechChunks, speechText } from "../lib/speechText";

/** Quién pone la voz: el navegador (por defecto) o Fish Audio si está configurado. */
export type VoiceProvider = "browser" | "fish";

/** Formato del audio de Fish Audio, que se reproduce según llega. */
const STREAM_TYPE = "audio/mpeg";

const SPEECH_LANG: Record<Lang, string> = { es: "es-ES", en: "en-US" };

export interface Speech {
  /** Hay voz disponible (síntesis del navegador o Fish Audio). */
  supported: boolean;
  speaking: boolean;
  provider: VoiceProvider;
  /** Lee `text` en voz alta, sin símbolos ni enlaces. Corta lo que estuviera sonando. */
  speak: (text: string, lang: Lang) => void;
  /** Corta la voz al instante. */
  stop: () => void;
}

/**
 * Voz del asistente. Usa la voz por defecto del navegador y, si el servidor
 * tiene Fish Audio configurado, la suya (con respaldo en la del navegador si
 * falla). `speaking` sigue activo hasta que termina la última frase.
 */
export function useSpeech(): Speech {
  const [speaking, setSpeaking] = useState(false);
  const [provider, setProvider] = useState<VoiceProvider>("browser");
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const turn = useRef(0); // cada lectura tiene un turno; los avisos de turnos viejos se ignoran
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  // Audios ya sintetizados en esta sesión: volver a escuchar una respuesta no gasta cuota.
  const cache = useRef(new Map<string, Blob>());

  // El servidor dice qué voz hay; la clave nunca llega al navegador.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/asistente/tts", { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ApiEnvelope<{ provider: VoiceProvider }>>) : null))
      .then((d) => d && setProvider(d.value.provider))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, []);

  const silence = useCallback(() => {
    turn.current += 1;
    request.current?.abort();
    request.current = null;
    if (audio.current) {
      audio.current.onended = null;
      audio.current.onerror = null;
      audio.current.pause();
      audio.current = null;
    }
    if (audioUrl.current) URL.revokeObjectURL(audioUrl.current);
    audioUrl.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const stop = useCallback(() => {
    silence();
    setSpeaking(false);
  }, [silence]);

  /** Voz del navegador: una locución por frase, en cola. */
  const browserSpeak = useCallback((clean: string, lang: Lang, mine: number) => {
    if (!("speechSynthesis" in window)) {
      setSpeaking(false);
      return;
    }
    const end = (): void => {
      if (turn.current === mine) setSpeaking(false);
    };
    const chunks = speechChunks(clean);
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = SPEECH_LANG[lang];
      u.rate = 1.02;
      if (i === chunks.length - 1) u.onend = end;
      u.onerror = end;
      window.speechSynthesis.speak(u);
    });
  }, []);

  const speak = useCallback(
    (text: string, lang: Lang) => {
      silence();
      const clean = speechText(text, lang);
      if (!clean) {
        setSpeaking(false);
        return;
      }
      const mine = turn.current;
      setSpeaking(true);
      if (provider !== "fish") {
        browserSpeak(clean, lang, mine);
        return;
      }
      const ctrl = new AbortController();
      request.current = ctrl;
      const key = `${lang}:${clean}`;
      const el = new Audio();
      audio.current = el;
      let started = false;
      el.onended = () => turn.current === mine && setSpeaking(false);
      // Si Fish Audio falla antes de sonar, la respuesta se lee con la voz del navegador.
      const fail = (): void => {
        if (turn.current !== mine) return;
        if (started) setSpeaking(false);
        else browserSpeak(clean, lang, mine);
      };
      const playBlob = (blob: Blob): Promise<void> => {
        const url = URL.createObjectURL(blob);
        audioUrl.current = url;
        el.src = url;
        started = true;
        return el.play();
      };
      const cached = cache.current.get(key);
      if (cached) {
        playBlob(cached).catch(fail);
        return;
      }
      const keep = (blob: Blob): void => {
        if (cache.current.size >= 12) cache.current.clear();
        cache.current.set(key, blob);
      };
      fetch("/api/asistente/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean, lang }),
        signal: ctrl.signal,
      })
        .then(async (r) => {
          if (!r.ok || !r.body) throw new Error("tts");
          // Sin reproducción por partes (MediaSource), se espera el audio completo.
          if (!("MediaSource" in window) || !MediaSource.isTypeSupported(STREAM_TYPE)) {
            const blob = await r.blob();
            keep(blob);
            if (turn.current === mine) await playBlob(blob);
            return;
          }
          // El audio empieza a sonar con el primer fragmento, sin esperar al resto.
          const media = new MediaSource();
          const url = URL.createObjectURL(media);
          audioUrl.current = url;
          el.src = url;
          await new Promise<void>((done) => media.addEventListener("sourceopen", () => done(), { once: true }));
          const buffer = media.addSourceBuffer(STREAM_TYPE);
          const reader = r.body.getReader();
          const parts: BlobPart[] = [];
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (turn.current !== mine) {
              void reader.cancel();
              return;
            }
            const chunk = new Uint8Array(value);
            parts.push(chunk);
            await new Promise<void>((ok, ko) => {
              buffer.addEventListener("updateend", () => ok(), { once: true });
              buffer.addEventListener("error", () => ko(new Error("buffer")), { once: true });
              buffer.appendBuffer(chunk);
            });
            if (!started) {
              started = true;
              el.play().catch(fail);
            }
          }
          if (media.readyState === "open") media.endOfStream();
          keep(new Blob(parts, { type: STREAM_TYPE }));
        })
        .catch(fail);
    },
    [browserSpeak, provider, silence],
  );

  // Al cerrar el chat la voz se corta.
  useEffect(() => silence, [silence]);

  return { supported: supported || provider === "fish", speaking, provider, speak, stop };
}
