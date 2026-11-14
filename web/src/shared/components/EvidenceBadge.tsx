"use client";

import { l, type L } from "@/content/i18n";
import { getSource } from "@/content/sources";
import { useLang } from "@/shared/hooks/useLang";
import type { EvidenceLevel } from "@/shared/types/api";
import styles from "./EvidenceBadge.module.scss";

export const EVIDENCE_LABEL: Record<EvidenceLevel, L> = {
  A: l("Directa", "Direct"),
  B: l("Análoga", "Analogous"),
  C: l("Proxy", "Proxy"),
  D: l("Extrapolación", "Extrapolation"),
  NONE: l("Sin evidencia", "No evidence"),
};

export const EVIDENCE_HELP: Record<EvidenceLevel, L> = {
  A: l("Mismo régimen de gravedad y atmósfera, dentro del rango ensayado.", "Same gravity regime and atmosphere, inside the tested range."),
  B: l("Régimen similar con otro material, escala o atmósfera.", "Similar regime with another material, scale or atmosphere."),
  C: l("Mecanismo sustituto (por ejemplo, E-FIELD o gravedad simulada).", "Substitute mechanism (for example E-FIELD or simulated gravity)."),
  D: l("Predicción fuera del rango de los datos; sin validación directa.", "Prediction outside the data range; no direct validation."),
  NONE: l("Ninguna fuente lo respalda. Nunca se muestra como riesgo bajo.", "No source supports it. Never shown as low risk."),
};

/**
 * Insignia del nivel de evidencia (A, B, C, D o ∅). Siempre lleva letra y
 * texto además del color; "sin evidencia" es gris rayado, nunca verde.
 */
export function EvidenceBadge({ level, compact = false }: { level: EvidenceLevel; compact?: boolean }) {
  const { t } = useLang();
  return (
    <span className={`${styles.badge} ${styles[`lv${level}`]}`} title={t(EVIDENCE_HELP[level])}>
      <b>{level === "NONE" ? "∅" : level}</b>
      {!compact && <span>{t(EVIDENCE_LABEL[level])}</span>}
    </span>
  );
}

/** Chips de fuentes: cada número enlaza a su documento de origen. */
export function SourceChips({ ids, max = 4 }: { ids: string[]; max?: number }) {
  const list = ids.flatMap((id) => getSource(id) ?? []).slice(0, max);
  if (!list.length) return null;
  return (
    <span className={styles.sources}>
      {list.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noreferrer" title={s.title}>
          {s.short}
        </a>
      ))}
    </span>
  );
}
