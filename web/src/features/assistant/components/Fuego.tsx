"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./Fuego.module.scss";

export type FuegoMood = "idle" | "talk" | "think" | "listen" | "happy";

interface FuegoProps {
  /** Gravedad del ambiente activo (en g₀): decide la forma de la llama. */
  gravity: number;
  size?: number;
  mood?: FuegoMood;
  /** Reproduce la entrada: una llama que cae y se vuelve esfera. */
  intro?: boolean;
  className?: string;
}

const mix = (a: number[], b: number[], k: number): string =>
  `rgb(${a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * k)).join(",")})`;

/** Silueta de la llama: s = 0 esfera (microgravedad) … s = 1 gota alargada (1 g). */
function bodyPath(s: number, r: number, cx: number, cy: number): string {
  const k = 0.5523 * r;
  const T = r * (1 + 1.25 * s);
  const k1 = k * (1 - 0.86 * s);
  const sh = k * (1 + 0.55 * s);
  return `M ${cx} ${cy - T} C ${cx + k1} ${cy - T} ${cx + r} ${cy - sh} ${cx + r} ${cy} C ${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r} C ${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy} C ${cx - r} ${cy - sh} ${cx - k1} ${cy - T} ${cx} ${cy - T} Z`;
}

/** Forma objetivo según la gravedad: la flotabilidad crece como g^(1/3). */
export const shapeFor = (g: number): number => Math.min(1, Math.cbrt(Math.max(g, 0)));

/**
 * FUEGO, la mascota y asistente de la plataforma: una llama con carita que
 * cambia de forma con la gravedad del ambiente. En la Tierra es una gota
 * amarilla; en caída libre se vuelve una esfera azul, igual que una llama real.
 */
export function Fuego({ gravity, size = 96, mood = "idle", intro = false, className }: FuegoProps) {
  const target = shapeFor(gravity);
  const [s, setS] = useState(intro ? 1 : target);
  const sRef = useRef(s);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    let raf = 0;
    const startDelay = intro ? 550 : 0;
    const t0 = performance.now() + startDelay;
    const from = sRef.current;
    const dur = intro ? 1100 : 700;
    const tick = (now: number): void => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      const e = 1 - Math.pow(1 - k, 3);
      sRef.current = from + (target - from) * e;
      setS(sRef.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, intro]);

  const cx = 60, cy = 92, r = 34;
  const outer = mix([47, 123, 255], [255, 106, 42], s);
  const mid = mix([127, 208, 255], [255, 179, 71], s);
  const core = mix([233, 251, 255], [255, 246, 200], s);
  const glow = mix([91, 157, 255], [255, 135, 56], s);
  const eyeDy = mood === "think" ? -2.5 : 0;

  return (
    <span
      className={[styles.fuego, intro ? styles.intro : "", styles[mood], className ?? ""].join(" ")}
      style={{ "--size": `${size}px`, "--glow": glow } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 140" className={styles.svg}>
        <defs>
          <radialGradient id={`b${uid}`} cx="50%" cy="68%" r="62%">
            <stop offset="0%" stopColor={core} />
            <stop offset="52%" stopColor={mid} />
            <stop offset="100%" stopColor={outer} />
          </radialGradient>
          <radialGradient id={`h${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
            <stop offset="100%" stopColor={glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy - 6 * s} r={r + 22} fill={`url(#h${uid})`} className={styles.halo} />
        <g className={styles.body}>
          <path d={bodyPath(s, r, cx, cy)} fill={`url(#b${uid})`} />
          <path d={bodyPath(s * 0.9, r * 0.6, cx, cy + 7)} fill={core} opacity="0.5" />
          <ellipse cx={cx - 13} cy={cy - 17} rx="6.5" ry="3.6" fill="#fff" opacity="0.55" transform={`rotate(-28 ${cx - 13} ${cy - 17})`} />
        </g>
        <g className={styles.face}>
          <g className={styles.eyes} transform={`translate(0 ${eyeDy})`}>
            <ellipse cx={cx - 11.5} cy={cy - 1} rx="4.6" ry="5.8" fill="#0b2038" />
            <ellipse cx={cx + 11.5} cy={cy - 1} rx="4.6" ry="5.8" fill="#0b2038" />
            <circle cx={cx - 10} cy={cy - 3.2} r="1.7" fill="#fff" />
            <circle cx={cx + 13} cy={cy - 3.2} r="1.7" fill="#fff" />
          </g>
          <circle cx={cx - 20.5} cy={cy + 8} r="4" fill="#ff8fa3" opacity="0.42" />
          <circle cx={cx + 20.5} cy={cy + 8} r="4" fill="#ff8fa3" opacity="0.42" />
          {mood === "talk" ? (
            <ellipse cx={cx} cy={cy + 12} rx="5" ry="4" fill="#0b2038" className={styles.mouthTalk} />
          ) : mood === "think" ? (
            <path d={`M ${cx - 5} ${cy + 12} h 10`} stroke="#0b2038" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          ) : mood === "listen" ? (
            <circle cx={cx} cy={cy + 12} r="3" fill="#0b2038" />
          ) : (
            <path d={`M ${cx - 7} ${cy + 9.5} Q ${cx} ${cy + 17.5} ${cx + 7} ${cy + 9.5}`} stroke="#0b2038" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          )}
        </g>
      </svg>
    </span>
  );
}
