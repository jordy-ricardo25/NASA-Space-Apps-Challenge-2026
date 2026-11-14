"use client";

import Link from "next/link";
import { l } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./Notice.module.scss";

const TEXT = {
  notFound: {
    code: "404",
    title: l("Esta ruta no existe en el centro de mando", "This route does not exist in the command centre"),
    text: l("Puede que el enlace esté incompleto. Vuelve al inicio o abre el mapa del sitio.", "The link may be incomplete. Go back home or open the site map."),
  },
  error: {
    code: "!",
    title: l("No pudimos mostrar esta pantalla", "We could not show this screen"),
    text: l("El resto de la plataforma sigue disponible. Inténtalo de nuevo o vuelve al inicio.", "The rest of the platform is still available. Try again or go back home."),
  },
};

/** Aviso a pantalla completa para rutas inexistentes y errores, con salida clara. */
export function Notice({ kind, onRetry }: { kind: keyof typeof TEXT; onRetry?: () => void }) {
  const { t } = useLang();
  const x = TEXT[kind];
  return (
    <div className={styles.notice} role="alert">
      <span className={styles.code}>{x.code}</span>
      <h1>{t(x.title)}</h1>
      <p>{t(x.text)}</p>
      <div className={styles.actions}>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            {t(l("Reintentar", "Try again"))}
          </button>
        )}
        <Link href="/">{t(l("Ir al inicio", "Go home"))}</Link>
        <Link href="/mapa">{t(l("Mapa del sitio", "Site map"))}</Link>
      </div>
    </div>
  );
}
