"use client";

import { scaleLinear, scaleLog } from "d3-scale";
import { area, line } from "d3-shape";
import { l } from "@/content/i18n";
import { SAFFIRE_CABIN, SMAC_CO, type DropletCurve } from "@/features/fire/engine/analysis";
import { lognormal } from "@/features/fire/engine/physics";
import { useLang } from "@/shared/hooks/useLang";
import { useSize } from "@/shared/hooks/useSize";
import { num } from "@/shared/lib/format";
import styles from "./Charts.module.scss";

// ── Gotas: curva D²(t) ──────────────────────────────────────────────────────
/** Curva D²(t) de una gota (ley d²), con extinción y tramo de llama fría. */
export function DropletChart({ curve }: { curve: DropletCurve }) {
  const { t, lang } = useLang();
  const { ref, width: W, height: H, ready } = useSize<HTMLDivElement>({ width: 760, height: 380 });
  const ML = 58, MR = 22, MT = 18, MB = 48;
  const tMax = Math.max(4, (curve.cool.length ? curve.cool[curve.cool.length - 1]!.t : curve.tEnd) * 1.12);
  const x = scaleLinear([0, tMax], [ML, W - MR]);
  const y = scaleLinear([0, curve.d0 * curve.d0 * 1.08], [H - MB, MT]);
  const path = line<{ t: number; d2: number }>().x((d) => x(d.t)).y((d) => y(d.d2));
  const fill = area<{ t: number; d2: number }>().x((d) => x(d.t)).y0(y(0)).y1((d) => y(d.d2));
  const end = curve.points[curve.points.length - 1]!;
  const ticksX = x.ticks(6), ticksY = y.ticks(5);
  return (
    <div ref={ref} className={styles.chartBox} data-ready={ready}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="D²(t)">
      {ticksY.map((v) => (
        <g key={`y${v}`}>
          <line x1={ML} x2={W - MR} y1={y(v)} y2={y(v)} className={styles.cgrid} />
          <text x={ML - 9} y={y(v) + 4} textAnchor="end">{num(v, 0, lang)}</text>
        </g>
      ))}
      {ticksX.map((v) => (
        <text key={`x${v}`} x={x(v)} y={H - MB + 19} textAnchor="middle">{num(v, 0, lang)}</text>
      ))}
      <text x={(ML + W - MR) / 2} y={H - 9} textAnchor="middle" className={styles.caxis}>{t(l("tiempo (s)", "time (s)"))}</text>
      <text x={16} y={(MT + H - MB) / 2} textAnchor="middle" transform={`rotate(-90 16 ${(MT + H - MB) / 2})`} className={styles.caxis}>D² (mm²)</text>
      {curve.mode !== "no_ignition" && (
        <>
          <path d={fill(curve.points) ?? ""} fill="#ff8738" className={styles.carea} />
          <path d={path(curve.points) ?? ""} stroke="#ff8738" className={styles.cline} />
          {curve.cool.length > 0 && <path d={path(curve.cool) ?? ""} stroke="#b68cff" strokeDasharray="6 5" className={styles.cline} />}
          <circle cx={x(end.t)} cy={y(end.d2)} r="6.5" fill="#fff" stroke="#ff8738" strokeWidth="3" />
          <text x={Math.min(W - MR - 4, x(end.t) + 12)} y={y(end.d2) - 14} className={styles.cnote} textAnchor={x(end.t) > W * 0.7 ? "end" : "start"}>
            {curve.mode === "burnout"
              ? t(l("gota consumida", "droplet consumed"))
              : curve.mode === "extinction"
                ? `${t(l("extinción", "extinction"))} · D = ${num(curve.dEnd, 2, lang)} mm`
                : t(l("extinción radiativa", "radiative extinction"))}
          </text>
          {curve.cool.length > 0 && (
            <text x={x(curve.cool[Math.floor(curve.cool.length / 2)]!.t)} y={y(curve.cool[Math.floor(curve.cool.length / 2)]!.d2) - 10} fill="#b68cff" className={styles.cnote} style={{ fill: "#b68cff" }}>
              {t(l("llama fría", "cool flame"))}
            </text>
          )}
        </>
      )}
      {curve.mode === "no_ignition" && (
        <text x={W / 2} y={H / 2} textAnchor="middle" className={styles.cnote}>{t(l("La mezcla no sostiene la llama de la gota", "The mixture does not sustain the droplet flame"))}</text>
      )}
    </svg>
    </div>
  );
}

