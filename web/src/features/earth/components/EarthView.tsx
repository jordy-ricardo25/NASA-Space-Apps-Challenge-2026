"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, Orbit } from "lucide-react";
import { l } from "@/content/i18n";
import type { EarthCase } from "@/content/earth";
import { patchQuery } from "@/features/scene/lib/scenario";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./Earth.module.scss";

/**
 * Aplicaciones en la Tierra (objetivo O4): lista de casos de transferencia y,
 * a la derecha, el recorrido problema → tecnología espacial → impacto del caso
 * elegido (`?case=` en la URL).
 */
export function EarthView({ cases }: { cases: EarthCase[] }) {
  const { t } = useLang();
  const sp = useSearchParams();
  const active = cases.find((c) => c.id === sp.get("case")) ?? cases[0]!;
  const set = useCallback((id: string) => {
    const patch: Record<string, string | null> = { case: id };
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);

  return (
    <Workspace
      eyebrow={l("TIERRA · OBJETIVO 4", "EARTH · GOAL 4")}
      title={l("Del espacio a los bomberos", "From space to firefighters")}
      lede={l("Lo que se aprende al proteger una nave vuelve a la Tierra. Distinguimos las transferencias documentadas de las aplicaciones posibles.", "What we learn protecting a spacecraft comes back to Earth. We separate documented transfers from possible applications.")}
    >
      <div className={styles.layout}>
        <ul className={styles.list}>
          {cases.map((c) => (
            <li key={c.id}>
              <button type="button" aria-pressed={c.id === active.id} onClick={() => set(c.id)}>
                <output>{c.stat.value}</output>
                <span>
                  <b>{t(c.title)}</b>
                  <em data-kind={c.kind}>{c.kind === "documented" ? t(l("Transferencia documentada", "Documented transfer")) : t(l("Aplicación posible", "Possible application"))}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <article className={styles.detail} key={active.id}>
          <header>
            <div>
              <em data-kind={active.kind}>{active.kind === "documented" ? t(l("Transferencia documentada", "Documented transfer")) : t(l("Aplicación posible", "Possible application"))}</em>
              <h2>{t(active.title)}</h2>
            </div>
            <div className={styles.stat}>
              <output>{active.stat.value}</output>
              <span>{t(active.stat.label)}</span>
            </div>
          </header>
          <ol className={styles.flow}>
            <li data-step="problem">
              <h3>{t(l("EL PROBLEMA", "THE PROBLEM"))}</h3>
              <p>{t(active.problem)}</p>
              <ArrowDown size={18} aria-hidden="true" />
            </li>
            <li data-step="tech">
              <h3>{t(l("LA TECNOLOGÍA ESPACIAL", "THE SPACE TECHNOLOGY"))}</h3>
              <p>{t(active.technology)}</p>
              <ArrowDown size={18} aria-hidden="true" />
            </li>
            <li data-step="impact">
              <h3>{t(l("EL IMPACTO EN LA TIERRA", "THE IMPACT ON EARTH"))}</h3>
              <p>{t(active.impact)}</p>
            </li>
          </ol>
          <footer>
            <span className={styles.link}>
              <Orbit size={15} aria-hidden="true" />
              {t(active.link)}
            </span>
            <SourceChips ids={active.sources} />
          </footer>
        </article>
      </div>
    </Workspace>
  );
}
