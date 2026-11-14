"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Rocket } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { STAGE_LABEL, type Stage } from "@/content/radar";
import { patchQuery } from "@/features/scene/lib/scenario";
import { EvidenceBadge, SourceChips } from "@/shared/components/EvidenceBadge";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import type { TechMap } from "../server/radar.service";
import styles from "./Radar.module.scss";

type Tab = "map" | "gaps";
const TABS: { id: Tab; label: L }[] = [
  { id: "map", label: l("De la evidencia a la tecnología", "From evidence to technology") },
  { id: "gaps", label: l("Mapa de brechas", "Gap map") },
];
const STAGES: Stage[] = ["evidence", "finding", "gap", "technology"];

/**
 * Radar tecnológico (objetivo O3): cada fila sigue una línea de trabajo desde
 * la evidencia de NASA hasta la tecnología que habilita, pasando por el
 * hallazgo y la brecha. La pestaña activa vive en la URL.
 */
export function RadarView({ data }: { data: TechMap }) {
  const { t } = useLang();
  const sp = useSearchParams();
  const tab: Tab = sp.get("tab") === "gaps" ? "gaps" : "map";
  const set = useCallback((patch: Record<string, string | null>) => {
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);

  return (
    <Workspace
      eyebrow={l("RADAR TECNOLÓGICO · OBJETIVO 3", "TECHNOLOGY RADAR · GOAL 3")}
      title={l("Controles y equipos de próxima generación", "Next-generation controls and equipment")}
      lede={l("Qué evidencia respalda cada tecnología, qué falta por medir y qué misión cerrará la brecha.", "Which evidence backs each technology, what remains to be measured and which mission will close the gap.")}
      tabs={TABS}
      tab={tab}
      onTab={(id) => set({ tab: id === "map" ? null : id })}
    >
      {tab === "map" && (
        <div className={styles.grid} style={{ "--rows": data.lanes.length } as React.CSSProperties}>
          <div className={styles.corner} />
          {STAGES.map((s, i) => (
            <div key={s} className={styles.stage} data-stage={s}>
              <i>{i + 1}</i>
              {t(STAGE_LABEL[s])}
            </div>
          ))}
          {data.lanes.map((lane) => (
            <div key={lane.id} className={styles.lane}>
              <h2 className={styles.laneName}>{t(lane.name)}</h2>
              {STAGES.map((s, i) => {
                const node = lane.nodes[s];
                return (
                  <article key={s} className={styles.node} data-stage={s}>
                    {i > 0 && <ChevronRight size={18} className={styles.arrow} aria-hidden="true" />}
                    <header>
                      <h3>{t(node.title)}</h3>
                      {node.evidence && <EvidenceBadge level={node.evidence} compact />}
                    </header>
                    <p>{t(node.text)}</p>
                    <div className={styles.src}>
                      <SourceChips ids={node.sources} max={2} />
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab === "gaps" && (
        <div className={styles.gaps}>
          {data.gaps.map((g) => (
            <article key={g.name.en} className={styles.gap}>
              <header>
                <h2>{t(g.name)}</h2>
                <EvidenceBadge level={g.evidence} />
              </header>
              <h3>{t(l("ESTADO ACTUAL", "CURRENT STATUS"))}</h3>
              <p>{t(g.status)}</p>
              <div className={styles.closes}>
                <Rocket size={16} aria-hidden="true" />
                <div>
                  <h3>{t(l("MISIÓN QUE LA CIERRA", "MISSION THAT CLOSES IT"))}</h3>
                  <p>{t(g.closes)}</p>
                </div>
              </div>
              <SourceChips ids={g.sources} />
            </article>
          ))}
        </div>
      )}
    </Workspace>
  );
}
