"use client";

import { pct } from "@/shared/lib/format";
import styles from "./Controls.module.scss";

interface SliderProps {
  label: string;
  /** Valor ya formateado con su unidad. */
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  /** Nota bajo el control (por ejemplo, aviso de fuera de rango). */
  hint?: string;
  warn?: boolean;
  disabled?: boolean;
}

/** Control deslizante con etiqueta, valor y nota. */
export function Slider({ label, display, value, min, max, step, onChange, hint, warn, disabled }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className={`${styles.slider} ${warn ? styles.warn : ""}`}>
      <span className={styles.row}>
        <span>{label}</span>
        <output>{display}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": pct(fill / 100) } as React.CSSProperties}
      />
      {hint && <small>{hint}</small>}
    </label>
  );
}

interface SegmentedProps<T extends string> {
  label?: string;
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (v: T) => void;
  wrap?: boolean;
}

/** Selector de opciones excluyentes (pestañas pequeñas o chips). */
export function Segmented<T extends string>({ label, value, options, onChange, wrap }: SegmentedProps<T>) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {label && <span className={styles.segLabel}>{label}</span>}
      <div className={`${styles.segRow} ${wrap ? styles.wrap : ""}`}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={o.value === value} title={o.title} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Barra de valor con su etiqueta y cifra (telemetría). */
export function Meter({ label, display, fraction, color }: { label: string; display: string; fraction: number; color?: string }) {
  return (
    <div className={styles.meter}>
      <span>{label}</span>
      <output>{display}</output>
      <i style={{ "--value": pct(fraction), "--c": color ?? "var(--color-accent)" } as React.CSSProperties} />
    </div>
  );
}
