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
    "Convertimos décadas de experimentos de combustión en microgravedad de NASA en decisiones de seguridad contra incendios para naves, estaciones, rovers, trajes y bases en la Luna y Marte.",
    "We turn decades of NASA microgravity combustion experiments into fire-safety decisions for spacecraft, stations, rovers, suits and bases on the Moon and Mars.",
  ),
  challenge: l("Reto: Flame in Freefall · NASA Space Apps Challenge 2026", "Challenge: Flame in Freefall · NASA Space Apps Challenge 2026"),
  event: l("Evento local: NASA Space Apps Riobamba", "Local event: NASA Space Apps Riobamba"),
  members: [
    { name: "Juan Stalin Quezada Ruiz", role: l("Coordinación y revisión", "Coordination and review") },
    { name: "Jordy Ricardo Carrión Chávez", role: l("Dirección técnica · frontend", "Technical lead · frontend") },
    { name: "Zuleyka Naomi Ortiz Salazar", role: l("Diseño UX/UI", "UX/UI design") },
    { name: "Lisbeth Aracelly Escudero Inténtalo", role: l("Modelos predictivos", "Predictive models") },
    { name: "Johnatan Moisés Ley Guacho", role: l("Equipo", "Team") },
    { name: "Wagner Nolasco Ramírez Klínger", role: l("Equipo", "Team") },
  ] satisfies TeamMember[],
  disclaimer: l(
    "Proyecto independiente para NASA Space Apps. Usa datos y modelos abiertos de NASA; no implica aval de NASA.",
    "Independent project for NASA Space Apps. It uses open NASA data and models; no NASA endorsement is implied.",
  ),
};
