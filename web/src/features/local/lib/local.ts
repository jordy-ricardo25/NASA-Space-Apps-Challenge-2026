/**
 * Constantes de la sección "Flamey local": los ambientes que se pueden elegir
 * y las preguntas de arranque. Sin datos científicos: las cifras llegan del
 * servicio de PSI.
 */
import { l, type L } from "@/content/i18n";
import type { ModuleId } from "@/content/modules";

/** Valor del selector de modelo para responder sin modelo de lenguaje. */
export const FAST = "fast";

/** Módulos con ambiente propio en el backend (la nave comparte el de la estación). */
export const LOCAL_ENVS: ModuleId[] = ["estacion", "base", "rover", "traje", "marte"];

/** Hallazgos por página en el ranking: la lista de cada página se desliza dentro de su panel. */
export const PAGE_SIZE = 5;

/** Un hallazgo elegido, con el texto corto que se muestra en el chat. */
export interface LocalFinding {
  key: string;
  label: string;
}

/**
 * Preguntas de arranque, antes de la primera respuesta. Después, el servidor
 * propone las que aún no se han hecho sobre el hallazgo (findingTopics.ts).
 */
export const QUICK_QUESTIONS: L[] = [
  l("¿Por qué ese riesgo?", "Why that risk?"),
  l("¿Y en el traje EVA?", "And in the EVA suit?"),
  l("¿Qué tan rápido avanza?", "How fast does it spread?"),
];
