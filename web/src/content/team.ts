/**
 * Panel del Equipo (pautas §5.4). Solo datos que cada integrante aprobó:
 * nombre, cargo o título, rol en el proyecto y perfil profesional. Sin
 * teléfonos, correos ni direcciones.
 *
 * Los cargos y roles van siempre en inglés, también con la interfaz en
 * español: es una decisión del equipo para este panel.
 */
import { l } from "./i18n";

export interface TeamMember {
  name: string;
  /** Cargo o título principal, resaltado en el panel. Siempre en inglés. */
  title: string;
  /** Rol dentro del proyecto. Siempre en inglés. */
  role: string;
  /** Perfil profesional (LinkedIn) aprobado por la persona. */
  link?: string;
}

export const TEAM = {
  /** Nombre del equipo: es el título del panel "Quiénes somos". */
  name: "Andora Labs",
  /** Reto en el que participa; va en una línea debajo del nombre del equipo. */
  project: "Flame in Freefall",
  pitch: l(
    "Convertimos décadas de experimentos de combustión en microgravedad de NASA en decisiones de seguridad contra incendios para naves, estaciones, rovers, trajes y bases en la Luna y Marte.",
    "We turn decades of NASA microgravity combustion experiments into fire-safety decisions for spacecraft, stations, rovers, suits and bases on the Moon and Mars.",
  ),
  challenge: l("Reto: Flame in Freefall · NASA Space Apps Challenge 2026", "Challenge: Flame in Freefall · NASA Space Apps Challenge 2026"),
  event: l("Evento local: NASA Space Apps Riobamba", "Local event: NASA Space Apps Riobamba"),
  members: [
    {
      name: "Juan Stalin Quezada Ruiz",
      title: "CEO, Andorasoft",
      role: "Captain · Project Manager · AI Engineer",
      link: "https://www.linkedin.com/in/juansquezada/",
    },
    {
      name: "Jordy Ricardo Carrión Chávez",
      title: "CTO, Andorasoft",
      role: "Full-Stack Developer · Software Architect",
      link: "https://www.linkedin.com/in/jordy-ricardo25/",
    },
    {
      name: "Zuleyka Naomi Ortiz Salazar",
      title: "Creative Director",
      role: "Designer",
      link: "https://www.linkedin.com/in/zuleyka-ortiz-25147237a/",
    },
    {
      name: "Lisbeth Aracelly Escudero Coba",
      title: "Statistics Engineer",
      role: "Data Analyst",
      link: "https://www.linkedin.com/in/aracelly-escudero-0761023aa/",
    },
    {
      name: "Johnatan Moises Ley Guacho",
      title: "Information Technology Engineer",
      role: "DevOps Manager",
      link: "https://www.linkedin.com/in/johnatan-guacho-7376563b0/",
    },
    {
      name: "Wagner Nolasco Ramírez Klínger",
      title: "Physics Expert",
      role: "Combustion Science Lead",
      link: "https://www.linkedin.com/in/nolasco-ram%C3%ADrez-560891280/",
    },
  ] satisfies TeamMember[],
  disclaimer: l(
    "Proyecto independiente para NASA Space Apps. Usa datos y modelos abiertos de NASA; no implica aval de NASA.",
    "Independent project for NASA Space Apps. It uses open NASA data and models; no NASA endorsement is implied.",
  ),
};
