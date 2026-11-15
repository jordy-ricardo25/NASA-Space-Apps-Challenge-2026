"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/content/i18n";

// Tipos mínimos de la Web Speech API (dictado), que no están en lib.dom.
interface SpeechResult {
  isFinal: boolean;
  [index: number]: { transcript: string } | undefined;
}
interface SpeechRec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult: ((e: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((e: { error?: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecCtor = new () => SpeechRec;

const getRecognition = (): SpeechRecCtor | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/** Qué está haciendo el reconocimiento ahora mismo. */
export type DictationPhase = "idle" | "starting" | "waiting" | "hearing";

/**
 * Último aviso del reconocimiento. `code` es el código de la Web Speech API
 * (`not-allowed`, `no-speech`, `network`…) o uno propio: `timeout` (30 s),
 * `stopped` (lo detuvo la persona), `ended-early` y `start-failed`.
 */
export interface DictationNotice {
  kind: "info" | "error";
  code: string;
}

/** Errores tras los que no tiene sentido volver a intentarlo solo. */
const FATAL = new Set(["not-allowed", "service-not-allowed", "audio-capture", "network", "language-not-supported", "bad-grammar"]);

/** Idioma de escucha → etiqueta BCP 47 que entiende el reconocimiento. */
export const RECOGNITION_LANG: Record<Lang, string> = { es: "es-ES", en: "en-US" };

interface DictationOptions {
  /** Recibe el texto completo del campo (lo que había + lo dictado) en vivo. */
  onText: (text: string) => void;
  /** Tiempo máximo de escucha antes de apagarse solo. */
  maxMs?: number;
}

export interface Dictation {
  /** El navegador ofrece dictado (Chrome y Edge). */
  supported: boolean;
  phase: DictationPhase;
  listening: boolean;
  notice: DictationNotice | null;
  /** Segundos que quedan antes de apagarse solo. */
  secondsLeft: number;
  /** Idioma con el que se abrió la escucha en curso. */
  activeLang: Lang | null;
  /** Empieza a escuchar en `lang`; `base` es el texto que ya había en el campo. */
  start: (lang: Lang, base: string) => void;
  /** Deja de escuchar. Nunca envía nada. Con `quiet` no deja aviso (al enviar la pregunta). */
  stop: (quiet?: boolean) => void;
}

const join = (a: string, b: string): string => [a.trim(), b.trim()].filter(Boolean).join(" ");

/**
 * Dictado controlado con la Web Speech API (`continuous` e `interimResults`
 * activos). Solo llena el campo de texto: nunca envía. Se apaga solo a los
 * 30 s. Chrome corta la sesión por su cuenta tras unos segundos de silencio;
 * mientras la persona no lo detenga y quede tiempo, la escucha se reabre sin
 * perder lo ya dictado. Expone el estado y los errores para mostrarlos.
 */
export function useDictation({ onText, maxMs = 30000 }: DictationOptions): Dictation {
  // El chat solo se monta en el navegador, así que se puede consultar aquí.
  const [supported] = useState(() => !!getRecognition());
  const [phase, setPhase] = useState<DictationPhase>("idle");
  const [notice, setNotice] = useState<DictationNotice | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activeLang, setActiveLang] = useState<Lang | null>(null);

  const rec = useRef<SpeechRec | null>(null);
  const want = useRef(false); // la persona quiere seguir escuchando
  const lang = useRef<Lang>("es");
  const base = useRef(""); // texto del campo antes de dictar
  const done = useRef(""); // dictado ya cerrado en sesiones anteriores
  const session = useRef(""); // dictado final de la sesión en curso
  const deadline = useRef(0);
  const reason = useRef<DictationNotice | null>(null);
  const quiet = useRef(false); // se detuvo al enviar: no hace falta aviso
  const lastError = useRef<string | null>(null);
  const sessionStart = useRef(0);
  const shortSessions = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ticker = useRef<ReturnType<typeof setInterval>>(undefined);
  const beginRef = useRef<() => void>(() => undefined);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  /** Cierra la escucha y deja en pantalla por qué terminó. */
  const finish = useCallback(() => {
    want.current = false;
    rec.current = null;
    clearTimeout(timeout.current);
    clearInterval(ticker.current);
    const heard = join(done.current, session.current).length > 0;
    setNotice(quiet.current ? null : reason.current ?? (lastError.current === "no-speech" && !heard ? { kind: "error", code: "no-speech" } : { kind: "info", code: heard ? "stopped" : "stopped-empty" }));
    setPhase("idle");
    setActiveLang(null);
  }, []);

  /** Abre una sesión de reconocimiento (la primera o una reapertura). */
  const begin = useCallback(() => {
    const Rec = getRecognition();
    if (!Rec) return;
    const r = new Rec();
    r.lang = RECOGNITION_LANG[lang.current];
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    session.current = "";
    r.onstart = () => setPhase((p) => (p === "starting" ? "waiting" : p));
    r.onspeechstart = () => setPhase("hearing");
    r.onspeechend = () => setPhase((p) => (p === "hearing" ? "waiting" : p));
    r.onresult = (e) => {
      if (!want.current) return; // ya se detuvo o se envió: no se vuelve a llenar el campo
      let fin = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const piece = res?.[0]?.transcript ?? "";
        if (res?.isFinal) fin = join(fin, piece);
        else interim = join(interim, piece);
      }
      session.current = fin;
      lastError.current = null;
      setPhase("hearing");
      onTextRef.current(join(base.current, join(join(done.current, fin), interim)));
    };
    r.onerror = (e) => {
      const code = e.error ?? "unknown";
      lastError.current = code;
      // "aborted" llega al detenerlo a propósito; "no-speech" permite reabrir.
      if (code === "aborted" || code === "no-speech") return;
      if (FATAL.has(code) || !want.current) {
        want.current = false;
        reason.current = { kind: "error", code };
      }
    };
    r.onend = () => {
      done.current = join(done.current, session.current);
      session.current = "";
      // Si las sesiones mueren al instante una y otra vez, se deja de insistir.
      shortSessions.current = performance.now() - sessionStart.current < 600 ? shortSessions.current + 1 : 0;
      if (shortSessions.current >= 3 && want.current) {
        want.current = false;
        reason.current = { kind: "error", code: lastError.current && lastError.current !== "aborted" ? lastError.current : "ended-early" };
      }
      if (want.current && performance.now() < deadline.current - 400) {
        setPhase("waiting");
        beginRef.current();
        return;
      }
      finish();
    };
    rec.current = r;
    sessionStart.current = performance.now();
    try {
      r.start();
    } catch {
      reason.current = { kind: "error", code: "start-failed" };
      finish();
    }
  }, [finish]);

  useEffect(() => {
    beginRef.current = begin;
  }, [begin]);

  const stop = useCallback((silent = false) => {
    if (silent) setNotice(null);
    if (!want.current && !rec.current) return;
    quiet.current = silent;
    want.current = false;
    if (rec.current) rec.current.stop();
    else finish();
  }, [finish]);

  const start = useCallback(
    (language: Lang, text: string) => {
      if (!getRecognition() || want.current) return;
      want.current = true;
      lang.current = language;
      base.current = text;
      done.current = "";
      session.current = "";
      reason.current = null;
      quiet.current = false;
      lastError.current = null;
      shortSessions.current = 0;
      deadline.current = performance.now() + maxMs;
      setNotice(null);
      setPhase("starting");
      setActiveLang(language);
      setSecondsLeft(Math.round(maxMs / 1000));
      clearTimeout(timeout.current);
      clearInterval(ticker.current);
      timeout.current = setTimeout(() => {
        reason.current = { kind: "info", code: "timeout" };
        want.current = false;
        if (rec.current) rec.current.stop();
        else finish();
      }, maxMs);
      ticker.current = setInterval(() => setSecondsLeft(Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000))), 500);
      begin();
    },
    [begin, finish, maxMs],
  );

  // Al cerrar el chat se suelta el micrófono.
  useEffect(
    () => () => {
      want.current = false;
      clearTimeout(timeout.current);
      clearInterval(ticker.current);
      if (rec.current) {
        rec.current.onend = null;
        rec.current.onresult = null;
        rec.current.abort();
      }
    },
    [],
  );

  return { supported, phase, listening: phase !== "idle", notice, secondsLeft, activeLang, start, stop };
}
