"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { APP_NAME, l } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, setPrefs } from "@/shared/lib/appStore";
import { gravity, num } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import { useActiveEnv } from "../hooks/useActiveEnv";
import styles from "./TopBar.module.scss";

/** Reloj de misión (hora local). Solo se dibuja en el navegador para evitar desajustes con el servidor. */
function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = (): void => setNow(new Date().toLocaleTimeString("es-ES", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <time className={styles.clock}>{now}</time>;
}

/** Chip con el ambiente activo: nombre, gravedad y O₂. Siempre visible. */
function EnvChip() {
  const { t, lang } = useLang();
  const env = useActiveEnv();
  const s = env.scenario;
  return (
    <span className={styles.env} style={{ "--accent": env.module?.accent ?? "var(--color-accent)" } as React.CSSProperties}>
      <i />
      <b>{t(env.label)}</b>
      <span>{gravity(env.g, lang)}</span>
      {s && <span>{num(s.o2, s.o2 % 1 ? 1 : 0, lang)} % O₂</span>}
    </span>
  );
}

/** Barra superior del centro de mando. */
export function TopBar() {
  const { t, lang } = useLang();
  const online = useStore(appStore, (s) => s.online);
  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.brand} aria-label={APP_NAME}>
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="15" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 3.5c3.2 3.6 5.4 6.6 5.4 10.2a5.4 5.4 0 1 1-10.8 0c0-3.6 2.2-6.6 5.4-10.2Z" fill="var(--color-warm)" />
          <circle cx="14" cy="15.4" r="3.1" fill="var(--color-accent)" />
        </svg>
        <span>{APP_NAME}</span>
      </Link>
      <span className={`${styles.status} ${online === false ? styles.off : ""}`}>
        <i />
        {online === false ? t(l("RECONECTANDO", "RECONNECTING")) : t(l("SISTEMA EN LÍNEA", "SYSTEM ONLINE"))}
      </span>
      <Suspense fallback={null}>
        <EnvChip />
      </Suspense>
      <nav className={styles.nav} aria-label={t(l("Accesos", "Shortcuts"))}>
        <Link href="/referencias">INFO</Link>
        <Link href="/laboratorio">{t(l("LABORATORIO", "LABORATORY"))}</Link>
        <button type="button" onClick={() => appStore.set({ chatOpen: true })}>
          {t(l("AYUDA", "HELP"))}
        </button>
      </nav>
      <div className={styles.lang} role="group" aria-label={t(l("Idioma", "Language"))}>
        {(["es", "en"] as const).map((code) => (
          <button key={code} type="button" aria-pressed={lang === code} onClick={() => setPrefs({ lang: code })}>
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      <Clock />
      <button type="button" className={styles.team} onClick={() => appStore.set({ teamOpen: true })} aria-label={t(l("Equipo", "Team"))} title={t(l("Equipo", "Team"))}>
        <Users size={17} />
      </button>
    </header>
  );
}
