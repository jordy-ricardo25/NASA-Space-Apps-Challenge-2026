/**
 * Panel del Equipo (pautas §5.4). Solo datos que cada integrante apruebe:
 * sin teléfonos, correos ni direcciones.
 * TODO(equipo): confirmar el rol y el enlace profesional de cada integrante.
 */
import { l, type L } from "./i18n";

export interface TeamMember {
  name: string;
  role: L;
  /** Enlace profesional (GitHub o LinkedIn) aprobado por la persona. */
  link?: string;
}

export const TEAM = {
  project: "Flame in Freefall",
  pitch: l(
    "Convertimos décadas de experimentos de combustión en microgravedad de NASA en decisiones de seguridad contra incendios para naves, estaciones, rovers y bases lunares.",
    "We turn decades of NASA microgravity combustion experiments into fire-safety decisions for spacecraft, stations, rovers and lunar bases.",
  ),
  challenge: l("Reto: Flame in Freefall · NASA Space Apps Challenge 2026", "Challenge: Flame in Freefall · NASA Space Apps Challenge 2026"),
  event: l("Evento local: NASA Space Apps Riobamba", "Local event: NASA Space Apps Riobamba"),
  members: [
    { name: "Juan", role: l("Coordinación y revisión", "Coordination and review") },
    { name: "Ricardo", role: l("Dirección técnica · frontend", "Technical lead · frontend") },
    { name: "Zuleica", role: l("Diseño UX/UI", "UX/UI design") },
    { name: "Aracelly", role: l("Modelos predictivos", "Predictive models") },
    { name: "Johnatan", role: l("Equipo", "Team") },
    { name: "Nolasco", role: l("Equipo", "Team") },
  ] satisfies TeamMember[],
  disclaimer: l(
    "Proyecto independiente para NASA Space Apps. Usa datos y modelos abiertos de NASA; no implica aval de NASA.",
    "Independent project for NASA Space Apps. It uses open NASA data and models; no NASA endorsement is implied.",
  ),
};
