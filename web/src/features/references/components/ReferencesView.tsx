"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { AI_USE, LICENSES } from "@/content/licenses";
import type { Source } from "@/content/sources";
import { patchQuery } from "@/features/scene/lib/scenario";
import { Pager, Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import type { SourceGroup } from "../server/references.service";
import styles from "./References.module.scss";

type Tab = SourceGroup | "licenses" | "ai";
const TABS: { id: Tab; label: L }[] = [
  { id: "reports", label: l("Reportes NASA", "NASA reports") },
  { id: "papers", label: l("Artículos (DOI)", "Papers (DOI)") },
  { id: "nasa", label: l("Datos, normas y páginas", "Data, standards and pages") },
  { id: "assets", label: l("Modelos y texturas", "Models and textures") },
  { id: "licenses", label: l("Licencias", "Licences") },
  { id: "ai", label: l("Uso de IA", "AI use") },
];
const KIND: Record<Source["kind"], string> = { ntrs: "NTRS", doi: "DOI", psi: "PSI", nasa: "NASA", standard: "STD", spinoff: "SPINOFF", history: "HIST", asset: "3D" };
const PER_PAGE = 12;

/**
 * Datos y referencias: todas las fuentes que respaldan una cifra de la
 * plataforma, las licencias de los recursos y la declaración de uso de IA.
 * Las listas largas se paginan: la página nunca se desplaza.
 */
export function ReferencesView({ groups }: { groups: Record<SourceGroup, Source[]> }) {
  const { t } = useLang();
  const sp = useSearchParams();
  const tab = (TABS.find((x) => x.id === sp.get("tab"))?.id ?? "reports") as Tab;
  const page = Math.max(0, Number(sp.get("page") ?? 0) || 0);
  const set = useCallback((patch: Record<string, string | number | null>) => {
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);
  const list = tab === "licenses" || tab === "ai" ? [] : groups[tab];
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
      onTab={(id) => set({ tab: id === "reports" ? null : id, page: null })}
      aside={
        <span className={styles.total}>
          <b>{total}</b> {t(l("fuentes citadas", "cited sources"))}
        </span>
      }
    >
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
