"use client";

import { useEffect, useRef, useState } from "react";
import { l } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./ClampText.module.scss";

interface ClampTextProps {
  /** Texto a mostrar. */
  children: string;
  /** Líneas visibles antes de recortar (3 por defecto). */
  lines?: number;
  /** Clase extra para el contenedor (márgenes o posición en la tarjeta). */
  className?: string;
}

/**
 * Párrafo que se recorta a unas pocas líneas y ofrece "Ver más" para leerlo
 * completo. El botón solo aparece cuando el texto de verdad no cabe, así que
 * nunca queda texto cortado sin forma de leerlo.
 */
export function ClampText({ children, lines = 3, className }: ClampTextProps) {
  const { t } = useLang();
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Mide al montar y cada vez que cambia el ancho de la tarjeta o el texto.
  useEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const ro = new ResizeObserver(() => setOverflows(el.scrollHeight - el.clientHeight > 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, children]);

  return (
    <div className={className ? `${styles.wrap} ${className}` : styles.wrap}>
      <p ref={ref} className={styles.text} data-open={open} style={{ "--lines": lines } as React.CSSProperties}>
        {children}
      </p>
      {(overflows || open) && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={open}
          onClick={(e) => {
            // La tarjeta que lo contiene puede ser clicable: este clic no la abre.
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          {open ? t(l("Ver menos", "Show less")) : t(l("Ver más", "Show more"))}
        </button>
      )}
    </div>
  );
}
