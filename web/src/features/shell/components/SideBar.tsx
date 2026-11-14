"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Box, FlaskConical, Globe, LayoutDashboard, Map as MapIcon, Radar, Settings, FileText } from "lucide-react";
import { l } from "@/content/i18n";
import { ROUTES, type RouteIcon } from "@/content/routes";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./SideBar.module.scss";

const ICONS: Record<RouteIcon, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  home: LayoutDashboard,
  modules: Box,
  lab: FlaskConical,
  guide: BookOpen,
  radar: Radar,
  earth: Globe,
  refs: FileText,
  settings: Settings,
  map: MapIcon,
};

/** Ícono de una ruta (lo reutiliza el mapa del sitio). */
export function RouteGlyph({ icon, size = 19 }: { icon: RouteIcon; size?: number }) {
  const Icon = ICONS[icon];
  return <Icon size={size} strokeWidth={1.7} />;
}

/** Barra lateral: accesos fijos, siempre en el mismo orden, con estado activo. */
export function SideBar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLang();
  const isActive = (href: string): boolean => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <nav className={styles.side} aria-label={t(l("Navegación principal", "Main navigation"))}>
      <ul>
        {ROUTES.filter((r) => r.sidebar).map((r) => (
          <li key={r.id} className={r.id === "settings" ? styles.push : undefined}>
            <Link href={r.href} className={styles.item} aria-current={isActive(r.href) ? "page" : undefined} aria-label={t(r.label)}>
              <RouteGlyph icon={r.icon} />
              <span className={styles.tip}>
                {t(r.label)}
                {r.key && <kbd>{r.key}</kbd>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {children}
    </nav>
  );
}
