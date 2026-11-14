/**
 * Aplicaciones en la Tierra (objetivo O4, documento maestro §17). Se distingue
 * una transferencia documentada (con artículo de NASA Spinoff) de una
 * aplicación posible: no todo detector o traje terrestre "viene de NASA".
 */
import { l, type L } from "./i18n";

export interface EarthCase {
  id: string;
  title: L;
  problem: L;
  technology: L;
  impact: L;
  kind: "documented" | "possible";
  /** Investigación o lección espacial relacionada. */
  link: L;
  sources: string[];
  stat: { value: string; label: L };
}

export const EARTH_CASES: EarthCase[] = [
  {
    id: "tanks",
    title: l("Tanques de aire ligeros para bomberos", "Lightweight air tanks for firefighters"),
    problem: l("En los años 70 muchos bomberos no usaban su equipo de respiración: era pesado y limitaba el movimiento.", "In the 1970s many firefighters skipped their breathing apparatus: it was heavy and restricted movement."),
    technology: l("Recipiente a presión de aluminio envuelto en fibra y resina, nacido de los tanques de las naves.", "Aluminium pressure vessel wrapped in fibre and resin, born from spacecraft tanks."),
    impact: l("El mismo aire con 26 lb en lugar de 41 lb; los grandes fabricantes adoptaron la tecnología.", "The same air at 26 lb instead of 41 lb; major manufacturers adopted the technology."),
    kind: "documented",
    link: l("Recipientes a presión: la lección del Apolo 13", "Pressure vessels: the Apollo 13 lesson"),
    sources: ["SP-TANK"],
    stat: { value: "−37 %", label: l("de peso", "weight") },
  },
  {
    id: "pbi",
    title: l("Textiles PBI para trajes de bombero", "PBI textiles for firefighter gear"),
    problem: l("Tras el Apolo 1, NASA necesitó tejidos que no ardieran ni se fundieran en oxígeno enriquecido.", "After Apollo 1, NASA needed fabrics that would neither burn nor melt in enriched oxygen."),
    technology: l("Fibra de polibenzimidazol: casi no tiene punto de fusión y sigue flexible tras la llama.", "Polybenzimidazole fibre: almost no melting point and still flexible after flame exposure."),
    impact: l("Los bomberos de Nueva York la especificaron en 1994 para sus trajes.", "The New York City Fire Department specified it for its gear in 1994."),
    kind: "documented",
    link: l("Selección de materiales por límite de oxígeno", "Materials selection by oxygen limit"),
    sources: ["SP-PBI", "AP1"],
    stat: { value: "1967", label: l("desarrollo tras Apolo 1", "developed after Apollo 1") },
  },
  {
    id: "detector",
    title: l("Detector de fuego incipiente", "Incipient fire detector"),
    problem: l("En un recinto cerrado hay que avisar antes de que aparezcan la llama y el humo visible.", "In a closed space the warning must come before flame and visible smoke appear."),
    technology: l("Muestrea el aire y distingue las partículas de combustión, como los detectores del transbordador.", "It samples the air and discriminates combustion particles, like the Shuttle's detectors."),
    impact: l("Evaluado para operaciones mineras; el objetivo de detección espacial es la fase de pirólisis.", "Evaluated for mining operations; the space detection target is the pyrolysis stage."),
    kind: "documented",
    link: l("SAME: firma de humo por material", "SAME: smoke signature by material"),
    sources: ["SP-DET", "B12"],
    stat: { value: "200–400 nm", label: l("humo típico en SAME", "typical SAME smoke") },
  },
  {
    id: "firescape",
    title: l("Imagen infrarroja de llamas invisibles", "Infrared imaging of invisible flames"),
    problem: l("Las llamas de hidrógeno y de alcohol casi no se ven a simple vista.", "Hydrogen and alcohol flames are nearly invisible to the eye."),
    technology: l("Cámara infrarroja desarrollada para instalaciones de propulsión, que además ve a través del humo.", "Infrared camera developed for propulsion facilities, which also sees through smoke."),
    impact: l("Producto comercial para equipos de bomberos.", "Commercial product for fire crews."),
    kind: "documented",
    link: l("Llamas azules y llamas frías: que no se vea no significa que no arda", "Blue and cool flames: unseen does not mean not burning"),
    sources: ["SP-FIRESCAPE", "FLEX15"],
    stat: { value: "IR", label: l("ve llamas sin luz visible", "sees flames with no visible light") },
  },
  {
    id: "mist",
    title: l("Niebla de agua en lugar de agentes químicos", "Water mist instead of chemical agents"),
    problem: l("Los halones se prohibieron por su daño a la capa de ozono: hacía falta una alternativa limpia.", "Halons were banned for ozone damage: a clean alternative was needed."),
    technology: l("Gotas muy finas que enfrían la llama; su desarrollo espacial dejó válvulas de cierre sin fugas.", "Very fine droplets that cool the flame; its space development produced leak-free shut-off valves."),
    impact: l("Supresión sin efectos ambientales ni para la salud; válvulas usadas en sistemas industriales.", "Suppression with no environmental or health effects; valves used in industrial systems."),
    kind: "possible",
    link: l("Mist (STS-107) y el extintor de niebla fina de la ISS", "Mist (STS-107) and the ISS fine water mist extinguisher"),
    sources: ["SP-MIST", "B18", "B16"],
    stat: { value: "≈20 µm", label: l("gotas de la niebla", "mist droplets") },
  },
];

