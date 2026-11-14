"use client";

import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { l, type L } from "@/content/i18n";
import type { CurvePoint } from "@/features/fire/engine/analysis";
import { getSource } from "@/content/sources";
import { EvidenceBadge } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { useSize } from "@/shared/hooks/useSize";
import type { BoundaryPanel } from "../server/laboratory.service";
import styles from "./Charts.module.scss";

const ML = 46, MR = 14, MT = 12, MB = 42;

const TITLES: Record<BoundaryPanel["id"], L> = {
  micro: l("MICROGRAVEDAD · µg", "MICROGRAVITY · µg"),
  moon: l("LUNA · 0,165 g", "MOON · 0.165 g"),
  earth: l("TIERRA · 1 g", "EARTH · 1 g"),
};

interface Props {
  panel: BoundaryPanel;
  /** Punto de la cabina (ventilación en cm/s y O₂ en %). */
  flow: number;
  o2: number;
  /** true si la gravedad del ambiente corresponde a este panel. */
  active: boolean;
  /** Mapa principal: ocupa la columna grande del laboratorio. */
  featured?: boolean;
  onPick: (flow: number, o2: number) => void;
}

/**
 * Diagrama de fases de inflamabilidad: O₂ frente a flujo para una gravedad.
 * Muestra la frontera con su intervalo, los ensayos publicados y el punto de
 * la cabina. Al pulsar sobre el mapa se mueve la cabina a ese punto.
 */
