/**
 * Los cuatro módulos de la plataforma = los cuatro ambientes habitables del
 * reto (naves, estaciones, rovers presurizados y bases). Textos de la ficha de
 * diseño adaptados al reto (pautas §6.3) y valores del catálogo de ambientes
 * del documento maestro (§12.8).
 */
import { l, type L } from "./i18n";
import type { MaterialId } from "@/features/fire/engine/materials";

export type ModuleId = "nave" | "estacion" | "rover" | "base";

export interface AtmosphereVariant {
  id: string;
  name: L;
  g: number;
  o2: number;
  P: number;
  /** Atmósfera aún sin definir en las fuentes (cabina marciana). */
  undefinedAtmosphere?: boolean;
  note: L;
  sources: string[];
}

export interface ModuleDef {
  id: ModuleId;
  code: string;
  /** Nombre corto de la etiqueta del mapa. */
  label: L;
  name: L;
  kind: L;
  description: L;
  specialties: L[];
  components: { name: L; info: L }[];
  /** Mensaje del guía en la escena. */
  guide: L;
  /** Mensaje del guía dentro de la cabina. */
  cabinGuide: L;
  variants: AtmosphereVariant[];
  /** Ventilación nominal (cm/s), volumen libre (m³) e intercambio con el resto del vehículo (m³/s). */
  vent: number;
  volume: number;
  exchange: number;
  defaultMaterial: MaterialId;
  investigations: string[];
  evidence: L;
  /** Acento visual del ambiente. */
  accent: string;
}

