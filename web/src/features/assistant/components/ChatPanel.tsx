"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Send, Square, Volume2, X } from "lucide-react";
import { l, type Lang } from "@/content/i18n";
import type { ActiveEnv } from "@/features/shell/hooks/useActiveEnv";
import { MATERIALS } from "@/features/fire/engine/materials";
import { EvidenceBadge } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import type { ApiEnvelope, EvidenceLevel } from "@/shared/types/api";
import { featuredQuestions } from "../lib/faq";
import { Fuego, type FuegoMood } from "./Fuego";
import styles from "./ChatPanel.module.scss";

interface Message {
  role: "user" | "bot";
  text: string;
  origin?: "prepared" | "analysis" | "documents" | "none";
  citations?: { id: string; short: string; url: string }[];
  evidence?: EvidenceLevel;
}

type ChatValue = { text: string; origin: Message["origin"]; citations: Message["citations"] };

// Tipos mínimos de la Web Speech API (dictado), que no están en lib.dom.
interface SpeechRec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecCtor = new () => SpeechRec;

const getRecognition = (): SpeechRecCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/**
 * Chat del asistente FUEGO: respuestas con origen, fuentes y nivel de
 * evidencia; dictado controlado (el micrófono llena el campo de texto y la
 * persona pulsa Enviar) y lectura en voz alta.
 */
export function ChatPanel({ env }: { env: ActiveEnv }) {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listenLang, setListenLang] = useState<Lang>(lang);
  // El chat solo se monta en el navegador (tras abrirlo), así que se puede consultar aquí.
  const [canListen] = useState(() => !!getRecognition());
  const recRef = useRef<SpeechRec | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      recRef.current?.stop();
      window.speechSynthesis?.cancel();
      clearTimeout(stopTimer.current);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "es" ? "es-ES" : "en-US";
      u.rate = 1.02;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
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
    [busy, env, lang, stopSpeaking, t],
  );

  // Dictado controlado: llena el campo y nunca envía solo. Se apaga a los 30 s.
  const toggleMic = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Rec = getRecognition();
    if (!Rec) return;
    stopSpeaking();
    const rec = new Rec();
    rec.lang = listenLang === "es" ? "es-ES" : "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i]?.[0]?.transcript ?? "";
      setInput(text.trim());
    };
    const end = (): void => {
      setListening(false);
      clearTimeout(stopTimer.current);
    };
    rec.onend = end;
    rec.onerror = end;
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      stopTimer.current = setTimeout(() => rec.stop(), 30000);
    } catch {
      end();
    }
  }, [listening, listenLang, stopSpeaking]);

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
                <button type="button" onClick={() => speak(m.text)} aria-label={t(l("Escuchar", "Listen"))} title={t(l("Escuchar", "Listen"))}>
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

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        {canListen && (
          <>
            <button type="button" className={`${styles.mic} ${listening ? styles.rec : ""}`} onClick={toggleMic} disabled={speaking} aria-pressed={listening} aria-label={t(l("Micrófono", "Microphone"))} title={t(l("Dictar (no envía solo)", "Dictate (never auto-sends)"))}>
              <Mic size={16} />
            </button>
            <button type="button" className={styles.micLang} onClick={() => setListenLang((v) => (v === "es" ? "en" : "es"))} disabled={listening} title={t(l("Idioma de escucha", "Listening language"))}>
              {listenLang.toUpperCase()}
            </button>
          </>
        )}
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(l("Escribe tu pregunta…", "Type your question…"))} maxLength={400} aria-label={t(l("Pregunta", "Question"))} />
        {speaking ? (
          <button type="button" className={styles.send} onClick={stopSpeaking} aria-label={t(l("Detener voz", "Stop voice"))}>
            <Square size={15} />
          </button>
        ) : (
          <button type="submit" className={styles.send} disabled={busy || !input.trim()} aria-label={t(l("Enviar", "Send"))}>
            <Send size={15} />
          </button>
        )}
      </form>
    </aside>
  );
}
