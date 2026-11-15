/**
 * El reto Flame in Freefall (NASA Space Apps Challenge 2026). Es el texto de
 * la sección "Objectives" de la página oficial del reto, tal cual en inglés y
 * traducido al español por el equipo. No se añade nada más: la fuente es
 * CHALLENGE en el catálogo.
 */
import { l, type L } from "./i18n";

export const CHALLENGE = {
  name: "Flame in Freefall",
  event: "NASA Space Apps Challenge 2026",
  sources: ["CHALLENGE"],
  heading: l("Objetivos", "Objectives"),
  context: l(
    "Los resultados de los experimentos de combustión en baja gravedad, realizados por ejemplo en la Estación Espacial Internacional (ISS), se están poniendo a disposición del público en la base de datos Physical Science Informatics (PSI) de NASA, pero la cantidad de datos puede ser abrumadora. Puede ser difícil de encontrar, más difícil de comparar y aún más difícil de interpretar.",
    "Results from low-gravity combustion experiments, conducted for example on the International Space Station (ISS), are being made publicly available through NASA's Physical Science Informatics (PSI) database, but the amount of data can be overwhelming. It can be hard to find, harder to compare, and harder yet to interpret.",
  ),
  task: l(
    "Tu reto es construir un panel web impulsado por SI que resuma, ordene e interprete las investigaciones de ciencia de la combustión para aportar conocimientos fundamentales y críticos para la seguridad contra incendios. Puedes considerar permitir a los usuarios:",
    "Your challenge is to build an SI-powered, web-based dashboard that summarizes, ranks, and interprets combustion science investigations to deliver critical foundational insights for fire safety. You may consider enabling users to:",
  ),
  goals: [
    l(
      "Identificar las investigaciones más relevantes para las necesidades de seguridad contra incendios de los ambientes habitables con tripulación, incluidos naves, estaciones espaciales, bases en las superficies lunar y marciana, y rovers presurizados.*",
      "Identify investigations most relevant to the fire safety needs of habitable crew environments, including spacecraft, space stations, bases on the lunar and Martian surfaces, and pressurized rovers.*",
    ),
    l(
      "Extraer datos que apoyen el modelado predictivo de la inflamabilidad y de los escenarios de incendio en la exploración espacial.",
      "Extract data that supports predictive modeling of flammability and fire scenarios in space exploration.",
    ),
    l(
      "Destacar la investigación que orienta el desarrollo de los controles y equipos de seguridad contra incendios de próxima generación.",
      "Highlight research that informs the development of next-generation fire safety controls and equipment.",
    ),
  ] satisfies L[],
  closing: l(
    "En este reto ayudarás a convertir datos complejos en respuestas claras y a hacer que el próximo gran salto sea más seguro.",
    "In this challenge, you'll help turn complex data into clear answers and make the next giant leap a safer one.",
  ),
  earth: l(
    "Tu panel también podría abordar las posibles aplicaciones de los datos de PSI a la seguridad contra incendios en la Tierra. Los extintores de niebla de agua fina desarrollados para la ISS tienen aplicaciones prácticas aquí en la Tierra, y la tecnología de NASA ha llevado de forma similar a mejoras en la detección de humo terrestre y en el equipo de los bomberos, incluidas la ropa de protección y los tanques de aire.",
    "Your dashboard could also address potential applications of the PSI data to fire safety on Earth. Fine-water-mist extinguishers developed for use on the ISS have practical applications here on Earth, and NASA technology has similarly led to improvements in terrestrial smoke detection and firefighter gear, including protective clothing and air tanks.",
  ),
  footnote: l(
    "*La seguridad contra incendios relacionada con cohetes y propelentes queda, en general, fuera del alcance de la investigación disponible en la base de datos PSI. Las altas velocidades dentro de los motores de cohete hacen que la combustión sea prácticamente independiente de la gravedad, aunque el lanzamiento de un cohete, por supuesto, depende mucho de ella.",
    "*Fire safety involving rockets and propellants is generally beyond the scope of the research available in the PSI database. The high velocities within rocket engines render the combustion effectively independent of gravity — although a rocket's launch is of course strongly dependent on gravity.",
  ),
};
