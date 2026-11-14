"use client";

import Link from "next/link";
import { l, type L } from "@/content/i18n";
import { MODULES } from "@/content/modules";
import { MODULE_ROUTE, ROUTES, type RouteDef } from "@/content/routes";
import { RouteGlyph } from "@/features/shell/components/SideBar";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./SiteMap.module.scss";

const GROUPS: { goal: RouteDef["goal"][]; title: L; text: L }[] = [
  { goal: ["core"], title: l("Centro de mando", "Command centre"), text: l("El sitio lunar y los cuatro ambientes habitables.", "The lunar site and the four habitable environments.") },
  { goal: ["O1"], title: l("O1 · Encontrar y comparar", "O1 · Find and compare"), text: l("Investigaciones relevantes para cada ambiente.", "Investigations relevant to each environment.") },
  { goal: ["O2"], title: l("O2 · Datos y modelos", "O2 · Data and models"), text: l("Datos limpios para modelos de inflamabilidad.", "Clean data for flammability models.") },
  { goal: ["O3", "O4"], title: l("O3 · O4 · Tecnología y Tierra", "O3 · O4 · Technology and Earth"), text: l("Controles de próxima generación y su uso en la Tierra.", "Next-generation controls and their use on Earth.") },
  { goal: ["info"], title: l("Información", "Information"), text: l("Fuentes, ajustes y este mapa.", "Sources, settings and this map.") },
];

const KEYS: { keys: string; label: L }[] = [
  ...ROUTES.filter((r) => r.key).map((r) => ({ keys: r.key!, label: r.label })),
  { keys: "/", label: l("Abrir el asistente FUEGO", "Open the FUEGO assistant") },
  { keys: "Esc", label: l("Cerrar paneles", "Close panels") },
];

/**
 * Mapa del sitio: toda la plataforma de un vistazo, agrupada por objetivo del
 * reto, con los atajos de teclado. Lee la misma lista de rutas que la barra
 * lateral y `sitemap.xml`.
 */
export function SiteMapView() {
  const { t } = useLang();
  return (
    <Workspace
      eyebrow={l("MAPA DEL SITIO", "SITE MAP")}
      title={l("Toda la plataforma de un vistazo", "The whole platform at a glance")}
      lede={l("Cualquier sección está a dos clics desde cualquier pantalla.", "Every section is two clicks away from any screen.")}
    >
      <div className={styles.layout}>
        <div className={styles.groups}>
          {GROUPS.map((g) => (
            <section key={g.title.en}>
              <h2>{t(g.title)}</h2>
              <p>{t(g.text)}</p>
              <ul>
                {ROUTES.filter((r) => g.goal.includes(r.goal)).map((r) => (
                  <li key={r.id}>
                    <Link href={r.href}>
                      <RouteGlyph icon={r.icon} size={17} />
                      <span>
                        <b>{t(r.label)}</b>
                        <em>{t(r.description)}</em>
                      </span>
                    </Link>
                    {r.id === "modules" && (
                      <div className={styles.subs}>
                        {MODULES.map((m) => (
                          <Link key={m.id} href={MODULE_ROUTE(m.id)}>
                            {t(m.label)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className={styles.keys}>
          <h2>{t(l("ATAJOS DE TECLADO", "KEYBOARD SHORTCUTS"))}</h2>
          <dl>
            {KEYS.map((k) => (
              <div key={k.keys}>
                <dt>
                  <kbd>{k.keys}</kbd>
                </dt>
                <dd>{t(k.label)}</dd>
              </div>
            ))}
          </dl>
          <h2>{t(l("VISTAS 3D", "3D VIEWS"))}</h2>
          <dl>
            <div>
              <dt>
                <kbd>{t(l("Arrastrar", "Drag"))}</kbd>
              </dt>
              <dd>{t(l("Girar la cámara", "Rotate the camera"))}</dd>
            </div>
            <div>
              <dt>
                <kbd>{t(l("Rueda", "Wheel"))}</kbd>
              </dt>
              <dd>{t(l("Acercar o alejar", "Zoom in or out"))}</dd>
            </div>
            <div>
              <dt>
                <kbd>{t(l("Clic derecho", "Right click"))}</kbd>
              </dt>
              <dd>{t(l("Desplazar la vista", "Pan the view"))}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </Workspace>
  );
}
