/**
 * Preguntas preparadas: respuestas aprobadas por el equipo. Si la pregunta
 * coincide (sin importar mayúsculas, tildes ni signos) se responde al instante
 * y sin IA, así que funcionan aunque falle cualquier servicio externo.
 */
import { l, type L, type Lang } from "@/content/i18n";

export interface PreparedQuestion {
  q: L;
  a: L;
  /** Si se indica, la respuesta es la ficha de conocimiento con esa clave. */
  card?: string;
  sources?: string[];
  /** Aparece como sugerencia cuando el chat está vacío. */
  featured?: boolean;
}

export const FAQ: PreparedQuestion[] = [
  {
    q: l("¿Qué es esta plataforma?", "What is this platform?"),
    a: l(
      "Es un centro de mando de seguridad contra incendios para ambientes habitables: naves, estaciones, rovers presurizados y bases lunares. Reúne las investigaciones de combustión en microgravedad de NASA, calcula el margen de inflamabilidad de cada material en cada atmósfera y te muestra la llama respondiendo en tiempo real a la gravedad, el oxígeno, la presión y la ventilación.",
      "It is a fire-safety command centre for habitable environments: spacecraft, stations, pressurised rovers and lunar bases. It gathers NASA's microgravity combustion investigations, computes each material's flammability margin in each atmosphere and shows the flame responding in real time to gravity, oxygen, pressure and ventilation.",
    ),
    sources: ["CHALLENGE", "PSI"],
    featured: true,
  },
  { q: l("¿Por qué la llama es esférica en microgravedad?", "Why is the flame spherical in microgravity?"), a: l("", ""), card: "sphere", featured: true },
  { q: l("¿Por qué la Luna podría ser peor que la ISS?", "Why could the Moon be worse than the ISS?"), a: l("", ""), card: "moon-worse", featured: true },
  { q: l("¿Qué pasa si corto la ventilación?", "What happens if I cut ventilation?"), a: l("", ""), card: "ventilation", featured: true },
  {
    q: l("¿Cómo evitas inventar respuestas?", "How do you avoid making things up?"),
    a: l(
      "Solo respondo con lo que está en nuestras fuentes de NASA y te muestro de dónde sale cada dato. Los números los calculo con el modelo físico de la plataforma, no los redacto. Y si algo no está en las fuentes, te lo digo en lugar de inventarlo.",
      "I only answer with what is in our NASA sources and show where each figure comes from. Numbers are computed by the platform's physical model, not written freely. And if something is not in the sources, I say so instead of inventing it.",
    ),
  },
  {
    q: l("Hola", "Hello"),
    a: l(
      "¡Hola! Soy FUEGO, una llama en caída libre. Pregúntame sobre seguridad contra incendios en el espacio.",
      "Hi! I'm FUEGO, a flame in freefall. Ask me about fire safety in space.",
    ),
  },
  {
    q: l("¿Quién eres?", "Who are you?"),
    a: l(
      "Soy FUEGO, el asistente de este centro de mando. En la Tierra soy una gota amarilla que sube; en caída libre me vuelvo una esfera azul, igual que una llama real sin flotabilidad.",
      "I'm FUEGO, this command centre's assistant. On Earth I'm a yellow teardrop that rises; in freefall I become a blue sphere, just like a real flame without buoyancy.",
    ),
  },
];

/** Minúsculas, sin tildes ni signos, espacios simples. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Busca una pregunta preparada idéntica (en cualquiera de los dos idiomas). */
export function findPrepared(question: string): PreparedQuestion | undefined {
  const n = normalize(question);
  return FAQ.find((f) => normalize(f.q.es) === n || normalize(f.q.en) === n);
}

export const featuredQuestions = (lang: Lang): string[] => FAQ.filter((f) => f.featured).map((f) => f.q[lang]);

export const NO_ANSWER = l(
  "No encontré eso en nuestras fuentes de NASA. ¿Quieres preguntarme otra cosa sobre fuego en el espacio?",
  "I couldn't find that in our NASA sources. Would you like to ask me something else about fire in space?",
);
