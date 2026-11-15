"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { MODULES } from "@/content/modules";
import { MODULE_ROUTE, ROUTES } from "@/content/routes";
import { Carousel } from "@/shared/components/Carousel";
import { ClampText } from "@/shared/components/ClampText";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import { gravity, num } from "@/shared/lib/format";
import styles from "./Modules.module.scss";

interface Card {
  href: string;
  code: string;
  title: L;
  text: L;
  image: string;
  accent?: string;
  chips?: string[];
}

const route = (id: string) => ROUTES.find((r) => r.id === id)!;

/**
 * Selector de módulos: los ambientes habitables del reto y las
 * herramientas de análisis, en un carrusel de tarjetas con el botón "Entrar".
 * Llevan al módulo la imagen y el botón "Entrar"; el texto de la tarjeta se
 * puede seleccionar con el cursor normal.
 */
export function ModulesView() {
  const { t, lang } = useLang();
  const cards: Card[] = [
    { href: "/", code: "HOME", title: l("Vista general", "Overview"), text: route("home").description, image: "/img/card-home.webp" },
    ...MODULES.map((m): Card => {
      const v = m.variants[0]!;
      return {
        href: MODULE_ROUTE(m.id),
        code: m.code,
        title: m.name,
        text: m.description,
        image: `/img/card-${m.id}.webp`,
        accent: m.accent,
        chips: [gravity(v.g, lang), `${num(v.o2, v.o2 % 1 ? 1 : 0, lang)} % O₂`],
      };
    }),
    { href: route("challenge").href, code: "RETO", title: route("challenge").label, text: route("challenge").description, image: "/img/card-challenge.webp" },
    { href: route("guide").href, code: "O1", title: route("guide").label, text: route("guide").description, image: "/img/card-guide.webp" },
    { href: route("local").href, code: "PSI", title: route("local").label, text: route("local").description, image: "/img/card-analyst.webp" },
    { href: "/laboratorio", code: "O2", title: route("lab").label, text: route("lab").description, image: "/img/card-lab.webp" },
    { href: "/radar", code: "O3", title: route("radar").label, text: route("radar").description, image: "/img/card-radar.webp" },
    { href: "/tierra", code: "O4", title: route("earth").label, text: route("earth").description, image: "/img/card-earth.webp" },
  ];

  return (
    <Workspace
      eyebrow={l("MÓDULOS", "MODULES")}
      title={l("Elige un ambiente o una herramienta", "Choose an environment or a tool")}
      lede={l("Cada módulo es uno de los ambientes habitables del reto y cambia el contexto de toda la plataforma.", "Each module is one of the challenge's habitable environments and sets the context for the whole platform.")}
    >
      <Carousel label={t(l("Módulos de la plataforma", "Platform modules"))}>
        {cards.map((c, i) => (
          <article key={c.href} className={styles.card} style={c.accent ? ({ "--accent": c.accent } as React.CSSProperties) : undefined}>
            <header>
              <h2>
                {String(i + 1).padStart(2, "0")}. {t(c.title)}
              </h2>
              <code>{c.code}</code>
            </header>
            {/* La imagen también entra al módulo; el teclado usa el botón "Entrar". */}
            <Link href={c.href} className={styles.shot} tabIndex={-1} aria-hidden="true" draggable={false}>
              {/* Miniaturas ya optimizadas (WebP de 720 px): se sirven tal cual. */}
              <Image src={c.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" priority={i < 3} unoptimized draggable={false} />
            </Link>
            <ClampText lines={3}>{t(c.text)}</ClampText>
            <footer>
              <span className={styles.chips}>
                {c.chips?.map((x) => (
                  <i key={x}>{x}</i>
                ))}
              </span>
              <Link href={c.href} className={styles.enter} draggable={false} aria-label={`${t(l("Entrar", "Enter"))}: ${t(c.title)}`}>
                {t(l("Entrar", "Enter"))}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </footer>
          </article>
        ))}
      </Carousel>
    </Workspace>
  );
}
