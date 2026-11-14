"use client";

import { scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import styles from "./Sparkline.module.scss";

export interface SparkSeries {
  values: number[];
  color: string;
  dashed?: boolean;
  fill?: boolean;
}

interface SparklineProps {
  title: string;
  /** Valor actual ya formateado. */
  display: string;
  t: number[];
  series: SparkSeries[];
  /** Mínimo del eje y y máximo mínimo (el eje crece si los datos lo superan). */
  yMin?: number;
  yMaxFloor?: number;
  /** Líneas de referencia (umbrales) con su etiqueta. */
  thresholds?: { y: number; label: string; color: string }[];
  tone?: "ok" | "warn" | "bad";
}

const W = 220, H = 74, PAD = 4;

/**
 * Gráfica compacta de telemetría (SVG propio con d3-scale y d3-shape).
 * Dibuja una o más series contra el tiempo, con umbrales rotulados.
 */
export function Sparkline({ title, display, t, series, yMin = 0, yMaxFloor = 1, thresholds = [], tone = "ok" }: SparklineProps) {
  const all = series.flatMap((s) => s.values.filter(Number.isFinite));
  const yMax = Math.max(yMaxFloor, ...all, ...thresholds.map((th) => th.y * 1.08)) * 1.06;
  const t0 = t[0] ?? 0, t1 = Math.max(t[t.length - 1] ?? 1, t0 + 30);
  const x = scaleLinear([t0, t1], [PAD, W - PAD]);
  const y = scaleLinear([yMin, yMax], [H - PAD, PAD]);
  const path = line<number>()
    .defined((d) => Number.isFinite(d))
    .x((_, i) => x(t[i] ?? 0))
    .y((d) => y(d));
  const fillPath = area<number>()
    .defined((d) => Number.isFinite(d))
    .x((_, i) => x(t[i] ?? 0))
    .y0(y(yMin))
    .y1((d) => y(d));
  return (
    <figure className={`${styles.spark} ${styles[tone]}`}>
      <figcaption>
        <span>{title}</span>
        <output>{display}</output>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${title}: ${display}`}>
        {[0.25, 0.5, 0.75].map((k) => (
          <line key={k} x1={PAD} x2={W - PAD} y1={PAD + k * (H - 2 * PAD)} y2={PAD + k * (H - 2 * PAD)} className={styles.grid} />
        ))}
        {thresholds.map((th) => (
          <g key={th.label}>
            <line x1={PAD} x2={W - PAD} y1={y(th.y)} y2={y(th.y)} stroke={th.color} strokeDasharray="4 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        {series.map((s, i) => (
          <g key={i}>
            {s.fill && <path d={fillPath(s.values) ?? ""} fill={s.color} opacity="0.14" />}
            <path d={path(s.values) ?? ""} fill="none" stroke={s.color} strokeWidth="2.4" strokeDasharray={s.dashed ? "5 4" : undefined} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      {thresholds.length > 0 && (
        <div className={styles.legend}>
          {thresholds.map((th) => (
            <span key={th.label} style={{ "--c": th.color } as React.CSSProperties}>
              {th.label}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}
