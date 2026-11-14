"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { l } from "@/content/i18n";
import { TEAM } from "@/content/team";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";
import styles from "./TeamPanel.module.scss";

/** Panel lateral del Equipo: se abre sin salir de la pantalla actual. */
export function TeamPanel() {
  const { t } = useLang();
  const open = useStore(appStore, (s) => s.teamOpen);
  const close = (): void => appStore.set({ teamOpen: false });
  return (
    <aside className={`${styles.panel} ${open ? styles.open : ""}`} aria-hidden={!open} aria-label={t(l("Equipo", "Team"))}>
      <header>
        <div>
          <span className={styles.eyebrow}>{t(l("QUIÉNES SOMOS", "WHO WE ARE"))}</span>
          <h2>{TEAM.project}</h2>
        </div>
        <button type="button" onClick={close} aria-label={t(l("Cerrar", "Close"))} tabIndex={open ? 0 : -1}>
          <X size={18} />
        </button>
      </header>
      <p className={styles.pitch}>{t(TEAM.pitch)}</p>
      <ul className={styles.facts}>
        <li>{t(TEAM.challenge)}</li>
        <li>{t(TEAM.event)}</li>
      </ul>
      <span className={styles.eyebrow}>{t(l("INTEGRANTES", "MEMBERS"))}</span>
      <ul className={styles.members}>
        {TEAM.members.map((m) => (
          <li key={m.name}>
            <i>{m.name.charAt(0)}</i>
            <div>
              <b>{m.name}</b>
              <span>{t(m.role)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className={styles.links}>
        <Link href="/referencias" onClick={close} tabIndex={open ? 0 : -1}>
          {t(l("Datos y referencias", "Data and references"))}
        </Link>
        <Link href="/mapa" onClick={close} tabIndex={open ? 0 : -1}>
          {t(l("Mapa del sitio", "Site map"))}
        </Link>
      </div>
      <p className={styles.note}>{t(TEAM.disclaimer)}</p>
    </aside>
  );
}