// ── Humo: distribución de tamaños frente al detector ────────────────────────
/**
 * Firmas de humo representativas del rango publicado por SAME-2 (100–600 nm):
 * los humos de Teflon y Kapton son los más finos; celulosa, silicona y Pyrell,
 * los más gruesos. Los parámetros de cada curva son ilustrativos dentro de ese rango.
 */
export const SMOKE_SIGNATURES = [
  { id: "kapton", name: "Kapton", dg: 0.11, sg: 1.7, color: "#ffc53d" },
  { id: "teflon", name: "Teflon", dg: 0.14, sg: 1.75, color: "#ff8738" },
  { id: "cotton", name: l("Algodón", "Cotton"), dg: 0.34, sg: 1.9, color: "#35d8f2" },
  { id: "silicone", name: l("Silicona", "Silicone"), dg: 0.4, sg: 1.9, color: "#00d49a" },
  { id: "pyrell", name: "Pyrell", dg: 0.46, sg: 1.95, color: "#b68cff" },
] as const;

/** Fracción (por número) de partículas mayores que un diámetro dado. */
export function fractionAbove(dUm: number, dg: number, sg: number): number {
  const z = Math.log(dUm / dg) / Math.log(sg);
  // Aproximación de la función de distribución normal.
  const k = 1 / (1 + 0.2316419 * Math.abs(z));
  const p = 0.3989423 * Math.exp((-z * z) / 2) * k * (0.3193815 + k * (-0.3565638 + k * (1.781478 + k * (-1.821256 + k * 1.330274))));
  return z >= 0 ? p : 1 - p;
}

/** Distribuciones lognormales del humo por material sobre la banda de sensibilidad del detector de la ISS. */
export function SmokeChart() {
  const { t, lang } = useLang();
  const { ref, width: W, height: H, ready } = useSize<HTMLDivElement>({ width: 760, height: 380 });
  const ML = 22, MR = 22, MT = 18, MB = 48;
  const x = scaleLog([0.03, 3], [ML, W - MR]);
  const y = scaleLinear([0, 0.82], [H - MB, MT]);
  const ds = Array.from({ length: 90 }, (_, i) => 0.03 * Math.pow(100, i / 89));
  return (
    <div ref={ref} className={styles.chartBox} data-ready={ready}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label={t(l("Firma de humo", "Smoke signature"))}>
      <rect x={x(0.6)} y={MT} width={W - MR - x(0.6)} height={H - MT - MB} className={styles.detector} />
      <text x={W - MR - 10} y={MT + 22} textAnchor="end" className={styles.cnote}>{t(l("Detector ISS: sensible > 0,6 µm", "ISS detector: sensitive > 0.6 µm"))}</text>
      <text x={W - MR - 10} y={MT + 42} textAnchor="end">{t(l("mejor > 1 µm", "best > 1 µm"))}</text>
      <rect x={x(0.2)} y={H - MB - 7} width={x(0.4) - x(0.2)} height={7} fill="rgba(234,243,248,0.5)" />
      <text x={(x(0.2) + x(0.4)) / 2} y={H - MB - 13} textAnchor="middle">SAME-2: 200–400 nm</text>
      {[0.03, 0.1, 0.3, 1, 3].map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={MT} y2={H - MB} className={styles.cgrid} />
          <text x={x(v)} y={H - MB + 19} textAnchor="middle">{num(v, v < 0.1 ? 2 : v < 1 ? 1 : 0, lang)}</text>
        </g>
      ))}
      <text x={(ML + W - MR) / 2} y={H - 9} textAnchor="middle" className={styles.caxis}>{t(l("diámetro de partícula (µm)", "particle diameter (µm)"))}</text>
      {SMOKE_SIGNATURES.map((s) => {
        const pts = ds.map((d) => [x(d), y(lognormal(d, s.dg, s.sg))] as [number, number]);
        return <path key={s.id} d={line()(pts) ?? ""} stroke={s.color} className={styles.cline} />;
      })}
      {/* Leyenda: un rótulo por material, con el color de su curva. */}
      {SMOKE_SIGNATURES.map((s, i) => (
        <g key={s.id} transform={`translate(${ML + 14} ${MT + 18 + i * 22})`}>
          <line x1={0} x2={22} y1={-4} y2={-4} stroke={s.color} className={styles.cline} />
          <text x={30} y={0} className={styles.cnote}>
            {typeof s.name === "string" ? s.name : t(s.name)}
          </text>
        </g>
      ))}
    </svg>
    </div>
  );
}

