"use client";

import { Move3d } from "lucide-react";
import { l } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./DragHint.module.scss";

/** Recordatorio discreto de cómo mover la cámara en las vistas 3D. */
export function DragHint() {
  const { t } = useLang();
  return (
    <p className={styles.hint}>
      <Move3d size={14} aria-hidden="true" />
      {t(l("Arrastra para girar · rueda para acercar · clic derecho para desplazar", "Drag to rotate · wheel to zoom · right-click to pan"))}
    </p>
  );
}
