"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Cpu, RefreshCw } from "lucide-react";
import { l } from "@/content/i18n";
import { isModuleId, type ModuleId } from "@/content/modules";
import type { Myth } from "@/content/myths";
import { MaterialPanel, type AskContext } from "@/features/assistant/components/MaterialPanel";
import { O2_RANGE, P_RANGE } from "@/features/assistant/lib/materialOptions";
import type { PsiData, PsiFinding } from "@/features/psi/server/psi.service";
import { patchQuery } from "@/features/scene/lib/scenario";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { Pager, Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import type { ApiEnvelope } from "@/shared/types/api";
import { FAST, LOCAL_ENVS } from "../lib/local";
import type { LocalChatHandle } from "./LocalChat";
import { EnvList, LocalRanking, findingLabel } from "./LocalRanking";
import styles from "./Local.module.scss";

// El chat usa el micrófono y la voz del navegador: solo se monta en el cliente.
const LocalChat = dynamic(() => import("./LocalChat").then((m) => m.LocalChat), { ssr: false });

type Tab = "chat" | "params" | "rules";
const TABS: { id: Tab; label: ReturnType<typeof l> }[] = [
  { id: "chat", label: l("Análisis PSI", "PSI analysis") },
  { id: "params", label: l("Variar parámetros", "Vary parameters") },
  { id: "rules", label: l("Mitos y hechos", "Myths and facts") },
];

interface LocalViewProps {
  /** Ranking de PSI de cada ambiente, ya cargado en el servidor. */
  data: Partial<Record<ModuleId, PsiData>>;
  /** Ambientes cuyos datos llegaron del backend en vivo. */
  live: ModuleId[];
  myths: Myth[];
}

type ModelStatus = { configured: boolean; models: string[]; preferred: string | null };

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

/**
 * Analista PSI: la consola del equipo para conversar con Flamey sobre los
 * hallazgos de NASA PSI (con un modelo de lenguaje si el equipo tiene uno disponible). A la izquierda se elige el ambiente, a la
 * derecha está el ranking de hallazgos y en el centro Flamey, con tres
 * pestañas: la conversación, la prueba de parámetros y los mitos y hechos.
 * El estado de la pantalla vive en la URL (`?env=&tab=&h=&page=&regla=`).
 */
export function LocalView({ data, live, myths }: LocalViewProps) {
  const { lang, t } = useLang();
  const sp = useSearchParams();
  const requested = sp.get("env");
  const env: ModuleId = isModuleId(requested) && data[requested] ? requested : (LOCAL_ENVS.find((id) => data[id]) ?? "base");
  const psi = data[env];
  const tab: Tab = TABS.find((x) => x.id === sp.get("tab"))?.id ?? "chat";
  const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
  const rule = Math.min(myths.length - 1, Math.max(0, Number(sp.get("regla") ?? 0) || 0));
  const found = psi?.findings.find((f) => f.key === sp.get("h")) ?? null;

  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [engine, setEngine] = useState(FAST);
  const [busy, setBusy] = useState(false);
  const [paramsSeen, setParamsSeen] = useState(tab === "params");
  const chat = useRef<LocalChatHandle | null>(null);
  // El chat se carga solo en el navegador: hasta que está montado no se puede interpretar.
  const [ready, setReady] = useState(false);
  const attach = useCallback((handle: LocalChatHandle | null) => {
    chat.current = handle;
    setReady(!!handle);
  }, []);

  const set = useCallback((patch: Record<string, string | number | null>) => {
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);

  const scan = useCallback(async () => {
    try {
      const res = await fetch("/api/asistente/local");
      const body = (await res.json()) as ApiEnvelope<ModelStatus>;
      setStatus(body.value);
      // Como en el Flamey de Johnatan: si hay modelos, se usa el preferido; si no, el modo rápido.
      setEngine((now) => (now !== FAST && body.value.models.includes(now) ? now : (body.value.preferred ?? FAST)));
    } catch {
      setStatus({ configured: false, models: [], preferred: null });
    }
  }, []);
  useEffect(() => {
    void scan();
  }, [scan]);

  const openTab = (id: Tab): void => {
    if (id === "params") setParamsSeen(true);
    set({ tab: id === "chat" ? null : id });
  };

  const interpret = (f: PsiFinding): void => {
    chat.current?.clear();
    set({ h: f.key, tab: null });
    chat.current?.ask(lang === "es" ? `Explícame el hallazgo ${findingLabel(f)} y qué significa en este ambiente.` : `Explain the finding ${findingLabel(f)} and what it means in this environment.`, { finding: { key: f.key, env } });
  };

  const pickEnv = (id: ModuleId): void => {
    chat.current?.clear();
    set({ env: id, h: null, page: null });
  };

  const askFromParams = (question: string, context: AskContext): void => {
    set({ tab: null });
    chat.current?.ask(question, context);
  };

  const myth = myths[rule];
  const e = psi?.environment;
  return (
    <Workspace
      eyebrow={l("ANALISTA PSI · FLAMEY", "PSI ANALYST · FLAMEY")}
      title={l("Conversa con los hallazgos de NASA PSI", "Talk to the NASA PSI findings")}
      aside={
        <div className={styles.engine}>
          <label htmlFor="local-engine">
            <Cpu size={14} aria-hidden="true" />
            {t(l("Quién responde", "Who answers"))}
          </label>
          <select id="local-engine" value={engine} onChange={(ev) => setEngine(ev.target.value)}>
            <option value={FAST}>{t(l("Rápido (datos verificados)", "Fast (verified data)"))}</option>
            {status?.models.map((m) => (
              <option key={m} value={m}>
                {t(l("Flamey con IA", "Flamey with AI"))} · {m}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void scan()} aria-label={t(l("Buscar modelos disponibles", "Look for available models"))} title={t(l("Buscar modelos disponibles", "Look for available models"))}>
            <RefreshCw size={14} aria-hidden="true" />
          </button>
          {status && status.models.length === 0 && (
            <span className={styles.offline}>{t(l("Sin modelo de IA disponible: responde con datos verificados", "No AI model available: answering with verified data"))}</span>
          )}
        </div>
      }
    >
      <div className={styles.layout}>
        <EnvList data={data} active={env} onPick={pickEnv} />

        <section className={styles.flamey} aria-label="Flamey">
          <nav className={styles.tabs}>
            {TABS.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === tab} onClick={() => openTab(x.id)}>
                {t(x.label)}
              </button>
            ))}
          </nav>
          <LocalChat ref={attach} finding={found ? { key: found.key, label: findingLabel(found), env } : null} engine={engine} onBusy={setBusy} hidden={tab !== "chat"} />
          {paramsSeen && e && (
            <div className={styles.params} hidden={tab !== "params"}>
              <MaterialPanel
                key={env}
                initial={{ module: env, material: "pmma", o2: clamp(Math.round(e.o2_fraction * 100), O2_RANGE.min, O2_RANGE.max), p: clamp(Math.round(e.pressure_atm * 101.325), P_RANGE.min, P_RANGE.max) }}
                onAsk={askFromParams}
                busy={busy}
              />
            </div>
          )}
          {tab === "rules" && myth && (
            <div className={styles.rules}>
              <article>
                <h3>{t(l("MITO", "MYTH"))}</h3>
                <p>{t(myth.myth)}</p>
                <h3 data-fact>{t(l("HECHO", "FACT"))}</h3>
                <p>{t(myth.fact)}</p>
                <SourceChips ids={myth.sources} />
              </article>
              <Pager page={rule} pages={myths.length} onPage={(p) => set({ regla: p || null })} />
            </div>
          )}
        </section>

        {psi ? (
          <LocalRanking psi={psi} live={live.includes(env)} page={page} onPage={(p) => set({ page: p || null })} activeKey={found?.key ?? null} busy={busy || !ready} onInterpret={interpret} />
        ) : (
          <p className={styles.backup}>{t(l("Sin evidencia: no hay datos de PSI para este ambiente.", "No evidence: there is no PSI data for this environment."))}</p>
        )}
      </div>
    </Workspace>
  );
}