export function FlammabilityMap({ panel, flow, o2, active, featured = false, onPick }: Props) {
  const { t } = useLang();
  // La gráfica se dibuja al tamaño real de su panel (sin escalar el texto).
  const { ref, width: W, height: H, ready } = useSize<HTMLDivElement>({ width: 520, height: 420 });
  const X = scaleLinear([0, 40], [ML, W - MR]);
  const Y = scaleLinear([10, 40], [H - MB, MT]);
  const clampY = (v: number): number => Y(Math.max(10, Math.min(40, v)));
  const yTicks = H > 300 ? [10, 15, 20, 25, 30, 35, 40] : [10, 20, 30, 40];
  const xTicks = W > 420 ? [0, 5, 10, 15, 20, 25, 30, 35, 40] : [0, 10, 20, 30, 40];
  const c = panel.curve;
  const path = line<CurvePoint>().x((d) => X(d.u)).y((d) => clampY(d.loc));
  const band = area<CurvePoint>().x((d) => X(d.u)).y0((d) => clampY(d.lo)).y1((d) => clampY(d.hi));
  const fire = area<CurvePoint>().x((d) => X(d.u)).y0(() => Y(40)).y1((d) => clampY(d.hi));
  const safe = area<CurvePoint>().x((d) => X(d.u)).y0((d) => clampY(d.lo)).y1(() => Y(10));
  const predicted = panel.evidence === "D";

  const pick = (e: React.MouseEvent<SVGSVGElement>): void => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    if (px < ML || px > W - MR || py < MT || py > H - MB) return;
    onPick(Math.round(X.invert(px)), Math.round(Y.invert(py) * 2) / 2);
  };

  return (
    <figure className={`${styles.map} ${active ? styles.active : ""} ${featured ? styles.featured : ""}`}>
      <figcaption>
        <b>{t(TITLES[panel.id])}</b>
        <EvidenceBadge level={panel.evidence} compact />
      </figcaption>
      <div ref={ref} className={styles.plotArea} data-ready={ready}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} onClick={pick} role="img" aria-label={t(TITLES[panel.id])}>
        {c.length > 0 ? (
          <>
            <path d={fire(c) ?? ""} className={styles.fire} />
            <path d={safe(c) ?? ""} className={styles.safe} />
            <path d={band(c) ?? ""} className={`${styles.band} ${predicted ? styles.predicted : ""}`} />
            <path d={path(c) ?? ""} className={`${styles.frontier} ${predicted ? styles.dashed : ""}`} />
          </>
        ) : (
          <rect x={ML} y={MT} width={W - ML - MR} height={H - MT - MB} className={styles.noData} />
        )}
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={ML} x2={W - MR} y1={Y(v)} y2={Y(v)} className={styles.grid} />
            <text x={ML - 8} y={Y(v) + 4} textAnchor="end" className={styles.tick}>
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <g key={`x${v}`}>
            <line x1={X(v)} x2={X(v)} y1={MT} y2={H - MB} className={styles.grid} />
            <text x={X(v)} y={H - MB + 16} textAnchor="middle" className={styles.tick}>
              {v}
            </text>
          </g>
        ))}
        <line x1={ML} x2={W - MR} y1={Y(20.9)} y2={Y(20.9)} className={styles.air} />
        <text x={W - MR - 6} y={Y(20.9) - 5} textAnchor="end" className={styles.airLabel}>
          {t(l("aire 20,9 %", "air 20.9%"))}
        </text>
        <text x={(ML + W - MR) / 2} y={H - 8} textAnchor="middle" className={styles.axis}>
          {t(l("ventilación (cm/s)", "ventilation (cm/s)"))}
        </text>
        <text x={13} y={(MT + H - MB) / 2} textAnchor="middle" transform={`rotate(-90 13 ${(MT + H - MB) / 2})`} className={styles.axis}>
          O₂ (%)
        </text>
        {c.length === 0 && (
          <text x={(ML + W - MR) / 2} y={H / 2} textAnchor="middle" className={styles.noDataLabel}>
            ∅ {t(l("Sin frontera publicada", "No published boundary"))}
          </text>
        )}
        {c.length > 0 && (
          <>
            <text x={ML + 10} y={MT + 20} className={styles.zoneFire}>
              {t(l("PROPAGA", "SPREADS"))}
            </text>
            <text x={ML + 10} y={H - MB - 10} className={styles.zoneSafe}>
              {t(l("NO PROPAGA", "NO SPREAD"))}
            </text>
          </>
        )}
        {panel.refs.map((r, i) => {
          const src = getSource(r.source);
          const title = `${r.label} · ${r.p} kPa · ${src?.short ?? ""}${r.origin === "predicted" ? ` · ${t(l("predicción", "prediction"))}` : ""}`;
          const x = X(Math.min(40, r.u));
          if (r.outcome === "limit")
            return (
              <g key={i} className={styles.refLimit}>
                <title>{title}</title>
                <line x1={x} x2={x} y1={clampY(r.o2)} y2={clampY(r.o2Hi ?? r.o2)} />
                <line x1={x - 6} x2={x + 6} y1={clampY(r.o2)} y2={clampY(r.o2)} />
                {r.o2Hi != null && <line x1={x - 6} x2={x + 6} y1={clampY(r.o2Hi)} y2={clampY(r.o2Hi)} />}
                <circle cx={x} cy={clampY(r.o2)} r="3.6" />
              </g>
            );
          return r.outcome === "spread" ? (
            <path key={i} d={`M ${x} ${clampY(r.o2) - 7} l 6.4 11.2 h -12.8 Z`} className={styles.refSpread}>
              <title>{title}</title>
            </path>
          ) : (
            <circle key={i} cx={x} cy={clampY(r.o2)} r="5.4" className={styles.refNo}>
              <title>{title}</title>
            </circle>
          );
        })}
        <g className={`${styles.cabin} ${active ? styles.cabinOn : ""}`} transform={`translate(${X(Math.min(40, flow))} ${clampY(o2)})`}>
          <title>{t(l("Tu cabina", "Your cabin"))}</title>
          <circle r="14" className={styles.cabinHalo} />
          <circle r="5.5" />
          <path d="M -20 0 h 9 M 11 0 h 9 M 0 -20 v 9 M 0 11 v 9" />
        </g>
      </svg>
      </div>
    </figure>
  );
}
