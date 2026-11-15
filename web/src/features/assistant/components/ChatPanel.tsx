"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Database, FileCheck2, FlaskConical, MessageCircle, Mic, RotateCcw, Send, Volume2, X } from "lucide-react";
import { l, type Lang } from "@/content/i18n";
import { getModule, isModuleId, getVariant } from "@/content/modules";
import { parseLab } from "@/features/laboratory/lib/query";
import type { ActiveEnv } from "@/features/shell/hooks/useActiveEnv";
import { MATERIALS } from "@/features/fire/engine/materials";
import { EvidenceBadge } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, setPrefs } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";
import { num } from "@/shared/lib/format";
import type { ApiEnvelope } from "@/shared/types/api";
import { useDictation } from "../hooks/useDictation";
import { useSpeech } from "../hooks/useSpeech";
import { chatStore, clearChat, pushMessage, showTab, type ChatMessage } from "../lib/chatStore";
import { quickQuestions } from "../lib/quickQuestions";
import { richText } from "../lib/richText";
import { Flamey, type FlameyMood } from "./Flamey";
import { MaterialPanel, type AskContext } from "./MaterialPanel";
import { VoiceBar } from "./VoiceBar";
import styles from "./ChatPanel.module.scss";

/** Longitud máxima de una pregunta (la misma que valida la ruta). */
const MAX_QUESTION = 400;

type ChatValue = { text: string; lang?: Lang; origin: ChatMessage["origin"]; citations: ChatMessage["citations"]; rows?: ChatMessage["rows"] };

/** Respuesta del asistente con sus párrafos, viñetas y negritas (sin marcas de Markdown a la vista). */
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {richText(text).map((block, i) => (
        <p key={i} className={block.kind === "bullet" ? styles.bullet : block.kind === "heading" ? styles.heading : undefined}>
          {block.parts.map((part, j) => (part.bold ? <b key={j}>{part.text}</b> : part.text))}
        </p>
      ))}
    </>
  );
}

/**
 * Chat del asistente Flamey: respuestas con origen, fuentes y nivel de
 * evidencia, en el idioma de cada pregunta; dictado (el micrófono llena el
 * campo y, con el envío automático, la pregunta sale al terminar de hablar) y lectura automática de la respuesta en voz alta.
 * Mientras el asistente habla, el micrófono queda deshabilitado.
 *
 * El chat sigue a la persona: conserva la conversación al cerrarlo o cambiar
 * de pantalla, sabe qué escenario o hallazgo de NASA PSI hay delante y ofrece
 * preguntas de un toque para ese contexto.
 */
