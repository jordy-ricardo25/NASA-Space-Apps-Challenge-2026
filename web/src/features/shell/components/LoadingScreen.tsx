"use client";

import { useEffect, useRef, useState } from "react";
import { APP_NAME, APP_TAGLINE, l } from "@/content/i18n";
import { TEAM } from "@/content/team";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";
import styles from "./LoadingScreen.module.scss";

const TRAJECTORY = "M 70 250 C 220 300, 420 60, 668 132";

/** Tiempo que se muestra el sello de Andora Labs antes del viaje a la Luna. */
const SEAL_MS = 2600;

/** Máscaras del logo: se pintan con el color del tema y un brillo que las recorre. */
const MARK = { "--mask": "url(/img/andora-mark.png)" } as React.CSSProperties;
const WORDMARK = { "--mask": "url(/img/andora-wordmark.png)" } as React.CSSProperties;

/**
 * Pantalla de carga inicial. Abre con el sello de Andora Labs y después un
 * cohete viaja hacia la Luna mientras se preparan el motor 3D y los modelos.
 * La línea de carga y el cohete siguen el progreso real del arranque, pero
 * avanzan con una velocidad limitada: suben de forma continua, sin saltos.
 */
export function LoadingScreen() {
  const { t } = useLang();
  const progress = useStore(appStore, (s) => s.progress);
  const stage = useStore(appStore, (s) => s.stage);
  const booted = useStore(appStore, (s) => s.booted);
  const [shown, setShown] = useState(0);
  const [gone, setGone] = useState(false);
  const [phase, setPhase] = useState<"seal" | "flight">("seal");
  // La pantalla se retira cuando terminó la carga, el sello y la barra llegó al final.
  const [done, setDone] = useState(false);
  const ready = useRef({ booted: false, flight: false });
  const pathRef = useRef<SVGPathElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const target = useRef(0);

  useEffect(() => {
    target.current = booted ? 1 : Math.min(progress, 0.985);
    ready.current.booted = booted;
  }, [progress, booted]);

  useEffect(() => {
    const id = setTimeout(() => {
      ready.current.flight = true;
      setPhase("flight");
    }, SEAL_MS);
    return () => clearTimeout(id);
  }, []);

  // El avance visible persigue al real con velocidad limitada (fracción por
  // segundo): aunque la carga real dé saltos, la barra y el cohete suben de
  // forma progresiva.
  useEffect(() => {
    let raf = 0;
    let cur = 0;
    let last = 0;
    let elapsed = 0;
    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      elapsed += dt;
      // Mientras carga, la barra nunca se queda quieta: un avance mínimo por
      // tiempo (hasta el 70 %) cubre los tramos en que el progreso real no cambia.
      const goal = ready.current.booted ? 1 : Math.max(target.current, Math.min(0.7, elapsed / 7));
      const gap = goal - cur;
      const speed = ready.current.booted ? Math.min(0.4, Math.max(0.14, gap * 1.1)) : Math.min(0.22, Math.max(0.01, gap * 1.2));
      cur = Math.min(goal, cur + speed * dt);
      if (cur >= 0.999 && ready.current.booted && ready.current.flight) setDone(true);
      setShown(cur);
      const path = pathRef.current, rocket = rocketRef.current, trail = trailRef.current;
      if (path && rocket && trail) {
        const len = path.getTotalLength();
        const p = path.getPointAtLength(len * cur);
        const q = path.getPointAtLength(Math.min(len, len * cur + 2));
        const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
        rocket.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(ang + 90).toFixed(1)})`);
        trail.style.strokeDasharray = `${len}`;
        trail.style.strokeDashoffset = `${len * (1 - cur)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), 1150);
    return () => clearTimeout(id);
  }, [done]);

  if (gone) return null;
  const pct = Math.round(shown * 100);

  return (
    <div className={`${styles.screen} ${done ? styles.leaving : ""}`} data-phase={phase} role="status" aria-live="polite" aria-label={`${TEAM.name} · ${APP_NAME} · ${t(stage)} ${pct}%`}>
      <div className={styles.stars} />

      {/* Sello del equipo: abre la plataforma y deja paso al viaje. */}
      <div className={styles.seal} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.mark} style={MARK} />
        <span className={styles.wordmark} style={WORDMARK} />
        <span className={styles.presents}>{t(l("PRESENTA", "PRESENTS"))}</span>
      </div>

      <div className={styles.inner}>
        <svg viewBox="0 0 760 330" className={styles.scene} aria-hidden="true">
          <defs>
            <radialGradient id="ls-moon" cx="38%" cy="34%" r="75%">
              <stop offset="0%" stopColor="#f4f6f8" />
              <stop offset="55%" stopColor="#b9c2cb" />
              <stop offset="100%" stopColor="#5d6a78" />
            </radialGradient>
            <radialGradient id="ls-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#35d8f2" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#35d8f2" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ls-trail" x1="0" x2="1">
              <stop offset="0%" stopColor="#35d8f2" stopOpacity="0" />
              <stop offset="100%" stopColor="#35d8f2" />
            </linearGradient>
            <linearGradient id="ls-flame" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="45%" stopColor="#ff8738" />
              <stop offset="100%" stopColor="#ff8738" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Tierra de salida */}
          <circle cx="42" cy="286" r="58" fill="#12365f" />
          <path d="M -10 262 Q 30 240 76 256 Q 96 266 100 286" fill="none" stroke="#35d8f2" strokeOpacity="0.5" strokeWidth="2" />
          <circle cx="42" cy="286" r="66" fill="url(#ls-glow)" />

          {/* Luna de destino */}
          <circle cx="668" cy="104" r="112" fill="url(#ls-glow)" />
          <g className={styles.moon}>
            <circle cx="668" cy="104" r="62" fill="url(#ls-moon)" />
            <g fill="#8794a2" opacity="0.55">
              <circle cx="646" cy="86" r="11" />
              <circle cx="690" cy="118" r="15" />
              <circle cx="676" cy="72" r="6" />
              <circle cx="640" cy="126" r="7" />
              <circle cx="702" cy="88" r="5" />
            </g>
          </g>

          {/* Trayectoria */}
          <path ref={pathRef} d={TRAJECTORY} fill="none" stroke="rgba(169,195,214,0.28)" strokeWidth="1.5" strokeDasharray="3 8" strokeLinecap="round" />
          <path ref={trailRef} d={TRAJECTORY} fill="none" stroke="url(#ls-trail)" strokeWidth="2.6" strokeLinecap="round" />

          {/* Cohete */}
          <g ref={rocketRef}>
            <g className={styles.rocket}>
              <path d="M -4 14 Q 0 44 4 14 Z" fill="url(#ls-flame)" className={styles.exhaust} />
              <path d="M 0 -22 C 9 -12 10 4 7 15 L -7 15 C -10 4 -9 -12 0 -22 Z" fill="#eaf3f8" />
              <path d="M 0 -22 C 4.5 -17 7 -11 8 -5 L -8 -5 C -7 -11 -4.5 -17 0 -22 Z" fill="#ff8738" />
              <circle cx="0" cy="1" r="3.6" fill="#0b2038" stroke="#35d8f2" strokeWidth="1.4" />
              <path d="M -7 8 L -14 19 L -6 15 Z M 7 8 L 14 19 L 6 15 Z" fill="#35d8f2" />
            </g>
          </g>
        </svg>

        <div className={styles.brand}>
          <span className={styles.name}>{APP_NAME}</span>
          <span className={styles.tag}>{t(APP_TAGLINE)}</span>
          <span className={styles.by}>
            <i style={MARK} aria-hidden="true" />
            {t(l("por", "by"))} {TEAM.name}
          </span>
        </div>

        <div className={styles.loader}>
          <div className={styles.track}>
            <div className={styles.fill} style={{ "--p": `${(shown * 100).toFixed(2)}%` } as React.CSSProperties} />
          </div>
          <div className={styles.meta}>
            <span className={styles.stage}>{t(stage)}</span>
            <span className={styles.pct}>{String(pct).padStart(2, "0")}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
