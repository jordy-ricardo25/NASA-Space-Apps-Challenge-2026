"use client";

import { Ban, Check, CircleAlert, TriangleAlert } from "lucide-react";
import { l, type L } from "@/content/i18n";
import type { RiskLevel } from "@/features/fire/engine/analysis";
import { EvidenceBadge, SourceChips } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { num, signed, pct } from "@/shared/lib/format";
import type { EvidenceLevel } from "@/shared/types/api";
import styles from "./MarginGauge.module.scss";

export interface GaugeData {
  level: RiskLevel;
  evidence: EvidenceLevel;
  margin: number | null;
  marginLo: number | null;
  marginHi: number | null;
  loc: number | null;
  locLo: number | null;
  locHi: number | null;
  sources: string[];
}

const LEVEL: Record<RiskLevel, { label: L; note: L; icon: React.ComponentType<{ size?: number }> }> = {
  high: {
    label: l("Supera la frontera", "Exceeds the boundary"),
    note: l("El ambiente sostiene la propagación en todo el intervalo.", "The environment sustains flame spread across the whole interval."),
    icon: TriangleAlert,
  },
  caution: {
    label: l("Precaución · posición incierta", "Caution · uncertain position"),
    note: l("El intervalo cruza cero o queda dentro de la banda de precaución.", "The interval crosses zero or sits inside the caution band."),
    icon: CircleAlert,
  },
  low: {
    label: l("Por debajo de la frontera", "Below the boundary"),
    note: l("Bajo este protocolo y dominio; no certifica ausencia de peligro.", "Under this protocol and domain; it does not certify absence of hazard."),
    icon: Check,
  },
  none: {
    label: l("Sin evidencia comparable", "No comparable evidence"),
    note: l("No hay frontera publicada: no se genera ningún número.", "No published boundary: no number is generated."),
    icon: Ban,
  },
};

const MIN = -12, MAX = 24;
const pos = (x: number): number => ((Math.max(MIN, Math.min(MAX, x)) - MIN) / (MAX - MIN)) * 100;

/**
 * Indicador de margen de inflamabilidad: barra con el intervalo, el cero
 * marcado y el nivel de evidencia. Margen = O₂ del ambiente − frontera.
 */
export function MarginGauge({ data, dense = false }: { data: GaugeData; dense?: boolean }) {
  const { t, lang } = useLang();
  const { level, margin, marginLo, marginHi } = data;
  const meta = LEVEL[level];
  const Icon = meta.icon;
  const has = margin != null && marginLo != null && marginHi != null;
  return (
    <div className={`${styles.gauge} ${styles[level]} ${data.evidence === "D" ? styles.extra : ""}`}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon size={15} />
        </span>
        <div className={styles.verdict}>
          <b>{t(meta.label)}</b>
          {!dense && <span>{t(meta.note)}</span>}
        </div>
        <output>{has ? signed(margin, 1, lang) : "∅"}</output>
      </div>
      <div className={styles.bar} role="img" aria-label={has ? `${t(l("Margen", "Margin"))} ${signed(margin, 1, lang)}` : t(meta.label)}>
        {has ? (
          <>
            <i className={styles.band} style={{ "--a": pct(pos(marginLo) / 100), "--b": pct(pos(marginHi) / 100) } as React.CSSProperties} />
            <i className={styles.pointer} style={{ "--x": pct(pos(margin) / 100) } as React.CSSProperties} />
          </>
        ) : (
          <i className={styles.hatch} />
        )}
        <i className={styles.zero} style={{ "--x": pct(pos(0) / 100) } as React.CSSProperties} />
      </div>
      <div className={styles.scale}>
        <span>{MIN}</span>
        <span style={{ "--x": pct(pos(0) / 100) } as React.CSSProperties}>0</span>
        <span>+{MAX} {t(l("pts O₂", "O₂ pts"))}</span>
      </div>
      <div className={styles.foot}>
        <EvidenceBadge level={data.evidence} />
        {data.loc != null && data.locLo != null && data.locHi != null && (
          <span className={styles.loc}>
            {t(l("Frontera", "Boundary"))} <b>{num(data.loc, 1, lang)} %</b> [{num(data.locLo, 1, lang)}–{num(data.locHi, 1, lang)}]
          </span>
        )}
      </div>
      {!dense && <SourceChips ids={data.sources} max={4} />}
    </div>
  );
}