export const MODULES: ModuleDef[] = [
  {
    id: "nave",
    code: "SPX-001",
    label: l("NAVE", "SPACECRAFT"),
    name: l("Nave tripulada", "Crewed spacecraft"),
    kind: l("Cabina en tránsito · microgravedad", "Cabin in transit · microgravity"),
    description: l(
      "Cabina presurizada de una nave en tránsito. Sin flotabilidad, la ventilación decide cómo crece un fuego y a dónde va el humo.",
      "Pressurised cabin of a spacecraft in transit. With no buoyancy, ventilation decides how a fire grows and where smoke goes.",
    ),
    specialties: [l("Prevención", "Prevention"), l("Detección", "Detection"), l("Supresión", "Suppression")],
    components: [
      { name: l("Ventilación de cabina", "Cabin ventilation"), info: l("Mueve el aire a 10–20 cm/s: trae oxígeno a la llama y lleva el humo a los detectores.", "Moves air at 10–20 cm/s: it feeds oxygen to a flame and carries smoke to the detectors.") },
      { name: l("Detector de humo", "Smoke detector"), info: l("Detector de dispersión de luz en el retorno de aire; alarma a 1 % de obscuración por pie.", "Light-scattering detector in the air return; alarms at 1% obscuration per foot.") },
      { name: l("Extintor", "Extinguisher"), info: l("CO₂ o niebla de agua fina. Descargarlo mueve aire: puede llevar oxígeno a la llama.", "CO₂ or fine water mist. Discharging it moves air: it can push oxygen onto the flame.") },
      { name: l("Materiales de cabina", "Cabin materials"), info: l("Tejidos, plásticos y aislantes elegidos por su límite de oxígeno.", "Fabrics, plastics and insulation selected by their oxygen limit.") },
    ],
    guide: l(
      "En la nave el humo no sube: lo mueve la ventilación. Por eso los detectores están en el flujo de aire.",
      "On a spacecraft smoke does not rise: ventilation moves it. That is why detectors sit in the airflow.",
    ),
    cabinGuide: l(
      "Enciende la muestra y luego corta la ventilación: verás cómo la llama se queda sin oxígeno fresco.",
      "Ignite the sample, then cut ventilation: watch the flame run out of fresh oxygen.",
    ),
    variants: [
      { id: "std", name: l("Cabina estándar", "Standard cabin"), g: 1e-6, o2: 21, P: 101.3, note: l("Atmósfera tipo ISS.", "ISS-like atmosphere."), sources: ["B9"] },
      { id: "gateway", name: l("Gateway", "Gateway"), g: 1e-6, o2: 26.5, P: 73.5, note: l("Escenario de Liao et al. 2021.", "Scenario from Liao et al. 2021."), sources: ["B4"] },
    ],
    vent: 15,
    volume: 16.7,
    exchange: 0,
    defaultMaterial: "sibal",
    investigations: ["saffire", "same", "flex"],
    evidence: l("Evidencia directa en PSI (microgravedad)", "Direct PSI evidence (microgravity)"),
    accent: "#35d8f2",
  },
  {
    id: "estacion",
    code: "SPX-002",
    label: l("ESTACIÓN", "STATION"),
    name: l("Estación espacial", "Space station"),
    kind: l("Laboratorio orbital · microgravedad", "Orbital laboratory · microgravity"),
    description: l(
      "Laboratorio orbital donde NASA estudia cómo arde el fuego sin gravedad. Aquí se midieron los datos de PSI.",
      "Orbital laboratory where NASA studies how fire burns without gravity. The PSI data were measured here.",
    ),
    specialties: [l("Investigación de combustión", "Combustion research"), l("Soporte vital", "Life support"), l("Experimentos en el CIR", "CIR experiments")],
    components: [
      { name: l("Combustion Integrated Rack", "Combustion Integrated Rack"), info: l("Cámara de ≈100 L con ventanas ópticas: FLEX, ACME y SoFIE.", "≈100 L chamber with optical windows: FLEX, ACME and SoFIE.") },
      { name: l("Glovebox (MSG)", "Glovebox (MSG)"), info: l("Guantera sellada de 255 L: BASS, SPICE, SLICE y SAME.", "255 L sealed glovebox: BASS, SPICE, SLICE and SAME.") },
      { name: l("Muestras sólidas", "Solid samples"), info: l("Acrílico, papel y tejidos quemados con flujo y O₂ controlados.", "Acrylic, paper and fabrics burned under controlled flow and O₂.") },
      { name: l("Gotas de combustible", "Fuel droplets"), info: l("Gotas de 1–5 mm de heptano y metanol: ley d² y llamas frías.", "1–5 mm heptane and methanol droplets: d² law and cool flames.") },
    ],
    guide: l(
      "Aquí, sin flotabilidad, la llama de una gota se vuelve una esfera azul que vive de la difusión.",
      "Here, without buoyancy, a droplet flame becomes a blue sphere that lives on diffusion.",
    ),
    cabinGuide: l(
      "Prueba la gota de n-heptano con el aire quieto: la llama visible se apaga y queda una llama fría.",
      "Try the n-heptane droplet in still air: the visible flame goes out and a cool flame remains.",
    ),
    variants: [{ id: "iss", name: l("ISS", "ISS"), g: 1e-6, o2: 21, P: 101.3, note: l("Atmósfera de diseño de la estación.", "Station design atmosphere."), sources: ["B9"] }],
    vent: 15,
    volume: 106,
    exchange: 0.066,
    defaultMaterial: "pmma",
    investigations: ["bass2", "flex", "acme-sflame", "same"],
    evidence: l("Evidencia directa en PSI (microgravedad)", "Direct PSI evidence (microgravity)"),
    accent: "#6cb6ff",
  },
  {
    id: "rover",
    code: "SPX-003",
    label: l("ROVER", "ROVER"),
    name: l("Rover presurizado", "Pressurised rover"),
    kind: l("Vehículo lunar · 0,165 g", "Lunar vehicle · 0.165 g"),
    description: l(
      "Vehículo presurizado para recorrer la Luna, con más oxígeno y menos presión que la Tierra, en un volumen muy pequeño.",
      "Pressurised vehicle for driving on the Moon, with more oxygen and less pressure than Earth, in a very small volume.",
    ),
    specialties: [l("Atmósfera enriquecida", "Enriched atmosphere"), l("Volumen reducido", "Small volume"), l("Gravedad lunar", "Lunar gravity")],
    components: [
      { name: l("Cabina presurizada", "Pressurised cabin"), info: l("Pocos metros cúbicos: el CO y el CO₂ de un fuego pequeño suben muy rápido.", "A few cubic metres: CO and CO₂ from a small fire climb very fast.") },
      { name: l("Esclusa y puertos de traje", "Airlock and suit ports"), info: l("Menos presión de cabina permite salir a la superficie con menos espera.", "Lower cabin pressure allows surface excursions with less waiting.") },
      { name: l("Sistemas eléctricos", "Electrical systems"), info: l("La electrónica es la fuente más probable de fuego y humo en el espacio.", "Electronics are the most likely source of fire and smoke in space.") },
      { name: l("Materiales interiores", "Interior materials"), info: l("Con 30 % de O₂, materiales aceptados en aire pueden superar su límite.", "At 30% O₂, materials accepted in air can exceed their limit.") },
    ],
    guide: l(
      "Respiras casi el mismo oxígeno que en la Tierra, pero aquí los materiales arden con más facilidad.",
      "You breathe almost the same oxygen as on Earth, but here materials burn more easily.",
    ),
    cabinGuide: l(
      "Corta la ventilación: en gravedad lunar la flotabilidad sigue alimentando la llama.",
      "Cut ventilation: in lunar gravity buoyancy keeps feeding the flame.",
    ),
    variants: [
      { id: "reto", name: l("Atmósfera del reto", "Challenge atmosphere"), g: 0.165, o2: 30, P: 70.3, note: l("≥30 % O₂ y ≤10,2 psi.", "≥30% O₂ and ≤10.2 psi."), sources: ["CHALLENGE"] },
      { id: "sea", name: l("Exploración (SEA)", "Exploration (SEA)"), g: 0.165, o2: 34, P: 56.5, note: l("34 % O₂ a 8,2 psia.", "34% O₂ at 8.2 psia."), sources: ["B7"] },
    ],
    vent: 10,
    volume: 12,
    exchange: 0,
    defaultMaterial: "sibal",
    investigations: ["cfig", "luci", "efield"],
    evidence: l("Sin evidencia directa en PSI: gravedad parcial", "No direct PSI evidence: partial gravity"),
    accent: "#ffc53d",
  },
  {
    id: "base",
    code: "SPX-004",
    label: l("BASE", "BASE"),
    name: l("Base lunar", "Lunar base"),
    kind: l("Hábitat de superficie · 0,165 g", "Surface habitat · 0.165 g"),
    description: l(
      "Hábitat de larga duración en la Luna con atmósfera de exploración: 34 % de O₂ a 56,5 kPa, la misma que replicará FM2.",
      "Long-duration habitat on the Moon with an exploration atmosphere: 34% O₂ at 56.5 kPa, the same FM2 will replicate.",
    ),
    specialties: [l("Habitabilidad", "Habitability"), l("Atmósfera de exploración", "Exploration atmosphere"), l("Gravedad parcial", "Partial gravity")],
    components: [
      { name: l("Módulos habitacionales", "Habitation modules"), info: l("Tejidos, espumas y plásticos conviven con una fracción de O₂ 63 % mayor que la terrestre.", "Fabrics, foams and plastics live with an O₂ fraction 63% above Earth's.") },
      { name: l("Esclusas", "Airlocks"), info: l("La baja presión reduce el riesgo de descompresión y permite más caminatas.", "Low pressure cuts decompression risk and allows more surface walks.") },
      { name: l("Centro de operaciones", "Operations centre"), info: l("Vigila humo y gases: tras un fuego, el CO es el peligro principal.", "Watches smoke and gases: after a fire, CO is the main hazard.") },
      { name: l("Soporte vital", "Life support"), info: l("Una corriente de 5 cm/s dispersa en minutos la capa de humo del techo.", "A 5 cm/s current disperses the ceiling smoke layer within minutes.") },
    ],
    guide: l(
      "En la Luna la gravedad parcial podría ser el peor caso para un incendio. Te muestro por qué.",
      "On the Moon partial gravity could be the worst case for a fire. Let me show you why.",
    ),
    cabinGuide: l(
      "Hay flotabilidad suficiente para traer oxígeno, pero no tanta como para enfriar la llama: la zona Ricitos de Oro.",
      "There is enough buoyancy to bring oxygen, but not enough to cool the flame: the Goldilocks zone.",
    ),
    variants: [
      { id: "sea", name: l("Luna · SEA", "Moon · SEA"), g: 0.165, o2: 34, P: 56.5, note: l("Atmósfera de exploración (FM2).", "Exploration atmosphere (FM2)."), sources: ["B7"] },
      { id: "reto", name: l("Luna · reto", "Moon · challenge"), g: 0.165, o2: 30, P: 70.3, note: l("Ejemplo del reto.", "Challenge example."), sources: ["CHALLENGE"] },
      { id: "marte", name: l("Marte", "Mars"), g: 0.38, o2: 34, P: 56.5, undefinedAtmosphere: true, note: l("0,38 g; atmósfera de cabina sin definir.", "0.38 g; cabin atmosphere undefined."), sources: ["CHALLENGE"] },
    ],
    vent: 10,
    volume: 56,
    exchange: 0,
    defaultMaterial: "pmma",
    investigations: ["fm2", "luci", "bre"],
    evidence: l("Sin evidencia directa en PSI: gravedad parcial", "No direct PSI evidence: partial gravity"),
    accent: "#ff8738",
  },
];

const INDEX = new Map(MODULES.map((m) => [m.id, m]));

export const isModuleId = (id: string | undefined | null): id is ModuleId => !!id && INDEX.has(id as ModuleId);

/** Devuelve el módulo o undefined si la clave no existe. */
export const getModule = (id: string | undefined | null): ModuleDef | undefined => (isModuleId(id) ? INDEX.get(id) : undefined);

/** Variante de atmósfera de un módulo (la primera si la clave no existe). */
export const getVariant = (m: ModuleDef, id: string | undefined | null): AtmosphereVariant =>
  m.variants.find((v) => v.id === id) ?? m.variants[0]!;