export interface HistoryCase {
  id: string;
  year: string;
  name: L;
  what: L;
  physics: L;
  lesson: L;
  rule: L;
  sources: string[];
}

/** Lecciones históricas (documento maestro §16). */
export const HISTORY: HistoryCase[] = [
  {
    id: "apollo1",
    year: "1967",
    name: l("Apolo 1", "Apollo 1"),
    what: l("Incendio en tierra con la cabina llena de O₂ puro a 16,7 psi. La presión rompió el casco en menos de 20 s.", "Ground fire with the cabin full of pure O₂ at 16.7 psi. Pressure ruptured the hull in under 20 s."),
    physics: l("Sin diluyente que absorba calor, la llama es más caliente y la propagación se dispara.", "With no diluent to absorb heat, the flame is hotter and spread runs away."),
    lesson: l("Un material aceptado en una atmósfera no está probado en otra.", "A material accepted in one atmosphere is not proven in another."),
    rule: l("La atmósfera es la primera variable de toda evaluación.", "Atmosphere is the first variable of every assessment."),
    sources: ["AP1", "B22"],
  },
  {
    id: "apollo13",
    year: "1970",
    name: l("Apolo 13", "Apollo 13"),
    what: l("Un cortocircuito encendió el aislamiento de Teflon dentro de un tanque de O₂ a alta presión; el tanque falló.", "A short circuit ignited Teflon insulation inside a high-pressure O₂ tank; the tank failed."),
    physics: l("Primer accidente con fuego sin flujo de flotabilidad: un material poco inflamable en aire ardió en O₂ comprimido.", "First fire accident without buoyant flow: a material hard to burn in air burned in compressed O₂."),
    lesson: l("Fuego sin gravedad no es fuego débil.", "Fire without gravity is not weak fire."),
    rule: l("Microgravedad nunca se asocia con “riesgo bajo”.", "Microgravity is never labelled “low risk”."),
    sources: ["AP13", "B22"],
  },
  {
    id: "mir",
    year: "1997",
    name: l("Estación Mir", "Mir station"),
    what: l("Un generador químico de oxígeno ardió como un soplete durante unos 14 minutos y bloqueó una ruta de escape.", "A chemical oxygen generator burned like a blowtorch for about 14 minutes and blocked an escape route."),
    physics: l("Llevaba su propio oxidante: cortar la ventilación o diluir el aire no lo apagaba.", "It carried its own oxidiser: cutting ventilation or diluting the air did not put it out."),
    lesson: l("El mayor peligro fue el humo y el CO en un volumen cerrado.", "The main hazard was smoke and CO in a closed volume."),
    rule: l("Hay que vigilar gases, no solo humo.", "Gases must be monitored, not just smoke."),
    sources: ["MIR97", "B22"],
  },
];
