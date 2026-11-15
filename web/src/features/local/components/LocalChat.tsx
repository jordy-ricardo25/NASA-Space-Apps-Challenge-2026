"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { Cpu, Database, FileCheck2, Mic, Send, SlidersHorizontal, Trash2, TriangleAlert, Volume2, Zap } from "lucide-react";
import { l, type Lang } from "@/content/i18n";
import { type AskContext } from "@/features/assistant/components/MaterialPanel";
import { VoiceBar } from "@/features/assistant/components/VoiceBar";
import { useDictation } from "@/features/assistant/hooks/useDictation";
import { useSpeech } from "@/features/assistant/hooks/useSpeech";
import { richText } from "@/features/assistant/lib/richText";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, setPrefs } from "@/shared/lib/appStore";
import { num } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import type { ApiEnvelope } from "@/shared/types/api";
import { FAST, QUICK_QUESTIONS, type LocalFinding } from "../lib/local";
import styles from "./Local.module.scss";

const MAX_QUESTION = 400;
/** Turnos anteriores que viajan con cada pregunta (los mismos que acepta la ruta). */
const HISTORY_TURNS = 6;

interface LocalMessage {
  role: "user" | "bot";
  text: string;
  /** Modelo que redactó la respuesta; `null` si salió de las cifras calculadas. */
  by?: string | null;
  citations?: { id: string; short: string; url: string }[];
  rows?: { file: string; row: number; quality: number }[];
  /** Preguntas siguientes que propone el servidor para este hallazgo. */
  suggestions?: string[];
  /** Idioma de la respuesta, para leerla en voz alta. */
  lang?: Lang;
  /** Razonamiento del modelo sin datos que lo respalden. */
  extrapolated?: boolean;
}

type LocalValue = { text: string; lang?: Lang; citations: NonNullable<LocalMessage["citations"]>; rows?: LocalMessage["rows"]; by: string | null; suggestions?: string[]; topic?: string | null; extrapolated?: boolean };

/** Escenario de la pestaña de parámetros o hallazgo recién elegido. */
export type LocalContext = AskContext & { finding?: { key: string; env: string } };

/** Lo que el resto de la pantalla puede pedirle al chat. */
export interface LocalChatHandle {
  /** Envía una pregunta, con un escenario o un hallazgo propios si no son los de la pantalla. */
  ask: (question: string, context?: LocalContext) => void;
  /** Vacía la conversación (al cambiar de hallazgo o de ambiente). */
  clear: () => void;
}

interface LocalChatProps {
  ref: Ref<LocalChatHandle>;
  /** Hallazgo de PSI sobre el que trata la conversación, con su módulo. */
  finding: (LocalFinding & { env: string }) | null;
  /** `FAST` o el nombre del modelo de Ollama elegido. */
  engine: string;
  onBusy: (busy: boolean) => void;
  hidden: boolean;
}

/**
 * Conversación de Flamey local: escribe o habla, y responde el modelo de
 * Ollama elegido (o las cifras calculadas, en modo rápido). Recuerda los
 * últimos turnos, lee la respuesta en voz alta y muestra de dónde salió.
 */
