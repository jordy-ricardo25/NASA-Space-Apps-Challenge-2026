"use client";

import type { L } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./Workspace.module.scss";

interface WorkspaceProps<T extends string> {
  eyebrow: L;
  title: L;
  lede?: L;
  tabs?: { id: T; label: L }[];
  tab?: T;
  onTab?: (id: T) => void;
  /** Controles a la derecha del encabezado. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Pantalla de trabajo del centro de mando: un panel a pantalla completa con
 * encabezado, pestañas y cuerpo. El cuerpo nunca desplaza la página.
 */
export function Workspace<T extends string>({ eyebrow, title, lede, tabs, tab, onTab, aside, children }: WorkspaceProps<T>) {
  const { t } = useLang();
  return (
    <div className={styles.workspace}>
      <header className={styles.head}>
        <div className={styles.titles}>
          <span>{t(eyebrow)}</span>
          <h1>{t(title)}</h1>
          {lede && <p>{t(lede)}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      {tabs && (
        <nav className={styles.tabs}>
          {tabs.map((x) => (
            <button key={x.id} type="button" aria-pressed={x.id === tab} onClick={() => onTab?.(x.id)}>
              {t(x.label)}
            </button>
          ))}
        </nav>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

/** Paginador compacto (sustituye al desplazamiento en listas largas). */
export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className={styles.pager}>
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 0} aria-label="‹">
        ‹
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button key={i} type="button" aria-pressed={i === page} onClick={() => onPage(i)}>
          {i + 1}
        </button>
      ))}
      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages - 1} aria-label="›">
        ›
      </button>
    </div>
  );
}
