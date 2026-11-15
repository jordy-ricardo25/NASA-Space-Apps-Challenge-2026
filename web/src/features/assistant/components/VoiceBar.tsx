"use client";

import { Mic, Square, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import type { Lang } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import type { Dictation } from "../hooks/useDictation";
import type { Speech } from "../hooks/useSpeech";
import { DICTATION_NOTICE, DICTATION_PHASE, DICTATION_UNKNOWN, VOICE_TEXT } from "../lib/voiceMessages";
import styles from "./VoiceBar.module.scss";

interface VoiceBarProps {
  dictation: Dictation;
  speech: Speech;
  /** Idioma de escucha, separado del idioma de la interfaz. */
  listenLang: Lang;
  onListenLang: (lang: Lang) => void;
  /** Lectura automática de las respuestas. */
  autoSpeak: boolean;
  onAutoSpeak: (on: boolean) => void;
}

const LANGS: Lang[] = ["es", "en"];

/** Brave ofrece la API de dictado, pero su servicio está desactivado. */
const isBrave = (): boolean => typeof navigator !== "undefined" && "brave" in navigator;

/**
 * Estado de la voz del asistente: qué hace el micrófono, los errores del
 * reconocimiento (con su código, para diagnosticar), el botón que corta la
 * voz, el idioma de escucha y el interruptor de la lectura automática.
 */
export function VoiceBar({ dictation, speech, listenLang, onListenLang, autoSpeak, onAutoSpeak }: VoiceBarProps) {
  const { t } = useLang();
  const { phase, notice } = dictation;
  const heard = (dictation.activeLang ?? listenLang).toUpperCase();

  let tone: "idle" | "live" | "talk" | "error" = "idle";
  let text: string;
  let code: string | null = null;
  if (speech.speaking) {
    tone = "talk";
    text = t(VOICE_TEXT.speaking);
  } else if (phase !== "idle") {
    tone = "live";
    text = `${t(DICTATION_PHASE[phase])} ${heard} · ${dictation.secondsLeft} s`;
  } else if (notice) {
    tone = notice.kind === "error" ? "error" : "idle";
    text = t(DICTATION_NOTICE[notice.code === "network" && isBrave() ? "network-brave" : notice.code] ?? DICTATION_UNKNOWN);
    code = notice.kind === "error" ? notice.code : null;
  } else {
    text = t(!dictation.supported ? VOICE_TEXT.unsupported : isBrave() ? VOICE_TEXT.brave : VOICE_TEXT.ready);
  }
  const Icon = tone === "error" ? TriangleAlert : tone === "talk" ? Volume2 : Mic;

  return (
    <div className={styles.bar}>
      <div className={styles.status} data-tone={tone}>
        <Icon size={14} aria-hidden="true" />
        <p role="status" aria-live="polite">
          {text}
          {code && <code> ({code})</code>}
        </p>
        {speech.speaking && (
          <button type="button" className={styles.stop} onClick={speech.stop} aria-label={t(VOICE_TEXT.stopVoice)}>
            <Square size={11} aria-hidden="true" />
            {t(VOICE_TEXT.stop)}
          </button>
        )}
      </div>

      <div className={styles.options}>
        {dictation.supported && (
          <div className={styles.langs} role="group" aria-label={t(VOICE_TEXT.listenLang)}>
            <span>{t(VOICE_TEXT.listenShort)}</span>
            {LANGS.map((option) => (
              <button key={option} type="button" aria-pressed={listenLang === option} disabled={dictation.listening} onClick={() => onListenLang(option)}>
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        {speech.supported && (
          <button
            type="button"
            className={styles.auto}
            role="switch"
            aria-checked={autoSpeak}
            title={t(autoSpeak ? VOICE_TEXT.autoOn : VOICE_TEXT.autoOff)}
            onClick={() => onAutoSpeak(!autoSpeak)}
          >
            {autoSpeak ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}
            {t(VOICE_TEXT.autoRead)}
            <i aria-hidden="true" />
          </button>
        )}
      </div>
      {speech.provider === "fish" && <p className={styles.ai}>{t(VOICE_TEXT.aiVoice)}</p>}
    </div>
  );
}