export function LocalChat({ ref, finding, engine, onBusy, hidden }: LocalChatProps) {
  const { lang, t } = useLang();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listenLang, setListenLang] = useState<Lang>(lang);
  // Las opciones de voz están plegadas; se muestran solas mientras Flamey escucha, habla o avisa de un error.
  const [voiceOpen, setVoiceOpen] = useState(false);
  const autoSpeak = useStore(appStore, (st) => st.autoSpeak);
  const autoSend = useStore(appStore, (st) => st.autoSend);
  const askRef = useRef<(question: string, context?: LocalContext) => void>(() => undefined);
  const onDictated = useCallback((text: string) => setInput(text.slice(0, MAX_QUESTION)), []);
  const onSilence = useCallback((text: string) => askRef.current(text.slice(0, MAX_QUESTION)), []);
  const dictation = useDictation({ onText: onDictated, onSilence: autoSend ? onSilence : undefined });
  const speech = useSpeech();
  const { listening, stop: stopDictation } = dictation;
  const { speaking, speak, stop: stopSpeaking } = speech;
  const listRef = useRef<HTMLDivElement>(null);
  // Temas ya respondidos en esta conversación: el servidor no vuelve a ofrecerlos.
  const covered = useRef<string[]>([]);
  // Cada conversación tiene un turno: una respuesta que llega tras vaciarla se descarta.
  const epoch = useRef(0);
  const state = useRef({ messages, busy, finding, engine, lang });
  useEffect(() => {
    state.current = { messages, busy, finding, engine, lang };
  }, [messages, busy, finding, engine, lang]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = useCallback(
    async (question: string, context?: LocalContext) => {
      const q = question.trim().slice(0, MAX_QUESTION);
      const now = state.current;
      if (!q || now.busy) return;
      stopDictation(true);
      stopSpeaking();
      const history = now.messages.slice(-HISTORY_TURNS).map((m) => ({ role: m.role, text: m.text.slice(0, 1500) }));
      setMessages((m) => [...m, { role: "user", text: q }]);
      setInput("");
      setBusy(true);
      onBusy(true);
      const mine = epoch.current;
      try {
        const res = await fetch("/api/asistente/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            lang: now.lang,
            history,
            covered: covered.current,
            engine: now.engine === FAST ? "fast" : "local",
            model: now.engine === FAST ? undefined : now.engine,
            // Una pregunta desde la pestaña de parámetros lleva su escenario; el resto trata del hallazgo elegido.
            context: context ?? (now.finding ? { finding: { key: now.finding.key, env: now.finding.env } } : undefined),
          }),
        });
        if (!res.ok) throw new Error("local");
        const data = (await res.json()) as ApiEnvelope<LocalValue>;
        if (mine !== epoch.current) return;
        if (data.value.topic && !covered.current.includes(data.value.topic)) covered.current = [...covered.current, data.value.topic].slice(-12);
        setMessages((m) => [...m, { role: "bot", text: data.value.text, by: data.value.by, citations: data.value.citations, rows: data.value.rows, suggestions: data.value.suggestions, lang: data.value.lang, extrapolated: data.value.extrapolated }]);
        if (appStore.get().autoSpeak) speak(data.value.text, data.value.lang ?? now.lang);
      } catch {
        if (mine !== epoch.current) return;
        setMessages((m) => [...m, { role: "bot", text: t(l("No pude obtener la respuesta. Revisa que el servidor siga en marcha e inténtalo de nuevo.", "I could not get the answer. Check that the server is still running and try again.")), by: null }]);
      } finally {
        if (mine === epoch.current) {
          setBusy(false);
          onBusy(false);
        }
      }
    },
    [onBusy, speak, stopDictation, stopSpeaking, t],
  );
  useEffect(() => {
    askRef.current = (question, context) => void ask(question, context);
  }, [ask]);

  const clear = useCallback(() => {
    stopSpeaking();
    epoch.current += 1;
    covered.current = [];
    state.current = { ...state.current, messages: [], busy: false };
    setMessages([]);
    setBusy(false);
    onBusy(false);
  }, [onBusy, stopSpeaking]);
  useImperativeHandle(ref, () => ({ ask: (question, context) => void ask(question, context), clear }), [ask, clear]);

  const toggleMic = (): void => {
    if (listening) {
      stopDictation(false);
      return;
    }
    stopSpeaking();
    dictation.start(listenLang, input);
  };

  // Tras una respuesta sobre un hallazgo, los botones son los temas que aún no se han tocado.
  const suggested = [...messages].reverse().find((m) => m.role === "bot")?.suggestions;

  return (
    <div className={styles.chat} hidden={hidden}>
      <p className={styles.subject}>
        <Database size={14} aria-hidden="true" />
        {finding ? (
          <span>
            {t(l("Hallazgo", "Finding"))}: <b>{finding.label}</b>
          </span>
        ) : (
          <span>{t(l("Pregunta general: elige un hallazgo del ranking para hablar de él.", "General question: pick a finding from the ranking to talk about it."))}</span>
        )}
        {messages.length > 0 && (
          <button type="button" onClick={clear} aria-label={t(l("Vaciar la conversación", "Clear the conversation"))} title={t(l("Vaciar la conversación", "Clear the conversation"))}>
            <Trash2 size={13} aria-hidden="true" />
          </button>
        )}
      </p>

      <div className={styles.messages} ref={listRef} aria-live="polite">
        {messages.length === 0 && !busy && (
          <p className={styles.empty}>
            {t(
              l(
                "Pulsa «Interpretar» en un hallazgo, escribe tu pregunta o usa el micrófono. Flamey responde con los datos de NASA PSI y recuerda lo que ya hablaron.",
                "Press “Interpret” on a finding, type your question or use the microphone. Flamey answers with NASA PSI data and remembers what you already discussed.",
              ),
            )}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.user : styles.bot}`}>
            {m.role === "user" ? (
              <p>{m.text}</p>
            ) : (
              richText(m.text).map((block, j) => (
                <p key={j} className={block.kind === "bullet" ? styles.bullet : undefined}>
                  {block.parts.map((part, k) => (part.bold ? <b key={k}>{part.text}</b> : part.text))}
                </p>
              ))
            )}
            {m.rows && m.rows.length > 0 && (
              <details className={styles.rows}>
                <summary>
                  <FileCheck2 size={13} aria-hidden="true" />
                  {t(l("Respaldo en los CSV de NASA PSI", "Backing in the NASA PSI CSVs"))} ({m.rows.length})
                </summary>
                <ul>
                  {m.rows.map((r) => (
                    <li key={`${r.file}:${r.row}`}>
                      <span>{r.file}</span>
                      <span>
                        {t(l("fila", "row"))} {r.row} · {t(l("calidad", "quality"))} {num(r.quality * 100, 0, lang)} %
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {m.role === "bot" && (
              <div className={styles.meta}>
                {m.extrapolated ? (
                  <span className={styles.byReasoning}>
                    <TriangleAlert size={12} aria-hidden="true" />
                    {t(l("Incluye razonamiento del modelo, sin evidencia", "Includes model reasoning, no evidence"))}
                  </span>
                ) : m.by ? (
                  <span className={styles.byModel}>
                    <Cpu size={12} aria-hidden="true" />
                    {t(l("Redactado por", "Written by"))} {m.by.replace(/^ollama:/, "")}
                  </span>
                ) : (
                  <span className={styles.byData}>
                    <Zap size={12} aria-hidden="true" />
                    {t(l("Cifras calculadas, sin modelo", "Computed figures, no model"))}
                  </span>
                )}
                {m.citations?.map((c) => (
                  <a key={c.id} href={c.url} target="_blank" rel="noreferrer">
                    {c.short}
                  </a>
                ))}
                <button type="button" onClick={() => speak(m.text, m.lang ?? lang)} aria-label={t(l("Escuchar", "Listen"))} title={t(l("Escuchar", "Listen"))}>
                  <Volume2 size={13} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className={`${styles.msg} ${styles.bot} ${styles.typing}`} aria-label={t(l("Flamey está respondiendo", "Flamey is answering"))}>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className={styles.quick} aria-label={t(l("Preguntas sugeridas", "Suggested questions"))}>
        {(suggested?.length ? suggested : QUICK_QUESTIONS.map((q) => t(q))).map((q) => (
          <button key={q} type="button" onClick={() => void ask(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>
      {(voiceOpen || listening || speaking || dictation.notice) && (
        <VoiceBar
          dictation={dictation}
        speech={speech}
        listenLang={listenLang}
        onListenLang={setListenLang}
        autoSpeak={autoSpeak}
        onAutoSpeak={(on) => {
          setPrefs({ autoSpeak: on });
          if (!on) stopSpeaking();
        }}
        autoSend={autoSend}
          onAutoSend={(on) => setPrefs({ autoSend: on })}
        />
      )}
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        {dictation.supported && (
          <button type="button" className={styles.mic} onClick={toggleMic} disabled={speaking} aria-pressed={listening} aria-label={listening ? t(l("Detener el micrófono", "Stop the microphone")) : t(l("Dictar con el micrófono", "Dictate with the microphone"))}>
            <Mic size={16} aria-hidden="true" />
          </button>
        )}
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(l("Escribe o dicta tu pregunta…", "Type or dictate your question…"))} maxLength={MAX_QUESTION} aria-label={t(l("Pregunta", "Question"))} />
        <button type="button" className={styles.voice} onClick={() => setVoiceOpen((open) => !open)} aria-pressed={voiceOpen} aria-label={t(l("Opciones de voz", "Voice options"))} title={t(l("Opciones de voz", "Voice options"))}>
          <SlidersHorizontal size={15} aria-hidden="true" />
        </button>
        <button type="submit" className={styles.send} disabled={busy || !input.trim()} aria-label={t(l("Enviar", "Send"))}>
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
