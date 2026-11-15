/**
 * El reto Flame in Freefall (NASA Space Apps Challenge 2026): de dónde surge,
 * qué pide NASA y qué queda fuera. Resumen propio del texto oficial del reto y
 * de su video (docs/requerimientos-flame-in-freefall.md §1 y §2); todo apunta
 * a la fuente CHALLENGE del catálogo.
 */
import { l, type L } from "./i18n";

export interface ChallengeFact {
  title: L;
  text: L;
}

export interface ChallengeGoal {
  id: "O1" | "O2" | "O3" | "O4";
  /** Lo que pide NASA. */
  ask: L;
  /** Cómo lo resuelve la plataforma. */
  answer: L;
  /** Clave de la ruta donde se resuelve (src/content/routes.ts). */
  route: string;
}

export const CHALLENGE = {
  name: "Flame in Freefall",
  event: "NASA Space Apps Challenge 2026",
  sources: ["CHALLENGE", "PSI"],
  problem: l(
    "NASA lleva décadas estudiando cómo arde el fuego en baja gravedad: torres de caída, vuelos parabólicos, cohetes sonda y la Estación Espacial. Ese conocimiento está en su repositorio PSI, pero es difícil de encontrar, más difícil de comparar y aún más difícil de interpretar.",
    "NASA has spent decades studying how fire burns in low gravity: drop towers, parabolic flights, sounding rockets and the Space Station. That knowledge sits in its PSI repository, but it is hard to find, harder to compare and harder still to interpret.",
  ),
  ask: l(
    "El reto pide un panel web interactivo, apoyado en IA, que resuma, ordene e interprete esas investigaciones para la seguridad contra incendios de los ambientes habitables.",
    "The challenge asks for an interactive, AI-supported web dashboard that summarises, sorts and interprets those investigations for the fire safety of habitable environments.",
  ),
  origin: [
    {
      title: l("El fuego ya ha puesto vidas en riesgo", "Fire has already put lives at risk"),
      text: l(
        "Apollo 1, Apollo 13 y el incendio de la estación Mir marcaron la historia. La estrategia de NASA se organiza desde entonces en tres pilares: prevención, detección y supresión.",
        "Apollo 1, Apollo 13 and the fire aboard the Mir station marked history. NASA's strategy has since been organised around three pillars: prevention, detection and suppression.",
      ),
    },
    {
      title: l("Sin gravedad, el fuego se comporta distinto", "Without gravity, fire behaves differently"),
      text: l(
        "Sin flotabilidad, la llama de una vela deja de ser una gota que parpadea y se vuelve una esfera azul que vive de la difusión. La intuición terrestre falla.",
        "Without buoyancy, a candle flame stops being a flickering teardrop and becomes a blue sphere that lives on diffusion. Earth intuition fails.",
      ),
    },
    {
      title: l("Volvemos a la Luna para quedarnos", "We are going back to the Moon to stay"),
      text: l(
        "Los hábitats y rovers lunares usarán más oxígeno (30 % o más) y menos presión (10,2 psi o menos) que la Tierra. Con más oxígeno, los materiales arden con más facilidad.",
        "Lunar habitats and rovers will use more oxygen (30% or more) and less pressure (10.2 psi or less) than Earth. With more oxygen, materials burn more easily.",
      ),
    },
    {
      title: l("Falta el dato clave: la gravedad parcial", "The key data is missing: partial gravity"),
      text: l(
        "En PSI no hay datos directos de combustión en gravedad lunar o marciana. Experimentos futuros como LUCI y FM2 los aportarán; hoy hay que razonar entre 0 g y 1 g.",
        "PSI holds no direct combustion data in lunar or Martian gravity. Future experiments such as LUCI and FM2 will provide them; today we have to reason between 0 g and 1 g.",
      ),
    },
  ] satisfies ChallengeFact[],
  goals: [
    {
      id: "O1",
      ask: l("Encontrar las investigaciones relevantes para cada ambiente habitable y mostrar sus similitudes y diferencias.", "Find the investigations relevant to each habitable environment and show their similarities and differences."),
      answer: l("Biblioteca, ranking por ambiente, comparador y matriz de cobertura.", "Library, ranking by environment, comparator and coverage matrix."),
      route: "guide",
    },
    {
      id: "O2",
      ask: l("Extraer datos útiles para modelos predictivos de inflamabilidad de materiales.", "Extract useful data for predictive models of material flammability."),
      answer: l("Mapa de inflamabilidad con su margen, su intervalo y su nivel de evidencia.", "Flammability map with its margin, its interval and its evidence level."),
      route: "lab",
    },
    {
      id: "O3",
      ask: l("Destacar la investigación que informa los controles y equipos de próxima generación: protocolos, supresión y selección de materiales.", "Highlight the research that informs next-generation controls and equipment: protocols, suppression and material screening."),
      answer: l("Radar de la evidencia a la tecnología, con las brechas y la misión que las cerrará.", "Radar from evidence to technology, with the gaps and the mission that will close them."),
      route: "radar",
    },
    {
      id: "O4",
      ask: l("Mostrar cómo este conocimiento se aplica en la Tierra.", "Show how this knowledge applies on Earth."),
      answer: l("Casos de transferencia a bomberos e industria, documentados y posibles.", "Transfer cases for firefighters and industry, documented and possible."),
      route: "earth",
    },
  ] satisfies ChallengeGoal[],
  environments: l("Naves, estaciones espaciales, rovers presurizados y bases en la Luna y Marte.", "Spacecraft, space stations, pressurised rovers and bases on the Moon and Mars."),
  outOfScope: l(
    "Fuera del reto: detectar incendios reales en tiempo real, vigilar incendios forestales y estudiar cohetes o propelentes.",
    "Outside the challenge: detecting real fires in real time, monitoring wildfires and studying rockets or propellants.",
  ),
};
