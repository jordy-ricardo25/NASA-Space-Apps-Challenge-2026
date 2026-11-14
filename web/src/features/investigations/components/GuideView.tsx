"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy, X } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { HISTORY } from "@/content/earth";
import { FAMILY_LABEL, PILLAR_LABEL, VAR_KEYS, VAR_LABEL, type Family, type Investigation, type Pillar } from "@/content/investigations";
import { MODULES, getModule } from "@/content/modules";
import { getSource } from "@/content/sources";
import { patchQuery } from "@/features/scene/lib/scenario";
import { Segmented, Slider } from "@/shared/components/Controls";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { Pager, Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import { num, pct } from "@/shared/lib/format";
import { CRITERIA, CRITERION_LABEL, DEFAULT_WEIGHTS, rankInvestigations, type Criterion, type RankWeights } from "../lib/ranking";
import styles from "./Guide.module.scss";

type Tab = "library" | "ranking" | "compare" | "coverage" | "history";
const TABS: { id: Tab; label: L }[] = [
  { id: "library", label: l("Biblioteca PSI", "PSI library") },
  { id: "ranking", label: l("Ranking por ambiente", "Ranking by environment") },
  { id: "compare", label: l("Comparador", "Comparator") },
  { id: "coverage", label: l("Cobertura", "Coverage") },
  { id: "history", label: l("Lecciones", "Lessons") },
];
const CRIT_COLOR: Record<Criterion, string> = { atmosphere: "#35d8f2", gravity: "#ff8738", scale: "#b68cff", data: "#00d49a", pillar: "#ffc53d" };
const DATA_LABEL: L[] = [l("Sin datos aún", "No data yet"), l("Por confirmar en PSI", "To be confirmed in PSI"), l("Reportes publicados", "Published reports"), l("Tablas en PSI", "Tables in PSI")];
const REGIME: Record<Investigation["regime"], L> = { micro: l("Microgravedad", "Microgravity"), partial: l("Gravedad parcial", "Partial gravity"), earth: l("1 g", "1 g") };
const SCALE: Record<Investigation["scale"], L> = { bench: l("Laboratorio", "Bench"), vehicle: l("Escala de nave", "Vehicle scale"), surface: l("Superficie lunar", "Lunar surface") };
const PER_PAGE = 8;

/**
 * Guía (objetivo O1): biblioteca de investigaciones, ranking por ambiente con
 * pesos visibles, comparador lado a lado, matriz de cobertura y lecciones
 * históricas. El estado vive en la URL.
 */
export function GuideView({ investigations }: { investigations: Investigation[] }) {
  const { t, lang } = useLang();
  const sp = useSearchParams();
  const tab = (TABS.find((x) => x.id === sp.get("tab"))?.id ?? "library") as Tab;
  const envId = getModule(sp.get("env"))?.id ?? "base";
  const pillar = (sp.get("pillar") as Pillar | null) && sp.get("pillar")! in PILLAR_LABEL ? (sp.get("pillar") as Pillar) : null;
  const family = sp.get("family") && sp.get("family")! in FAMILY_LABEL ? (sp.get("family") as Family) : null;
  const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
  const detail = investigations.find((i) => i.id === sp.get("id")) ?? null;
  const selected = useMemo(() => (sp.get("inv") ?? "saffire,bass2,luci").split(",").filter((id) => investigations.some((i) => i.id === id)).slice(0, 4), [sp, investigations]);
  const wParam = sp.get("w");
  const weights = useMemo<RankWeights>(() => {
    const v = (wParam ?? "").split(",").map(Number);
    return v.length === CRITERIA.length && v.every((x) => Number.isFinite(x) && x >= 0 && x <= 5) ? (Object.fromEntries(CRITERIA.map((c, i) => [c, v[i]])) as RankWeights) : DEFAULT_WEIGHTS;
  }, [wParam]);
  const [copied, setCopied] = useState(false);

  const set = useCallback((patch: Record<string, string | number | null>) => {
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);

  const env = getModule(envId)!;
  const variant = env.variants[0]!;
  const ranked = useMemo(() => rankInvestigations({ o2: variant.o2, p: variant.P, g: variant.g, pillar }, weights, investigations), [variant, pillar, weights, investigations]);
  const filtered = family ? investigations.filter((i) => i.family === family) : investigations;
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const shown = filtered.slice(Math.min(page, pages - 1) * PER_PAGE, Math.min(page, pages - 1) * PER_PAGE + PER_PAGE);
  const range = (r: [number, number] | null, unit: string): string => (r ? (r[0] === r[1] ? `${num(r[0], 1, lang)} ${unit}` : `${num(r[0], 1, lang)}–${num(r[1], 1, lang)} ${unit}`) : `∅ ${t(l("no publicado", "not published"))}`);
  const compared = selected.map((id) => investigations.find((i) => i.id === id)!);

  const copyCitation = (inv: Investigation): void => {
    const text = `${inv.name} — ${inv.full}. ${inv.sources.map((id) => getSource(id)).filter(Boolean).map((s) => `${s!.title} (${s!.url})`).join("; ")}`;
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const rows: { label: L; get: (i: Investigation) => string }[] = [
    { label: l("Plataforma", "Platform"), get: (i) => t(i.platform) },
    { label: l("Combustible", "Fuel"), get: (i) => t(i.fuel) },
    { label: l("O₂ ensayado", "O₂ tested"), get: (i) => range(i.o2, "%") },
    { label: l("Presión", "Pressure"), get: (i) => range(i.p, "kPa") },
    { label: l("Flujo", "Flow"), get: (i) => range(i.flow, "cm/s") },
    { label: l("Gravedad", "Gravity"), get: (i) => t(REGIME[i.regime]) },
    { label: l("Escala", "Scale"), get: (i) => t(SCALE[i.scale]) },
    { label: l("Pilar", "Pillar"), get: (i) => i.pillars.map((p) => t(PILLAR_LABEL[p])).join(" · ") },
    { label: l("Datos", "Data"), get: (i) => t(DATA_LABEL[i.data]!) },
    { label: l("Hallazgo", "Finding"), get: (i) => t(i.findings) },
  ];

  return (
    <Workspace
      eyebrow={l("GUÍA · OBJETIVO 1", "GUIDE · GOAL 1")}
      title={l("Investigaciones de combustión de NASA", "NASA combustion investigations")}
      lede={l("Encuentra, compara y entiende las investigaciones relevantes para cada ambiente habitable. Solo aparecen las identificadas en nuestras fuentes.", "Find, compare and understand the investigations relevant to each habitable environment. Only those identified in our sources appear.")}
      tabs={TABS}
      tab={tab}
      onTab={(id) => set({ tab: id === "library" ? null : id, id: null, page: null })}
    >
      {tab === "library" && (
        <div className={styles.library}>
          <div className={styles.toolbar}>
            <Segmented
              value={family ?? "all"}
              options={[{ value: "all", label: t(l("Todas", "All")) }, ...(Object.keys(FAMILY_LABEL) as Family[]).map((f) => ({ value: f, label: t(FAMILY_LABEL[f]) }))]}
              onChange={(v) => set({ family: v === "all" ? null : v, page: null })}
            />
            <span className={styles.count}>
              {filtered.length} {t(l("investigaciones", "investigations"))}
            </span>
            <Pager page={Math.min(page, pages - 1)} pages={pages} onPage={(p) => set({ page: p || null })} />
          </div>
          <div className={styles.cards}>
            {shown.map((i) => (
              <button key={i.id} type="button" className={styles.card} onClick={() => set({ id: i.id })}>
                <span className={styles.fam} data-family={i.family}>
                  {t(FAMILY_LABEL[i.family])}
                </span>
                <b>{i.name}</b>
                <em>{i.full}</em>
                <p>{t(i.objective)}</p>
                <dl className={styles.facts}>
                  <div>
                    <dt>O₂</dt>
                    <dd>{range(i.o2, "%")}</dd>
                  </div>
                  <div>
                    <dt>{t(l("Flujo", "Flow"))}</dt>
                    <dd>{range(i.flow, "cm/s")}</dd>
                  </div>
                  <div>
                    <dt>{t(l("Pilar", "Pillar"))}</dt>
                    <dd>{i.pillars.map((p) => t(PILLAR_LABEL[p])).join(" · ")}</dd>
                  </div>
                </dl>
                <span className={styles.foot}>
                  <span>{t(i.platform)}</span>
                  <span className={styles.dots} title={t(DATA_LABEL[i.data]!)}>
                    {[1, 2, 3].map((d) => (
                      <i key={d} data-on={i.data >= d} />
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "ranking" && (
        <div className={styles.ranking}>
          <aside>
            <Segmented wrap label={t(l("Ambiente", "Environment"))} value={envId} options={MODULES.map((m) => ({ value: m.id, label: t(m.label) }))} onChange={(v) => set({ env: v })} />
            <Segmented
              wrap
              label={t(l("Pilar", "Pillar"))}
              value={pillar ?? "all"}
              options={[{ value: "all", label: t(l("Todos", "All")) }, ...(Object.keys(PILLAR_LABEL) as Pillar[]).map((p) => ({ value: p, label: t(PILLAR_LABEL[p]) }))]}
              onChange={(v) => set({ pillar: v === "all" ? null : v })}
            />
            <h3>{t(l("PESOS DEL RANKING", "RANKING WEIGHTS"))}</h3>
            {CRITERIA.map((c) => (
              <div key={c} className={styles.weight} style={{ "--c": CRIT_COLOR[c] } as React.CSSProperties}>
                <Slider label={t(CRITERION_LABEL[c])} display={String(weights[c])} value={weights[c]} min={0} max={5} step={1} onChange={(v) => set({ w: CRITERIA.map((k) => (k === c ? v : weights[k])).join(",") })} />
              </div>
            ))}
            <p className={styles.note}>{t(l("Puntaje = 1 − distancia ponderada al ambiente. No es una probabilidad de incendio.", "Score = 1 − weighted distance to the environment. It is not a fire probability."))}</p>
          </aside>
          <ol className={styles.rankList}>
            {ranked.slice(0, 9).map((r, idx) => {
              const total = CRITERIA.reduce((a, c) => a + weights[c], 0) || 1;
              return (
                <li key={r.inv.id}>
                  <i>{idx + 1}</i>
                  <button type="button" onClick={() => set({ tab: null, id: r.inv.id })}>
                    <b>{r.inv.name}</b>
                    <span>{t(r.inv.platform)}</span>
                  </button>
                  <div className={styles.stack} title={CRITERIA.map((c) => `${t(CRITERION_LABEL[c])}: ${Math.round(r.parts[c] * 100)} %`).join("\n")}>
                    {CRITERIA.map((c) => (
                      <span key={c} style={{ "--c": CRIT_COLOR[c], "--w": pct((weights[c] * r.parts[c]) / total) } as React.CSSProperties} />
                    ))}
                  </div>
                  <output>{Math.round(r.score * 100)}</output>
                  <span className={styles.cov} title={t(l("Atributos numéricos publicados", "Published numeric attributes"))}>
                    {Math.round(r.coverage * 3)}/3
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {tab === "compare" && (
        <div className={styles.compare}>
          <div className={styles.pick}>
            <span>{t(l("Elige de 2 a 4:", "Choose 2 to 4:"))}</span>
            {investigations.map((i) => {
              const on = selected.includes(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && selected.length >= 4}
                  onClick={() => {
                    const next = on ? selected.filter((x) => x !== i.id) : [...selected, i.id];
                    if (next.length >= 1) set({ inv: next.join(",") });
                  }}
                >
                  {i.name}
                </button>
              );
            })}
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th />
                {compared.map((i) => (
                  <th key={i.id}>
                    <b>{i.name}</b>
                    <span>{i.years}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const values = compared.map(row.get);
                const differs = new Set(values).size > 1;
                return (
                  <tr key={row.label.en} data-diff={differs}>
                    <th>{t(row.label)}</th>
                    {values.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={styles.note}>
            <i className={styles.diffKey} /> {t(l("Diferencias resaltadas. Unidades armonizadas: O₂ en % vol, presión en kPa y flujo en cm/s.", "Differences highlighted. Harmonised units: O₂ in vol %, pressure in kPa and flow in cm/s."))}
          </p>
        </div>
      )}

      {tab === "coverage" && (
        <div className={styles.coverage}>
          <table>
            <thead>
              <tr>
                <th>{t(l("Investigación", "Investigation"))}</th>
                {VAR_KEYS.map((k) => (
                  <th key={k}>{t(VAR_LABEL[k])}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investigations.map((i) => (
                <tr key={i.id} onClick={() => set({ tab: null, id: i.id })}>
                  <th>{i.name}</th>
                  {VAR_KEYS.map((k) => (
                    <td key={k} data-v={i.vars[k]}>
                      {i.vars[k] === "yes" ? "●" : i.vars[k] === "no" ? "○" : "–"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>● {t(l("medida", "measured"))} · ○ {t(l("no medida", "not measured"))} · – {t(l("no aplica", "not applicable"))}. {t(l("La columna de gravedad parcial muestra la brecha: solo LUCI y FM2.", "The partial-gravity column shows the gap: only LUCI and FM2."))}</p>
        </div>
      )}

      {tab === "history" && (
        <div className={styles.history}>
          {HISTORY.map((h) => (
            <article key={h.id}>
              <span className={styles.year}>{h.year}</span>
              <h2>{t(h.name)}</h2>
              <p>{t(h.what)}</p>
              <h3>{t(l("FÍSICA", "PHYSICS"))}</h3>
              <p>{t(h.physics)}</p>
              <h3>{t(l("LECCIÓN", "LESSON"))}</h3>
              <p className={styles.lesson}>{t(h.lesson)}</p>
              <div className={styles.rule}>
                <Check size={14} />
                {t(h.rule)}
              </div>
              <SourceChips ids={h.sources} />
            </article>
          ))}
        </div>
      )}

      {detail && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={detail.name}>
          <article className={styles.detail}>
            <header>
              <div>
                <span className={styles.fam} data-family={detail.family}>
                  {t(FAMILY_LABEL[detail.family])} · {detail.pillars.map((p) => t(PILLAR_LABEL[p])).join(" · ")}
                </span>
                <h2>{detail.name}</h2>
                <em>
                  {detail.full} · {detail.years}
                </em>
              </div>
              <button type="button" onClick={() => set({ id: null })} aria-label={t(l("Cerrar", "Close"))}>
                <X size={18} />
              </button>
            </header>
            <div className={styles.detailGrid}>
              <dl>
                <dt>{t(l("Objetivo", "Objective"))}</dt>
                <dd>{t(detail.objective)}</dd>
                <dt>{t(l("Combustible", "Fuel"))}</dt>
                <dd>{t(detail.fuel)}</dd>
                <dt>{t(l("Condiciones", "Conditions"))}</dt>
                <dd>{t(detail.conditions)}</dd>
                <dt>{t(l("Hallazgos", "Findings"))}</dt>
                <dd>{t(detail.findings)}</dd>
                <dt>{t(l("Limitaciones", "Limitations"))}</dt>
                <dd>{t(detail.limitations)}</dd>
              </dl>
              <dl>
                <dt>{t(l("Plataforma y hardware", "Platform and hardware"))}</dt>
                <dd>
                  {t(detail.platform)} · {detail.hardware}
                </dd>
                <dt>{t(l("Datos", "Data"))}</dt>
                <dd>
                  {t(detail.psi)} · {t(DATA_LABEL[detail.data]!)}
                </dd>
                <dt>{t(l("Rangos ensayados", "Tested ranges"))}</dt>
                <dd className={styles.mono}>
                  O₂ {range(detail.o2, "%")} · P {range(detail.p, "kPa")} · {t(l("flujo", "flow"))} {range(detail.flow, "cm/s")}
                </dd>
                <dt>{t(l("Variables medidas", "Measured variables"))}</dt>
                <dd className={styles.varChips}>
                  {VAR_KEYS.filter((k) => detail.vars[k] === "yes").map((k) => (
                    <span key={k}>{t(VAR_LABEL[k])}</span>
                  ))}
                </dd>
                <dt>{t(l("Ambientes", "Environments"))}</dt>
                <dd className={styles.varChips}>
                  {detail.modules.map((id) => (
                    <Link key={id} href={`/modulos/${id}`}>
                      {t(getModule(id)!.name)}
                    </Link>
                  ))}
                </dd>
                <dt>{t(l("Fuentes", "Sources"))}</dt>
                <dd>
                  <SourceChips ids={detail.sources} />
                </dd>
              </dl>
            </div>
            <button type="button" className={styles.copy} onClick={() => copyCitation(detail)}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t(l("Cita copiada", "Citation copied")) : t(l("Copiar cita", "Copy citation"))}
            </button>
          </article>
        </div>
      )}
    </Workspace>
  );
}
