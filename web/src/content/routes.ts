/**
 * Lista única de rutas. La usan la barra lateral, el mapa del sitio y
 * `sitemap.ts`, así nunca se desincronizan (pautas §5.7).
 */
import { l, type L } from "./i18n";

export type RouteIcon = "home" | "modules" | "lab" | "guide" | "radar" | "earth" | "refs" | "settings" | "map";

export interface RouteDef {
  id: string;
  href: string;
  label: L;
  description: L;
  icon: RouteIcon;
  /** Objetivo del reto al que responde. */
  goal: "core" | "O1" | "O2" | "O3" | "O4" | "info";
  /** Aparece en la barra lateral. */
  sidebar: boolean;
  /** Atajo de teclado. */
  key?: string;
}

export const ROUTES: RouteDef[] = [
  { id: "home", href: "/", label: l("Inicio", "Home"), description: l("Vista general del sitio lunar con los cuatro ambientes habitables.", "Overview of the lunar site with the four habitable environments."), icon: "home", goal: "core", sidebar: true, key: "H" },
  { id: "modules", href: "/modulos", label: l("Módulos", "Modules"), description: l("Acceso directo a cada ambiente y a las herramientas de análisis.", "Direct access to each environment and to the analysis tools."), icon: "modules", goal: "core", sidebar: true, key: "M" },
  { id: "lab", href: "/laboratorio", label: l("Laboratorio", "Laboratory"), description: l("Mapa de inflamabilidad, gotas, humo y contaminantes de cabina.", "Flammability map, droplets, smoke and cabin contaminants."), icon: "lab", goal: "O2", sidebar: true, key: "L" },
  { id: "guide", href: "/guia", label: l("Guía", "Guide"), description: l("Biblioteca de investigaciones PSI, ranking, comparador y lecciones.", "PSI investigation library, ranking, comparator and lessons."), icon: "guide", goal: "O1", sidebar: true, key: "G" },
  { id: "radar", href: "/radar", label: l("Radar tecnológico", "Technology radar"), description: l("De la evidencia a la tecnología: brechas y misiones que las cerrarán.", "From evidence to technology: gaps and the missions that will close them."), icon: "radar", goal: "O3", sidebar: true, key: "R" },
  { id: "earth", href: "/tierra", label: l("Tierra", "Earth"), description: l("Tecnologías espaciales que hoy protegen a bomberos e industria.", "Space technologies that protect firefighters and industry today."), icon: "earth", goal: "O4", sidebar: true, key: "T" },
  { id: "refs", href: "/referencias", label: l("Datos y referencias", "Data and references"), description: l("Fuentes de NASA, DOIs, licencias de modelos y uso de IA.", "NASA sources, DOIs, model licences and AI use."), icon: "refs", goal: "info", sidebar: false },
  { id: "settings", href: "/ajustes", label: l("Ajustes", "Settings"), description: l("Idioma, unidades, calidad 3D y accesibilidad.", "Language, units, 3D quality and accessibility."), icon: "settings", goal: "info", sidebar: true },
  { id: "map", href: "/mapa", label: l("Mapa del sitio", "Site map"), description: l("Toda la plataforma de un vistazo, con los atajos de teclado.", "The whole platform at a glance, with keyboard shortcuts."), icon: "map", goal: "info", sidebar: false },
];

export const MODULE_ROUTE = (id: string): string => `/modulos/${id}`;
