"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Search, X } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { AI_USE, LICENSES } from "@/content/licenses";
import type { Source } from "@/content/sources";
import { patchQuery } from "@/features/scene/lib/scenario";
import { Pager, Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import type { MissionRefs, SourceGroup } from "../server/references.service";
import styles from "./References.module.scss";

type Tab = "all" | SourceGroup | "licenses" | "ai";
const TABS: { id: Tab; label: L }[] = [
  { id: "all", label: l("Todas", "All") },
  { id: "reports", label: l("Reportes NASA", "NASA reports") },
  { id: "papers", label: l("Artículos (DOI)", "Papers (DOI)") },
  { id: "nasa", label: l("Datos, normas y páginas", "Data, standards and pages") },
  { id: "assets", label: l("Modelos y texturas", "Models and textures") },
  { id: "licenses", label: l("Licencias", "Licences") },
  { id: "ai", label: l("Uso de IA", "AI use") },
];
const KIND: Record<Source["kind"], string> = { ntrs: "NTRS", doi: "DOI", psi: "PSI", nasa: "NASA", standard: "STD", spinoff: "SPINOFF", history: "HIST", asset: "3D" };
const PER_PAGE = 10;
/** Texto sin tildes ni mayúsculas, para buscar. */
const fold = (s: string): string => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Datos y referencias: todas las fuentes que respaldan una cifra de la
 * plataforma, las licencias de los recursos y la declaración de uso de IA.
 * Las listas largas se paginan: la página nunca se desplaza.
 */
export function ReferencesView({ groups, missions }: { groups: Record<SourceGroup, Source[]>; missions: MissionRefs[] }) {
  const { t } = useLang();
  const sp = useSearchParams();
  const tab = (TABS.find((x) => x.id === sp.get("tab"))?.id ?? "all") as Tab;
  const q = sp.get("q") ?? "";
  const mission = missions.find((m) => m.id === sp.get("mission")) ?? null;
  const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
  const set = useCallback((patch: Record<string, string | number | null>) => {
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);
  const isSources = tab !== "licenses" && tab !== "ai";
  // Búsqueda por texto y filtro por misión sobre la pestaña activa.
  const list = useMemo(() => {
    if (tab === "licenses" || tab === "ai") return [];
    const base = tab === "all" ? Object.values(groups).flat() : groups[tab];
    const words = fold(q).split(/\s+/).filter(Boolean);
    return base.filter((s) => {
      if (mission && !mission.sources.includes(s.id)) return false;
      const hay = fold(`${s.short} ${s.title} ${s.id} ${s.url}`);
      return words.every((w) => hay.includes(w));
    });
  }, [tab, groups, q, mission]);
  const pages = Math.ceil(list.length / PER_PAGE);
  const current = Math.min(page, Math.max(0, pages - 1));
  const total = Object.values(groups).reduce((a, g) => a + g.length, 0);

  return (
    <Workspace
      eyebrow={l("INFO · DATOS Y REFERENCIAS", "INFO · DATA AND REFERENCES")}
      title={l("Cada número tiene su fuente", "Every number has its source")}
      lede={l("Fuentes de NASA y publicaciones que respaldan las cifras, los modelos 3D y los textos de la plataforma.", "NASA sources and publications behind the platform's figures, 3D models and texts.")}
      tabs={TABS}
      tab={tab}
      onTab={(id) => set({ tab: id === "all" ? null : id, page: null })}
      aside={
        <span className={styles.total}>
          <b>{total}</b> {t(l("fuentes citadas", "cited sources"))}
        </span>
      }
    >
      {isSources && (
        <div className={styles.filters}>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => set({ q: e.target.value || null, page: null })}
              placeholder={t(l("Buscar por autor, título, año o identificador…", "Search by author, title, year or identifier…"))}
              aria-label={t(l("Buscar citas", "Search citations"))}
            />
          </label>
          <label className={styles.mission}>
            <span>{t(l("Misión", "Mission"))}</span>
            <select value={mission?.id ?? ""} onChange={(e) => set({ mission: e.target.value || null, page: null })}>
              <option value="">{t(l("Todas las misiones", "All missions"))}</option>
              {missions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sources.length})
                </option>
              ))}
            </select>
          </label>
          <output className={styles.count}>
            {list.length} {t(l("resultados", "results"))}
          </output>
          {(q || mission) && (
            <button type="button" className={styles.clear} onClick={() => set({ q: null, mission: null, page: null })}>
              <X size={14} aria-hidden="true" />
              {t(l("Limpiar", "Clear"))}
            </button>
          )}
        </div>
      )}

      {isSources && list.length === 0 && (
        <p className={styles.empty}>
          {t(l("Ninguna fuente coincide. Prueba con otra palabra o quita el filtro de misión.", "No source matches. Try another word or remove the mission filter."))}
        </p>
      )}

      {list.length > 0 && (
        <div className={styles.sources}>
          <ul>
            {list.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE).map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  <code>{KIND[s.kind]}</code>
                  <span>
                    <b>{s.short}</b>
                    <em>{s.title}</em>
                  </span>
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <footer>
            <span>{t(l("Los enlaces llevan al registro oficial de cada fuente.", "Links lead to each source's official record."))}</span>
            <Pager page={current} pages={pages} onPage={(p) => set({ page: p || null })} />
          </footer>
        </div>
      )}

      {tab === "licenses" && (
        <ul className={styles.cards}>
          {LICENSES.map((x) => (
            <li key={x.name}>
              <h2>{x.name}</h2>
              <p>{t(x.use)}</p>
              <p className={styles.license}>{t(x.license)}</p>
              <a href={x.url} target="_blank" rel="noreferrer">
                {x.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {tab === "ai" && (
        <ul className={`${styles.cards} ${styles.ai}`}>
          {AI_USE.map((x) => (
            <li key={x.title.en}>
              <h2>{t(x.title)}</h2>
              <p>{t(x.text)}</p>
            </li>
          ))}
        </ul>
      )}
    </Workspace>
  );
}
