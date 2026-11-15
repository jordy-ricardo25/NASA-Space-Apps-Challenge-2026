"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Send, Volume2, X } from "lucide-react";
import { l, type Lang } from "@/content/i18n";
import type { ActiveEnv } from "@/features/shell/hooks/useActiveEnv";
import { MATERIALS } from "@/features/fire/engine/materials";
import { EvidenceBadge } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import type { ApiEnvelope, EvidenceLevel } from "@/shared/types/api";
import { useDictation } from "../hooks/useDictation";
import { useSpeech } from "../hooks/useSpeech";
import { featuredQuestions } from "../lib/faq";
import { Fuego, type FuegoMood } from "./Fuego";
import { VoiceBar } from "./VoiceBar";
import styles from "./ChatPanel.module.scss";

interface Message {
  role: "user" | "bot";
  text: string;
  origin?: "prepared" | "analysis" | "documents" | "none";
  citations?: { id: string; short: string; url: string }[];
  evidence?: EvidenceLevel;
}

/** Longitud máxima de una pregunta (la misma que valida la ruta). */
const MAX_QUESTION = 400;

type ChatValue = { text: string; origin: Message["origin"]; citations: Message["citations"] };

/**
 * Chat del asistente FUEGO: respuestas con origen, fuentes y nivel de
 * evidencia; dictado controlado (el micrófono llena el campo de texto y la
 * persona pulsa Enviar) y lectura en voz alta.
 * Mientras el asistente habla, el micrófono queda deshabilitado.
 */
export function ChatPanel({ env }: { env: ActiveEnv }) {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Idioma de escucha: separado del idioma de la interfaz.
  const [listenLang, setListenLang] = useState<Lang>(lang);
  const onDictated = useCallback((text: string) => setInput(text.slice(0, MAX_QUESTION)), []);
  const dictation = useDictation({ onText: onDictated });
  const speech = useSpeech();
  const { listening, stop: stopDictation } = dictation;
  const { speaking, speak, stop: stopSpeaking } = speech;
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      // Enviar cierra el micrófono (para que no vuelva a llenar el campo) y corta la voz.
      stopDictation(true);
      stopSpeaking();
      setMessages((m) => [...m, { role: "user", text: q }]);
      setInput("");
      setBusy(true);
      const s = env.scenario;
      try {
        const res = await fetch("/api/asistente/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            lang,
            context: s ? { module: env.module?.id, mat: s.mat, g: s.g, o2: s.o2, p: s.p, vent: s.vent } : undefined,
          }),
        });
        if (!res.ok) throw new Error("chat");
        const data = (await res.json()) as ApiEnvelope<ChatValue>;
        setMessages((m) => [...m, { role: "bot", text: data.value.text, origin: data.value.origin, citations: data.value.citations, evidence: data.evidence_level }]);
      } catch {
        setMessages((m) => [...m, { role: "bot", text: t(l("No pude conectar con el servicio. Inténtalo de nuevo.", "I couldn't reach the service. Please try again.")), origin: "none" }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, env, lang, stopDictation, stopSpeaking, t],
  );

  // Dictado controlado: llena el campo y nunca envía solo. Se apaga a los 30 s.
  const toggleMic = (): void => {
    if (listening) {
      stopDictation(false);
      return;
    }
    stopSpeaking(); // el asistente se calla antes de escuchar, para no oírse a sí mismo
    dictation.start(listenLang, input);
    inputRef.current?.focus();
  };

  const mood: FuegoMood = listening ? "listen" : busy ? "think" : speaking ? "talk" : "idle";
  const suggestions = [...featuredQuestions(lang)];
  if (env.scenario && env.module) {
    const mat = MATERIALS[env.scenario.mat].short[lang];
    suggestions.unshift(lang === "es" ? `¿Arde ${mat} en ${env.module.name.es.toLowerCase()}?` : `Does ${mat} burn in the ${env.module.name.en.toLowerCase()}?`);
  }

  return (
    <aside className={styles.panel} aria-label={t(l("Asistente FUEGO", "FUEGO assistant"))}>
      <header className={styles.head}>
        <Fuego gravity={env.g} size={54} mood={mood} />
        <div>
          <h2>FUEGO</h2>
          <span>
            {listening
              ? t(l("Escuchando…", "Listening…"))
              : speaking
                ? t(l("Hablando…", "Speaking…"))
                : busy
                ? t(l("Consultando fuentes…", "Checking sources…"))
                : t(l("Asistente con fuentes de NASA", "Assistant with NASA sources"))}
          </span>
        </div>
        <button type="button" onClick={() => appStore.set({ chatOpen: false })} aria-label={t(l("Cerrar", "Close"))}>
          <X size={18} />
        </button>
      </header>

      <div className={styles.list} ref={listRef}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p>{t(l("Hola, comandante. Pregúntame sobre seguridad contra incendios en el espacio.", "Welcome, commander. Ask me anything about fire safety in space."))}</p>
            <div className={styles.suggest}>
              {suggestions.slice(0, 5).map((s) => (
                <button key={s} type="button" onClick={() => void ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.user : styles.bot}`}>
            <p>{m.text}</p>
            {m.role === "bot" && (
              <div className={styles.meta}>
                {m.origin === "prepared" && <span className={styles.ok}>✓ {t(l("Respuesta verificada", "Verified answer"))}</span>}
                {m.origin === "analysis" && <span className={styles.calc}>ƒ {t(l("Calculado por el modelo", "Computed by the model"))}</span>}
                {m.origin === "none" && <span className={styles.none}>∅ {t(l("Sin fuente", "No source"))}</span>}
                {m.evidence && <EvidenceBadge level={m.evidence} />}
                {m.citations?.map((c) => (
                  <a key={c.id} href={c.url} target="_blank" rel="noreferrer">
                    {c.short}
                  </a>
                ))}
                <button type="button" onClick={() => speak(m.text, lang)} aria-label={t(l("Escuchar", "Listen"))} title={t(l("Escuchar", "Listen"))}>
                  <Volume2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className={`${styles.msg} ${styles.bot} ${styles.typing}`}>
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <VoiceBar dictation={dictation} speech={speech} listenLang={listenLang} onListenLang={setListenLang} />
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        {dictation.supported && (
          <button
            type="button"
            className={`${styles.mic} ${listening ? styles.rec : ""}`}
            onClick={toggleMic}
            disabled={speaking}
            aria-pressed={listening}
            aria-label={listening ? t(l("Detener el micrófono", "Stop the microphone")) : t(l("Dictar con el micrófono", "Dictate with the microphone"))}
            title={speaking ? t(l("El micrófono se activa cuando termina la voz", "The microphone is available when the voice ends")) : t(l("Dictar (no envía solo)", "Dictate (never auto-sends)"))}
          >
            <Mic size={16} aria-hidden="true" />
          </button>
        )}
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(l("Escribe tu pregunta…", "Type your question…"))} maxLength={MAX_QUESTION} aria-label={t(l("Pregunta", "Question"))} />
        <button type="submit" className={styles.send} disabled={busy || !input.trim()} aria-label={t(l("Enviar", "Send"))}>
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
    </aside>
  );
}
