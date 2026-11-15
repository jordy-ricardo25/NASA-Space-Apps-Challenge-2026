"use client";

import { CHALLENGE } from "@/content/challenge";
import { l } from "@/content/i18n";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./Challenge.module.scss";

/**
 * Nuestro Reto: los objetivos del reto Flame in Freefall tal como los publica
 * NASA Space Apps, sin añadidos del equipo.
 */
export function ChallengeView() {
  const { t } = useLang();
  return (
    <Workspace eyebrow={l(`NUESTRO RETO · ${CHALLENGE.event.toUpperCase()}`, `OUR CHALLENGE · ${CHALLENGE.event.toUpperCase()}`)} title={l(CHALLENGE.name, CHALLENGE.name)} aside={<SourceChips ids={CHALLENGE.sources} />}>
      <article className={styles.statement}>
        <h2>{t(CHALLENGE.heading)}</h2>
        <p>{t(CHALLENGE.context)}</p>
        <p>{t(CHALLENGE.task)}</p>
        <ul>
          {CHALLENGE.goals.map((g) => (
            <li key={g.en}>{t(g)}</li>
          ))}
        </ul>
        <p>{t(CHALLENGE.closing)}</p>
        <p>{t(CHALLENGE.earth)}</p>
        <p className={styles.footnote}>{t(CHALLENGE.footnote)}</p>
      </article>
    </Workspace>
  );
}
