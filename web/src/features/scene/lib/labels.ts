import { l, type L } from "@/content/i18n";
import type { FireState, LogKey } from "@/features/fire/engine/sim";

/** Estado de la llama para el indicador de la cabina. */
export const FIRE_LABEL: Record<FireState | "heating", { text: L; tone: "idle" | "warn" | "hot" | "cool" | "ok" }> = {
  none: { text: l("SIN LLAMA", "NO FLAME"), tone: "idle" },
  heating: { text: l("SOBRECALENTAMIENTO", "OVERHEATING"), tone: "warn" },
  burning: { text: l("EN LLAMA", "FLAMING"), tone: "hot" },
  cool: { text: l("LLAMA FRÍA", "COOL FLAME"), tone: "cool" },
  out: { text: l("EXTINGUIDA", "EXTINGUISHED"), tone: "ok" },
  burnout: { text: l("COMBUSTIBLE CONSUMIDO", "FUEL CONSUMED"), tone: "ok" },
};

/** Registro de eventos de la cabina. */
export const LOG_TEXT: Record<LogKey, L> = {
  ignition: l("Ignición de la muestra", "Sample ignition"),
  reignition: l("Reignición", "Re-ignition"),
  noSustain: l("El ambiente no sostiene la llama", "The environment does not sustain the flame"),
  extinguished: l("Llama extinguida", "Flame extinguished"),
  radiative: l("Extinción radiativa de la llama visible", "Radiative extinction of the visible flame"),
  cool: l("Llama fría: combustión a baja temperatura", "Cool flame: low-temperature combustion"),
  coolOut: l("Llama fría extinguida", "Cool flame extinguished"),
  burnout: l("Combustible agotado", "Fuel exhausted"),
  dropletGone: l("Gota consumida", "Droplet consumed"),
  alarm: l("Alarma de humo en el detector", "Smoke alarm at the detector"),
  auto: l("Respuesta automática: ventilación y energía cortadas", "Automatic response: ventilation and power cut"),
  pfe: l("Extintor de CO₂ descargado", "CO₂ extinguisher discharged"),
  mist: l("Niebla de agua fina descargada", "Fine water mist discharged"),
  ventOff: l("Ventilación cortada", "Ventilation cut"),
  ventOn: l("Ventilación restablecida", "Ventilation restored"),
  powerCut: l("Energía cortada", "Power cut"),
  powerOn: l("Energía restablecida", "Power restored"),
  venting: l("Despresurización iniciada", "Depressurisation started"),
  ventStop: l("Despresurización detenida", "Depressurisation stopped"),
};
