"use client";

import { Ban, CircleAlert, FlaskConical, Info, Ruler, Sparkles, TriangleAlert } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import type { ApiAlert } from "@/shared/types/api";
import styles from "./AlertList.module.scss";

const META: Record<ApiAlert["level"], { icon: React.ComponentType<{ size?: number }>; label: L }> = {
  high: { icon: TriangleAlert, label: l("Alto", "High") },
  caution: { icon: CircleAlert, label: l("Precaución", "Caution") },
  info: { icon: Info, label: l("Información", "Information") },
  evidence: { icon: FlaskConical, label: l("Evidencia", "Evidence") },
  none: { icon: Ban, label: l("Sin evidencia", "No evidence") },
  phenomenon: { icon: Sparkles, label: l("Fenómeno", "Phenomenon") },
  domain: { icon: Ruler, label: l("Dominio", "Domain") },
};

/**
 * Alertas de análisis (ALR-01…09). Cada una muestra color, ícono y texto, por
 * qué se disparó y qué fuente la respalda.
 */
export function AlertList({ alerts, compact = false }: { alerts: ApiAlert[]; compact?: boolean }) {
  const { t } = useLang();
  if (!alerts.length) return <p className={styles.empty}>{t(l("Sin alertas para este escenario.", "No alerts for this scenario."))}</p>;
  return (
    <ul className={`${styles.list} ${compact ? styles.compact : ""}`}>
      {alerts.map((a) => {
        const Icon = META[a.level].icon;
        return (
          <li key={a.id} className={styles[a.level]}>
            <span className={styles.icon}>
              <Icon size={14} />
            </span>
            <div>
              <span className={styles.head}>
                <code>{a.id.replace("ALR-05M", "ALR-05")}</code>
                <em>{t(META[a.level].label)}</em>
              </span>
              <b>{t(a.message)}</b>
              {!compact && <p>{t(a.cause)}</p>}
              {!compact && <SourceChips ids={a.sources} max={3} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
