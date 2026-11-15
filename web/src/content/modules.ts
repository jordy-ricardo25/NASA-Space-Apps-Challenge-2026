/**
 * Los módulos de la plataforma = los ambientes habitables del reto (naves,
 * estaciones, rovers presurizados, trajes y bases). Hay dos bases
 * independientes: la lunar (0,165 g, atmósfera de exploración) y la marciana
 * (0,38 g, atmósfera sin definir en las fuentes). Textos de la ficha de
 * diseño adaptados al reto (pautas §6.3) y valores del catálogo de ambientes
 * del documento maestro (§12.8).
 */
import { l, type L } from "./i18n";
import type { MaterialId } from "@/features/fire/engine/materials";

export type ModuleId = "nave" | "estacion" | "rover" | "traje" | "base" | "marte";

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
  /** Texto del botón que lleva al interior (por defecto, "Entrar a la cabina"). */
  enterLabel?: L;
  /** Nombre corto del interior en la barra de estado (por defecto, "Cabina"). */
  insideLabel?: L;
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
    id: "traje",
    code: "SPX-005",
    label: l("TRAJE EVA", "EVA SUIT"),
    name: l("Traje EVA", "EVA suit"),
    kind: l("Traje de exploración · O₂ puro a baja presión", "Exploration suit · pure O₂ at low pressure"),
    description: l(
      "Traje para caminar sobre la superficie: 100 % de O₂ a solo 29,6 kPa (4,3 psi). Es la cota superior de oxígeno del reto y queda fuera del rango ensayado en PSI.",
      "Suit for walking on the surface: 100% O₂ at only 29.6 kPa (4.3 psi). It is the challenge's upper oxygen bound and lies outside the range tested in PSI.",
    ),
    specialties: [l("Oxígeno puro", "Pure oxygen"), l("Baja presión", "Low pressure"), l("Materiales del traje", "Suit materials")],
    components: [
      { name: l("Casco y visor", "Helmet and visor"), info: l("Volumen mínimo de gas: cualquier producto de combustión llega de inmediato a quien lo respira.", "Minimal gas volume: any combustion product reaches the wearer at once.") },
      { name: l("Capas textiles", "Fabric layers"), info: l("Tejidos resistentes al fuego: en O₂ enriquecido, un material aceptado en aire puede superar su límite.", "Fire-resistant fabrics: in enriched O₂ a material accepted in air can exceed its limit.") },
      { name: l("Soporte vital portátil", "Portable life support"), info: l("Circula O₂ puro y retira CO₂; la electrónica es la fuente de ignición más probable.", "Circulates pure O₂ and removes CO₂; electronics are the most likely ignition source.") },
      { name: l("Guantes y sellos", "Gloves and seals"), info: l("Polímeros y elastómeros expuestos al oxígeno del traje.", "Polymers and elastomers exposed to the suit's oxygen.") },
    ],
    guide: l(
      "Dentro del traje respiras oxígeno puro. La presión es baja, pero la llama responde a la fracción de O₂: aquí es el 100 %.",
      "Inside the suit you breathe pure oxygen. Pressure is low, but a flame responds to the O₂ fraction: here it is 100%.",
    ),
    cabinGuide: l(
      "Estás fuera del rango ensayado (10–40 % de O₂): lo que ves es una extrapolación. La lección del Apolo 1 fue no confiar en un material probado en otra atmósfera.",
      "You are outside the tested range (10–40% O₂): what you see is an extrapolation. The Apollo 1 lesson was never to trust a material proven in another atmosphere.",
    ),
    variants: [
      { id: "luna", name: l("EVA lunar", "Lunar EVA"), g: 0.165, o2: 100, P: 29.6, note: l("100 % O₂ a 4,3 psi sobre la superficie lunar.", "100% O₂ at 4.3 psi on the lunar surface."), sources: ["CHALLENGE"] },
      { id: "orbita", name: l("EVA orbital", "Orbital EVA"), g: 1e-6, o2: 100, P: 29.6, note: l("100 % O₂ a 4,3 psi en microgravedad.", "100% O₂ at 4.3 psi in microgravity."), sources: ["CHALLENGE"] },
    ],
    vent: 5,
    volume: 0.4,
    exchange: 0,
    defaultMaterial: "nomex",
    investigations: ["cfig", "sofie", "bass2"],
    evidence: l("Fuera del rango ensayado en PSI: 100 % de O₂ (cota superior)", "Outside the range tested in PSI: 100% O₂ (upper bound)"),
    accent: "#b68cff",
    enterLabel: l("ENTRAR AL TRAJE", "STEP INSIDE THE SUIT"),
    insideLabel: l("DENTRO DEL CASCO", "INSIDE THE HELMET"),
  },
  {
    id: "base",
    code: "SPX-004",
    label: l("BASE · LUNA", "BASE · MOON"),
    name: l("Base lunar", "Lunar base"),
    kind: l("Hábitat de superficie · Luna · 0,165 g", "Surface habitat · Moon · 0.165 g"),
    description: l(
      "Hábitat de larga duración en la Luna con atmósfera de exploración: 34 % de O₂ a 56,5 kPa, la misma que replicará FM2.",
      "Long-duration habitat on the Moon with an exploration atmosphere: 34% O₂ at 56.5 kPa, the same FM2 will replicate.",
    ),
    specialties: [l("Habitabilidad", "Habitability"), l("Atmósfera de exploración", "Exploration atmosphere"), l("Gravedad parcial 0,165 g", "Partial gravity 0.165 g")],
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
    ],
    vent: 10,
    volume: 56,
    exchange: 0,
    defaultMaterial: "pmma",
    investigations: ["fm2", "luci", "bre"],
    evidence: l("Sin evidencia directa en PSI: gravedad parcial", "No direct PSI evidence: partial gravity"),
    accent: "#9fd6c2",
  },
  {
    id: "marte",
    code: "SPX-006",
    label: l("BASE · MARTE", "BASE · MARS"),
    name: l("Base marciana", "Mars base"),
    kind: l("Hábitat de superficie · Marte · 0,38 g", "Surface habitat · Mars · 0.38 g"),
    description: l(
      "Hábitat de larga duración en Marte. La gravedad es 0,38 g y ninguna fuente fija todavía su atmósfera de cabina: aquí se explora como hipótesis.",
      "Long-duration habitat on Mars. Gravity is 0.38 g and no source yet fixes its cabin atmosphere: here it is explored as a hypothesis.",
    ),
    specialties: [l("Habitabilidad", "Habitability"), l("Gravedad parcial 0,38 g", "Partial gravity 0.38 g"), l("Atmósfera por definir", "Atmosphere to be defined")],
    components: [
      { name: l("Módulos habitacionales", "Habitation modules"), info: l("Tejidos, espumas y plásticos: con 34 % de O₂ la fracción sería 63 % mayor que la terrestre.", "Fabrics, foams and plastics: at 34% O₂ the fraction would be 63% above Earth's.") },
      { name: l("Esclusas", "Airlocks"), info: l("La baja presión reduce el riesgo de descompresión y permite más caminatas.", "Low pressure cuts decompression risk and allows more surface walks.") },
      { name: l("Centro de operaciones", "Operations centre"), info: l("Vigila humo y gases: tras un fuego, el CO es el peligro principal.", "Watches smoke and gases: after a fire, CO is the main hazard.") },
      { name: l("Soporte vital", "Life support"), info: l("La Tierra está a meses de viaje: prevenir y limpiar pesa más que evacuar.", "Earth is months away: prevention and clean-up matter more than evacuation.") },
    ],
    guide: l(
      "En Marte hay más del doble de gravedad que en la Luna y menos de la mitad que en la Tierra. Nadie ha medido todavía cómo arde un material aquí.",
      "Mars has more than twice the Moon's gravity and less than half of Earth's. Nobody has yet measured how a material burns here.",
    ),
    cabinGuide: l(
      "A 0,38 g la flotabilidad trae más oxígeno que en la Luna. El resultado es una predicción sin validación: por eso lleva la marca de sin evidencia directa.",
      "At 0.38 g buoyancy brings more oxygen than on the Moon. The result is a prediction with no validation: that is why it is marked as lacking direct evidence.",
    ),
    variants: [
      { id: "sea", name: l("Hipótesis SEA", "SEA hypothesis"), g: 0.38, o2: 34, P: 56.5, undefinedAtmosphere: true, note: l("Atmósfera de exploración (34 % O₂ a 56,5 kPa) usada como hipótesis.", "Exploration atmosphere (34% O₂ at 56.5 kPa) used as a hypothesis."), sources: ["CHALLENGE", "B7"] },
      { id: "reto", name: l("Hipótesis 30 %", "30% hypothesis"), g: 0.38, o2: 30, P: 70.3, undefinedAtmosphere: true, note: l("Atmósfera lunar del reto usada como hipótesis.", "The challenge's lunar atmosphere used as a hypothesis."), sources: ["CHALLENGE"] },
      { id: "aire", name: l("Aire", "Air"), g: 0.38, o2: 21, P: 101.3, undefinedAtmosphere: true, note: l("Aire a presión terrestre, como referencia.", "Air at Earth pressure, as a reference."), sources: ["CHALLENGE"] },
    ],
    vent: 10,
    volume: 56,
    exchange: 0,
    defaultMaterial: "pmma",
    investigations: ["fm2", "luci", "bre"],
    evidence: l("Sin evidencia: gravedad marciana y atmósfera sin definir", "No evidence: Martian gravity and undefined atmosphere"),
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
