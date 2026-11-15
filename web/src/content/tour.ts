/**
 * Recorrido inicial de Flamey: una vuelta corta por las partes del sitio para
 * quien entra por primera vez. Cada paso resalta en la navegación la sección
 * de la que habla (claves de src/content/routes.ts).
 */
import { l, type L } from "./i18n";

export interface TourStep {
  text: L;
  /** Secciones que se resaltan en la barra de navegación durante el paso. */
  routes: string[];
}

export const TOUR: TourStep[] = [
  {
    text: l(
      "¡Hola! Soy Flamey, una llama en caída libre. Te enseño el sitio en un minuto. Este es el centro de mando: un sitio lunar en 3D que puedes girar, con seis ambientes habitables.",
      "Hi! I'm Flamey, a flame in freefall. Let me show you around in a minute. This is the command centre: a 3D lunar site you can rotate, with six habitable environments.",
    ),
    routes: ["home"],
  },
  {
    text: l("En Nuestro Reto está lo que pidió NASA: convertir décadas de experimentos de fuego sin gravedad en respuestas claras.", "Our challenge shows what NASA asked for: turning decades of fire experiments without gravity into clear answers."),
    routes: ["challenge"],
  },
  {
    text: l(
      "En Módulos entras a cada ambiente y a su cabina. Allí cambias el oxígeno, la presión y el material, enciendes una muestra y ves cómo responde la llama.",
      "In Modules you enter each environment and its cabin. There you change oxygen, pressure and material, ignite a sample and watch the flame respond.",
    ),
    routes: ["modules"],
  },
  {
    text: l("El Laboratorio te dice si un material arde en esa atmósfera, con su margen y su nivel de evidencia.", "The Laboratory tells you whether a material burns in that atmosphere, with its margin and its evidence level."),
    routes: ["lab"],
  },
  {
    text: l(
      "La Guía reúne y compara las investigaciones de NASA. El Radar muestra qué tecnología falta, y Tierra, cómo todo esto ya protege a los bomberos.",
      "The Guide gathers and compares NASA's investigations. The Radar shows which technology is missing, and Earth how all this already protects firefighters.",
    ),
    routes: ["guide", "radar", "earth"],
  },
  {
    text: l("Y yo me quedo aquí. Tócame cuando quieras y pregúntame, escribiendo o con el micrófono. ¡A explorar!", "And I'll stay right here. Tap me whenever you like and ask me, by typing or with the microphone. Let's explore!"),
    routes: [],
  },
];