// ── Cabina: CO de Saffire frente a los límites de exposición ────────────────
/** CO acumulado en Saffire IV–VI y el mismo fuego llevado al volumen y la presión de la cabina elegida. */
export function CabinChart({ volume, pressure }: { volume: number; pressure: number }) {
  const { t, lang } = useLang();
  const { ref, width: W, height: H, ready } = useSize<HTMLDivElement>({ width: 760, height: 380 });
  const ML = 190, MR = 64, MT = 32, MB = 46;
  const rows = SAFFIRE_CABIN.map((r) => ({ ...r, scaled: (r.co * 16.7 * r.p) / (volume * pressure) }));
  const max = Math.max(480, ...rows.map((r) => r.scaled)) * 1.05;
  const x = scaleLinear([0, max], [ML, W - MR]);
  const rowH = (H - MT - MB) / rows.length;
  return (
    <div ref={ref} className={styles.chartBox} data-ready={ready}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="CO">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="rgba(255,135,56,0.22)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ff8738" strokeWidth="2" />
        </pattern>
      </defs>
      {x.ticks(5).map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={MT} y2={H - MB} className={styles.cgrid} />
          <text x={x(v)} y={H - MB + 19} textAnchor="middle">{num(v, 0, lang)}</text>
        </g>
      ))}
      <text x={(ML + W - MR) / 2} y={H - 9} textAnchor="middle" className={styles.caxis}>{t(l("aumento de CO (ppm)", "CO increase (ppm)"))}</text>
      {rows.map((r, i) => {
        const y0 = MT + i * rowH;
        return (
          <g key={r.id}>
            <text x={ML - 12} y={y0 + rowH * 0.4} textAnchor="end" className={styles.cnote}>Saffire {r.id}</text>
            <text x={ML - 12} y={y0 + rowH * 0.4 + 17} textAnchor="end">{r.material}</text>
            <rect x={ML} y={y0 + rowH * 0.14} width={x(r.co) - ML} height={rowH * 0.3} rx="3" fill="#ffc53d" />
            <text x={x(r.co) + 8} y={y0 + rowH * 0.29 + 4}>{r.co}</text>
            <rect x={ML} y={y0 + rowH * 0.5} width={Math.max(1, x(r.scaled) - ML)} height={rowH * 0.3} rx="3" className={styles.derived} stroke="#ff8738" />
            <text x={x(r.scaled) + 8} y={y0 + rowH * 0.65 + 4} style={{ fill: "#ff8738" }}>{num(r.scaled, 0, lang)}</text>
          </g>
        );
      })}
      {[SMAC_CO.h24, SMAC_CO.h1].map((v, i) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={MT - 8} y2={H - MB} className={styles.smac} />
          <text x={x(v)} y={MT - 13} textAnchor="middle" style={{ fill: "#ff5c6c" }}>SMAC {i ? "1 h" : "24 h"}</text>
        </g>
      ))}
    </svg>
    </div>
  );
}