export function ChatPanel({ env }: { env: ActiveEnv }) {
  const { t, lang } = useLang();
  const messages = useStore(chatStore, (st) => st.messages);
  const tab = useStore(chatStore, (st) => st.tab);
  const materialSeen = useStore(chatStore, (st) => st.materialSeen);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Idioma de escucha: separado del idioma de la interfaz.
  const [listenLang, setListenLang] = useState<Lang>(lang);
  const autoSpeak = useStore(appStore, (st) => st.autoSpeak);
  const autoSend = useStore(appStore, (st) => st.autoSend);
  // Hallazgo de NASA PSI fijado desde la Guía: las preguntas tratan de él hasta que se quita.
  const finding = useStore(appStore, (st) => st.chatFinding);
  const findingAsk = useStore(appStore, (st) => st.chatFindingAsk);
  // Escenario que la persona tiene delante: el de la cabina abierta o el del Laboratorio.
  const query = useSearchParams().toString();
  const scene = useMemo(() => {
    const s = env.scenario;
    if (s) return { module: env.module?.id, mat: s.mat, g: s.g, o2: s.o2, p: s.p, vent: s.vent };
    if (env.section !== "lab") return null;
    const lab = parseLab(new URLSearchParams(query));
    return { module: lab.env, mat: lab.mat, g: lab.g, o2: lab.o2, p: lab.p, vent: lab.flow };
  }, [env, query]);
  const askRef = useRef<(question: string) => void>(() => undefined);
  const onDictated = useCallback((text: string) => setInput(text.slice(0, MAX_QUESTION)), []);
  // Debounce del dictado: tras una pausa sin voz, la pregunta se envía sola.
  const onSilence = useCallback((text: string) => askRef.current(text.slice(0, MAX_QUESTION)), []);
  const dictation = useDictation({ onText: onDictated, onSilence: autoSend ? onSilence : undefined });
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
    async (question: string, tested?: AskContext) => {
      const q = question.trim();
      if (!q || busy) return;
      // Enviar cierra el micrófono (para que no vuelva a llenar el campo) y corta la voz.
      stopDictation(true);
      stopSpeaking();
      // Los últimos turnos viajan con la pregunta: el modelo recuerda la conversación.
      const history = chatStore.get().messages.slice(-6).map((m) => ({ role: m.role, text: m.text.slice(0, 1500) }));
      pushMessage({ role: "user", text: q });
      setInput("");
      setBusy(true);
      const pinned = appStore.get().chatFinding;
      try {
        const res = await fetch("/api/asistente/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            // Pista de idioma: el de la conversación o, al empezar, el de la interfaz.
            // El idioma de la conversación es el de la primera respuesta: solo decide
            // cuando una pregunta posterior es demasiado corta para reconocer el suyo.
            lang: chatStore.get().lang ?? lang,
            history,
            // Una pregunta desde la pestaña de materiales lleva el escenario probado, no el de la pantalla ni el hallazgo fijado.
            context: tested ?? (scene || pinned ? { ...(scene ?? {}), ...(pinned ? { finding: { key: pinned.key, env: pinned.env } } : {}) } : undefined),
          }),
        });
        if (!res.ok) throw new Error("chat");
        const data = (await res.json()) as ApiEnvelope<ChatValue>;
        pushMessage({ role: "bot", text: data.value.text, origin: data.value.origin, citations: data.value.citations, evidence: data.evidence_level, rows: data.value.rows });
        const answered = data.value.lang ?? lang;
        if (!chatStore.get().lang) chatStore.set({ lang: answered });
        // Lectura automática: solo el texto de la respuesta, nunca los chips de las fuentes.
        if (appStore.get().autoSpeak) speak(data.value.text, answered);
      } catch {
        pushMessage({ role: "bot", text: t(l("No pude conectar con el servicio. Inténtalo de nuevo.", "I couldn't reach the service. Please try again.")), origin: "none" });
      } finally {
        setBusy(false);
      }
    },
    [busy, scene, lang, speak, stopDictation, stopSpeaking, t],
  );

  useEffect(() => {
    askRef.current = (question: string) => void ask(question);
  }, [ask]);

  // "Preguntar a Flamey" en un hallazgo de la Guía: se pide su explicación una vez.
  useEffect(() => {
    // Se comprueba en el almacén: el efecto puede ejecutarse dos veces con los mismos valores.
    if (!findingAsk || !finding || busy || !appStore.get().chatFindingAsk) return;
    appStore.set({ chatFindingAsk: false });
    showTab("chat");
    askRef.current(lang === "es" ? `Explícame el hallazgo ${finding.label} y qué significa en este ambiente.` : `Explain the finding ${finding.label} and what it means in this environment.`);
  }, [findingAsk, finding, busy, lang]);

  // Dictado: llena el campo en vivo y se apaga a los 30 s. Con el envío
  // automático activo, la pregunta se envía cuando la persona deja de hablar.
  const toggleMic = (): void => {
    if (listening) {
      stopDictation(false);
      return;
    }
    stopSpeaking(); // el asistente se calla antes de escuchar, para no oírse a sí mismo
    dictation.start(listenLang, input);
    inputRef.current?.focus();
  };

  const toggleAutoSend = (on: boolean): void => setPrefs({ autoSend: on });

  const toggleAutoSpeak = (on: boolean): void => {
    setPrefs({ autoSpeak: on });
    if (!on) stopSpeaking();
  };

  const mood: FlameyMood = listening ? "listen" : busy ? "think" : speaking ? "talk" : "idle";
  const place = getModule(scene?.module);
  const quickContext = { finding: !!finding, scenario: scene && place ? { material: MATERIALS[scene.mat].short[lang], place: place.name[lang].toLowerCase() } : null };
  const suggestions = quickQuestions(quickContext, lang, 5);
  // Lo que Flamey tiene delante, para que se vea sobre qué va a responder.
  const watching = scene && place ? `${t(place.name)} · ${num(scene.o2, 1, lang)} % O₂ · ${MATERIALS[scene.mat].short[lang]}` : null;
  // La prueba de materiales parte de lo que hay en pantalla: el escenario abierto o el ambiente activo.
  const startModule = isModuleId(scene?.module) ? scene.module : (env.module?.id ?? "base");
  const startAtmosphere = getVariant(getModule(startModule)!, null);
  const materialStart = { module: startModule, material: scene?.mat ?? ("pmma" as const), o2: scene?.o2 ?? startAtmosphere.o2, p: scene?.p ?? startAtmosphere.P };
  const askTested = (question: string, tested: AskContext): void => {
    showTab("chat");
    void ask(question, tested);
  };
  const reset = (): void => {
    stopSpeaking();
    clearChat();
  };

  return (
    <aside className={styles.panel} aria-label={t(l("Asistente Flamey", "Flamey assistant"))}>
      <header className={styles.head}>
        <Flamey gravity={env.g} size={54} mood={mood} />
        <div>
          <h2>Flamey</h2>
          <span>
            {listening
              ? t(l("Escuchando…", "Listening…"))
              : speaking
                ? t(l("Hablando…", "Speaking…"))
                : busy
                ? t(l("Consultando fuentes…", "Checking sources…"))
                : watching
                  ? `${t(l("Viendo", "Looking at"))}: ${watching}`
                  : t(l("Asistente con fuentes de NASA", "Assistant with NASA sources"))}
          </span>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={reset} disabled={busy} aria-label={t(l("Empezar una conversación nueva", "Start a new conversation"))} title={t(l("Conversación nueva", "New conversation"))}>
            <RotateCcw size={16} />
          </button>
        )}
        <button type="button" onClick={() => appStore.set({ chatOpen: false })} aria-label={t(l("Cerrar", "Close"))}>
          <X size={18} />
        </button>
      </header>

      <div className={styles.tabs} role="tablist" aria-label={t(l("Secciones del asistente", "Assistant sections"))}>
        <button type="button" role="tab" aria-selected={tab === "chat"} onClick={() => showTab("chat")}>
          <MessageCircle size={14} aria-hidden="true" />
          {t(l("Conversación", "Conversation"))}
        </button>
        <button type="button" role="tab" aria-selected={tab === "material"} onClick={() => showTab("material")}>
          <FlaskConical size={14} aria-hidden="true" />
          {t(l("Materiales", "Materials"))}
        </button>
      </div>

      {materialSeen && <MaterialPanel initial={materialStart} onAsk={askTested} busy={busy} hidden={tab !== "material"} />}
      {tab === "chat" && (
        <>
      <div className={styles.list} ref={listRef}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p>{t(l("Hola, comandante. Pregúntame sobre seguridad contra incendios en el espacio.", "Welcome, commander. Ask me anything about fire safety in space."))}</p>
            <div className={styles.suggest}>
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => void ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.user : styles.bot}`}>
            {m.role === "user" ? <p>{m.text}</p> : <AnswerText text={m.text} />}
            {m.rows && m.rows.length > 0 && (
              <details className={styles.rows} open>
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
                {m.origin === "prepared" && <span className={styles.ok}>✓ {t(l("Respuesta verificada", "Verified answer"))}</span>}
                {m.origin === "analysis" && <span className={styles.calc}>ƒ {t(l("Calculado por el modelo", "Computed by the model"))}</span>}
                {m.origin === "psi" && <span className={styles.calc}>{t(l("Datos de NASA PSI", "NASA PSI data"))}</span>}
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

      {messages.length > 0 && (
        <div className={styles.quick} aria-label={t(l("Preguntas sugeridas", "Suggested questions"))}>
          {quickQuestions(quickContext, lang).map((s) => (
            <button key={s} type="button" onClick={() => void ask(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}
      {finding && (
        <p className={styles.pinned}>
          <Database size={13} aria-hidden="true" />
          <span>
            {t(l("Hallazgo", "Finding"))}: <b>{finding.label}</b>
          </span>
          <button type="button" onClick={() => appStore.set({ chatFinding: null, chatFindingAsk: false })} aria-label={t(l("Quitar el hallazgo y preguntar en general", "Remove the finding and ask in general"))} title={t(l("Quitar el hallazgo", "Remove the finding"))}>
            <X size={12} aria-hidden="true" />
          </button>
        </p>
      )}
      <VoiceBar dictation={dictation} speech={speech} listenLang={listenLang} onListenLang={setListenLang} autoSpeak={autoSpeak} onAutoSpeak={toggleAutoSpeak} autoSend={autoSend} onAutoSend={toggleAutoSend} />
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
            title={speaking ? t(l("El micrófono se activa cuando termina la voz", "The microphone is available when the voice ends")) : t(l("Dictar con el micrófono", "Dictate with the microphone"))}
          >
            <Mic size={16} aria-hidden="true" />
          </button>
        )}
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(l("Escribe tu pregunta…", "Type your question…"))} maxLength={MAX_QUESTION} aria-label={t(l("Pregunta", "Question"))} />
        <button type="submit" className={styles.send} disabled={busy || !input.trim()} aria-label={t(l("Enviar", "Send"))}>
          <Send size={15} aria-hidden="true" />
        </button>
      </form>
        </>
      )}
    </aside>
  );
}
