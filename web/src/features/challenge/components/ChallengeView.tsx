"use client";

import Link from "next/link";
import { ArrowRight, CircleSlash, Flame, Target } from "lucide-react";
import { CHALLENGE } from "@/content/challenge";
import { l } from "@/content/i18n";
import { ROUTES } from "@/content/routes";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./Challenge.module.scss";

/**
 * Nuestro Reto: de dónde surge Flame in Freefall, qué pide NASA y en qué
 * pantalla de la plataforma se resuelve cada objetivo.
 */
export function ChallengeView() {
  const { t } = useLang();
  return (
    <Workspace
      eyebrow={l(`NUESTRO RETO · ${CHALLENGE.event.toUpperCase()}`, `OUR CHALLENGE · ${CHALLENGE.event.toUpperCase()}`)}
      title={l(CHALLENGE.name, CHALLENGE.name)}
      lede={CHALLENGE.problem}
      aside={<SourceChips ids={CHALLENGE.sources} />}
    >
      <p className={styles.ask}>
        <Target size={18} aria-hidden="true" />
        <span>
          <b>{t(l("Lo que pide NASA.", "What NASA asks for."))}</b> {t(CHALLENGE.ask)} <em>{t(CHALLENGE.environments)}</em>
        </span>
      </p>

      <div className={styles.layout}>
        <section className={styles.origin} aria-label={t(l("De dónde surge", "Where it comes from"))}>
          <h2>
            <Flame size={15} aria-hidden="true" />
            {t(l("De dónde surge", "Where it comes from"))}
          </h2>
          <ul>
            {CHALLENGE.origin.map((f) => (
              <li key={f.title.es}>
                <b>{t(f.title)}</b>
                <p>{t(f.text)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.goals} aria-label={t(l("Objetivos del reto", "Challenge goals"))}>
          <h2>
            <Target size={15} aria-hidden="true" />
            {t(l("Objetivos del reto y cómo los resolvemos", "Challenge goals and how we solve them"))}
          </h2>
          <ol>
            {CHALLENGE.goals.map((g) => {
              const route = ROUTES.find((r) => r.id === g.route)!;
              return (
                <li key={g.id}>
                  <i>{g.id}</i>
                  <div>
                    <b>{t(g.ask)}</b>
                    <p>{t(g.answer)}</p>
                  </div>
                  <Link href={route.href} aria-label={`${g.id}: ${t(route.label)}`}>
                    {t(route.label)}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className={styles.out}>
            <CircleSlash size={15} aria-hidden="true" />
            {t(CHALLENGE.outOfScope)}
          </p>
        </section>
      </div>
    </Workspace>
  );
}
