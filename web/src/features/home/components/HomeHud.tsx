"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { l } from "@/content/i18n";
import { MODULES } from "@/content/modules";
import { MODULE_ROUTE } from "@/content/routes";
import { worldCtl, worldStore } from "@/features/world/controller";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import { gravity, num, pressure } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import { ppO2 } from "@/shared/lib/units";
import { DragHint } from "@/shared/components/DragHint";
import styles from "./HomeHud.module.scss";

/**
 * Vista general: etiquetas clicables sobre cada módulo del sitio lunar y el
 * tablero de los cuatro ambientes habitables del reto.
 */
export function HomeHud() {
  const { t, lang } = useLang();
  const hovered = useStore(worldStore, (s) => s.hovered);
  const units = useStore(appStore, (s) => s.units);
  const booted = useStore(appStore, (s) => s.booted);

  return (
    <div className={`${styles.hud} ${booted ? styles.on : ""}`}>
      <header className={styles.title}>
        <span>{t(l("CENTRO DE MANDO · SITIO LUNAR", "COMMAND CENTRE · LUNAR SITE"))}</span>
        <h1>{t(l("Seguridad contra incendios en ambientes habitables", "Fire safety in habitable environments"))}</h1>
        <DragHint />
      </header>

      {/* Etiquetas ancladas al 3D: el mundo las coloca en cada cuadro. */}
      <div className={styles.labels}>
        {MODULES.map((m) => (
          <Link
            key={m.id}
            href={MODULE_ROUTE(m.id)}
            data-anchor={m.id}
            className={`${styles.label} ${hovered === m.id ? styles.hot : ""}`}
            style={{ "--accent": m.accent } as React.CSSProperties}
            onMouseEnter={() => worldCtl.hover(m.id)}
            onMouseLeave={() => worldCtl.hover(null)}
            onFocus={() => worldCtl.hover(m.id)}
            onBlur={() => worldCtl.hover(null)}
            aria-label={`${t(m.name)} · ${m.code}`}
          >
            <span className={styles.pin}>
              <i />
              <b>{t(m.label)}</b>
            </span>
            <span className={styles.stem} />
          </Link>
        ))}
      </div>

      <section className={styles.board} aria-label={t(l("Ambientes habitables", "Habitable environments"))}>
        <div className={styles.boardHead}>
          <span>{t(l("AMBIENTES HABITABLES", "HABITABLE ENVIRONMENTS"))}</span>
          <span>{t(l("ATMÓSFERA DE DISEÑO", "DESIGN ATMOSPHERE"))}</span>
        </div>
        <ul>
          {MODULES.map((m) => {
            const v = m.variants[0]!;
            return (
              <li key={m.id}>
                <Link
                  href={MODULE_ROUTE(m.id)}
                  className={hovered === m.id ? styles.rowHot : undefined}
                  style={{ "--accent": m.accent } as React.CSSProperties}
                  onMouseEnter={() => worldCtl.hover(m.id)}
                  onMouseLeave={() => worldCtl.hover(null)}
                >
                  <code>{m.code}</code>
                  <b>{t(m.name)}</b>
                  <span>{gravity(v.g, lang)}</span>
                  <span>{num(v.o2, v.o2 % 1 ? 1 : 0, lang)} % O₂</span>
                  <span>{pressure(v.P, units, lang)}</span>
                  <span className={styles.pp}>ppO₂ {num(ppO2(v.o2, v.P), 1, lang)}</span>
                  <ArrowRight size={14} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
