/**
 * Base de conocimiento del asistente FUEGO: fichas cortas redactadas a partir
 * del documento maestro, cada una con sus fuentes. El asistente responde con
 * estas fichas (y las cita); si ninguna encaja, dice que no lo encontró.
 */
import { l, type L } from "./i18n";
import type { EvidenceLevel } from "@/shared/types/api";

export interface KnowledgeCard {
  id: string;
  /** Palabras clave (sin tildes, en minúsculas) en español e inglés. */
  keys: string[];
  text: L;
  sources: string[];
  evidence?: EvidenceLevel;
}

export const KNOWLEDGE: KnowledgeCard[] = [
  {
    id: "sphere",
    keys: ["esfera", "esferica", "forma", "azul", "sphere", "spherical", "shape", "blue", "vela", "candle", "gota"],
    text: l(
      "En la Tierra el gas caliente de la llama es unas 7–8 veces menos denso que el aire: sube, arrastra aire fresco y estira la llama en forma de gota amarilla. En caída libre esa flotabilidad desaparece: el oxígeno solo llega por difusión y la llama de un combustible pequeño en aire quieto se vuelve una esfera azul y tenue. Si hay ventilación o una superficie grande, la llama se inclina o se alarga.",
      "On Earth the hot flame gas is about 7–8 times less dense than air: it rises, drags in fresh air and stretches the flame into a yellow teardrop. In freefall that buoyancy vanishes: oxygen arrives only by diffusion and the flame of a small fuel in still air becomes a dim blue sphere. With ventilation or a large surface the flame tilts or elongates.",
    ),
    sources: ["GUIDE15", "CHALLENGE"],
    evidence: "A",
  },
  {
    id: "moon-worse",
    keys: ["luna", "lunar", "peor", "ricitos", "goldilocks", "parcial", "moon", "worse", "partial", "gravedad"],
    text: l(
      "En gravedad lunar hay flotabilidad suficiente para traer oxígeno fresco a la llama, pero no tanta como para enfriarla: la “zona Ricitos de Oro”. Por eso algunos materiales tienen límites de inflamabilidad más amplios en la Luna que en la Tierra. En varillas de PMMA el mínimo de la frontera de O₂ (13,2–15,2 %) apareció cerca de la gravedad lunar. No hay datos de PSI en gravedad parcial: la evidencia viene de vuelos parabólicos, centrífugas y LUCI, y FM2 lo medirá en la superficie.",
      "In lunar gravity there is enough buoyancy to bring fresh oxygen to the flame, but not enough to cool it: the “Goldilocks zone”. That is why some materials have wider flammability limits on the Moon than on Earth. For PMMA rods the minimum of the O₂ boundary (13.2–15.2%) appeared near lunar gravity. PSI has no partial-gravity data: evidence comes from parabolic flights, centrifuges and LUCI, and FM2 will measure it on the surface.",
    ),
    sources: ["B7", "OLSON24", "B8", "B5"],
    evidence: "D",
  },
  {
    id: "o2-pressure",
    keys: ["respirar", "presion", "parcial", "fraccion", "ppo2", "oxigeno", "breathe", "pressure", "fraction", "oxygen", "sea", "exploracion", "exploration"],
    text: l(
      "La tripulación respira según la presión parcial de O₂ (ppO₂ = fracción × presión), pero la llama responde sobre todo a la fracción, porque decide cuánto gas inerte hay que calentar por cada molécula de O₂. La atmósfera de exploración (34 % O₂ a 56,5 kPa) da una ppO₂ de 19,2 kPa, menor que la terrestre (21,2 kPa), con una fracción de O₂ 63 % mayor: se respira casi igual, pero los materiales arden con mucha más facilidad.",
      "Crew breathe according to O₂ partial pressure (ppO₂ = fraction × pressure), but a flame responds mostly to the fraction, because it sets how much inert gas must be heated per O₂ molecule. The exploration atmosphere (34% O₂ at 56.5 kPa) gives a ppO₂ of 19.2 kPa, below Earth's (21.2 kPa), with an O₂ fraction 63% higher: breathing is nearly the same, but materials burn far more easily.",
    ),
    sources: ["B7", "CHALLENGE", "B19"],
    evidence: "A",
  },
  {
    id: "why-low-pressure",
    keys: ["eva", "caminata", "descompresion", "bends", "spacewalk", "decompression", "traje", "suit", "por que", "why"],
    text: l(
      "Los trajes trabajan a baja presión (≈4,3 psi con 100 % O₂). Si la cabina también tiene menos presión, el astronauta necesita menos prerrespiración y corre menos riesgo de descompresión, así que se pueden hacer caminatas más frecuentes. Para seguir respirando igual se sube la fracción de O₂; el precio es una mayor inflamabilidad.",
      "Suits run at low pressure (≈4.3 psi with 100% O₂). If the cabin pressure is also lower, the astronaut needs less pre-breathing and faces less decompression risk, so surface walks can be more frequent. To keep breathing the same the O₂ fraction is raised; the price is higher flammability.",
    ),
    sources: ["CHALLENGE", "B7"],
  },
  {
    id: "u-curve",
    keys: ["curva", "u", "mloc", "loc", "limite", "soplado", "blowoff", "flujo", "ventilacion", "limit", "flow", "curve", "inflamabilidad", "flammability"],
    text: l(
      "El límite de oxígeno de un material frente al flujo de aire tiene forma de U. Con aire casi quieto la llama pierde calor por radiación y se apaga; con flujo alto se apaga por soplado; entre ambos hay un mínimo (MLOC), la condición más peligrosa. En microgravedad ese mínimo cae cerca de 5–15 cm/s, justo el rango de la ventilación de una nave (10–20 cm/s).",
      "A material's oxygen limit versus airflow is U-shaped. In nearly still air the flame loses heat by radiation and goes out; at high flow it blows off; in between sits a minimum (MLOC), the most dangerous condition. In microgravity that minimum falls near 5–15 cm/s, right in the range of spacecraft ventilation (10–20 cm/s).",
    ),
    sources: ["B4", "B8", "ISSFIRE"],
    evidence: "A",
  },
  {
    id: "ventilation",
    keys: ["ventilacion", "cortar", "apagar", "solo", "procedimiento", "ventilation", "cut", "self", "extinguish", "procedure", "alarma", "alarm"],
    text: l(
      "El procedimiento de la ISS tras una alarma de incendio es cortar la ventilación y la energía. Sin flujo, una llama pequeña puede quedarse sin oxígeno fresco y apagarse, pero no es una garantía: una vela ardió más de 45 minutos en Mir y NASA advierte que “el fuego se apaga solo sin ventilación” es una idea errónea. En gravedad parcial la flotabilidad sigue alimentando la llama aunque se apague el ventilador.",
      "The ISS procedure after a fire alarm is to cut ventilation and power. Without flow a small flame can run out of fresh oxygen and go out, but it is not guaranteed: a candle burned for over 45 minutes on Mir, and NASA warns that “a fire self-extinguishes without ventilation” is a misconception. In partial gravity buoyancy keeps feeding the flame even with the fan off.",
    ),
    sources: ["B17", "GUIDE15", "B4"],
    evidence: "A",
  },
  {
    id: "saffire",
    keys: ["saffire", "cygnus", "escala", "scale", "nave", "tela", "sibal", "kw", "potencia"],
    text: l(
      "Saffire quemó muestras grandes dentro de la nave de carga Cygnus sin tripulación. En Saffire-1, una tela de algodón y fibra de vidrio (SIBAL) de 94 × 40,6 cm a 20 cm/s propagó a 1,8 mm/s a favor del flujo y 1,3 mm/s en contra. En Saffire IV–VI los fuegos fueron de 1,5–3,2 kW; la subida de temperatura y presión importó menos que la de CO₂ y CO.",
      "Saffire burned large samples inside the uncrewed Cygnus cargo vehicle. In Saffire-1 a 94 × 40.6 cm cotton-fiberglass fabric (SIBAL) at 20 cm/s spread at 1.8 mm/s concurrent and 1.3 mm/s opposed. In Saffire IV–VI the fires were 1.5–3.2 kW; the rise in temperature and pressure mattered less than the rise in CO₂ and CO.",
    ),
    sources: ["B10", "B2"],
    evidence: "A",
  },
  {
    id: "co",
    keys: ["co", "monoxido", "toxico", "humo", "smac", "gases", "monoxide", "toxic", "despues", "after", "limpieza", "cleanup"],
    text: l(
      "Tras un fuego en una cabina cerrada el mayor peligro es tóxico. En Saffire VI-3 un solo fuego de PMMA de unos 13 minutos subió el CO medio de la nave en 308 ppm: por encima del límite de exposición de 24 h (100 ppm) y cerca del de 1 h (425 ppm). Recircular el aire sin filtrar no elimina nada, y un filtro de partículas no retira CO.",
      "After a fire in a closed cabin the main hazard is toxic. In Saffire VI-3 a single PMMA fire of about 13 minutes raised the vehicle's mean CO by 308 ppm: above the 24 h exposure limit (100 ppm) and close to the 1 h limit (425 ppm). Recirculating air without filtering removes nothing, and a particle filter does not remove CO.",
    ),
    sources: ["B2", "SMAC"],
    evidence: "A",
  },
  {
    id: "cool-flames",
    keys: ["fria", "frias", "cool", "heptano", "heptane", "flex", "invisible", "reignicion", "reignition"],
    text: l(
      "FLEX descubrió en 2012 que, tras apagarse por radiación la llama visible de gotas grandes de heptano, seguía una “llama fría” casi invisible a unos 500–800 K que continuaba consumiendo combustible durante minutos. Consecuencia: que no haya luz no prueba que el fuego esté apagado; hay riesgo de reignición.",
      "In 2012 FLEX discovered that, after the visible flame of large heptane droplets radiatively extinguished, a nearly invisible “cool flame” at about 500–800 K kept consuming fuel for minutes. Consequence: no light does not prove a fire is out; there is a re-ignition risk.",
    ),
    sources: ["FLEX15", "B3", "ISSFIRE"],
    evidence: "A",
  },
  {
    id: "d2",
    keys: ["d2", "gota", "gotas", "droplet", "constante", "k", "metanol", "methanol", "ley"],
    text: l(
      "Una gota que arde cumple la ley d²: el cuadrado de su diámetro baja en línea recta con el tiempo, D²(t) = D₀² − K·t. En el ensayo 30CAL03 de FLEX (PSI-69), una gota de metanol de 1,92 mm en aire a 1 atm ardió 6,34 s hasta extinguirse con 0,81 mm: K media ≈ 0,48 mm²/s.",
      "A burning droplet follows the d² law: the square of its diameter falls linearly with time, D²(t) = D₀² − K·t. In FLEX test 30CAL03 (PSI-69) a 1.92 mm methanol droplet in air at 1 atm burned for 6.34 s until it extinguished at 0.81 mm: mean K ≈ 0.48 mm²/s.",
    ),
    sources: ["PSI69", "FLEX15"],
    evidence: "A",
  },
  {
    id: "suppression",
    keys: ["supresion", "extintor", "co2", "helio", "diluyente", "suppression", "extinguisher", "helium", "diluent", "apagar", "agente", "agent"],
    text: l(
      "CO₂, N₂ y He apagan por desplazamiento de O₂ y enfriamiento. En microgravedad la concentración necesaria aumentó con la velocidad del flujo hasta ~10 cm/s, donde ya se parece a la de 1 g. Relaciones críticas agente/O₂ publicadas: CO₂ 0,62–1,12, He 2,1 y N₂ 2,92: dependen de la geometría, así que una concentración de quemador no es una dosis para una cabina. Además, descargar un extintor induce flujo y puede llevar oxígeno a la llama.",
      "CO₂, N₂ and He extinguish by displacing O₂ and cooling. In microgravity the required concentration rose with flow speed up to ~10 cm/s, where it approaches the 1 g value. Published critical agent/O₂ ratios: CO₂ 0.62–1.12, He 2.1 and N₂ 2.92: they depend on geometry, so a burner concentration is not a cabin dose. Also, discharging an extinguisher induces flow and can push oxygen onto the flame.",
    ),
    sources: ["B17"],
    evidence: "A",
  },
  {
    id: "water-mist",
    keys: ["niebla", "agua", "mist", "water", "fwm", "nebulizada", "fina", "fine"],
    text: l(
      "La niebla de agua fina enfría la llama. En el experimento Mist (STS-107) las llamas pobres se frenaron más con más agua y con gotas más pequeñas. Una gota de 20 µm sigue al aire casi de inmediato, y en microgravedad no cae: queda suspendida. El extintor portátil de niebla fina de la ISS se certificó para reemplazar a los de CO₂.",
      "Fine water mist cools the flame. In the Mist experiment (STS-107) lean flames slowed more with more water and with smaller droplets. A 20 µm droplet follows the air almost instantly, and in microgravity it does not fall: it stays suspended. The ISS fine water mist portable extinguisher was certified to replace the CO₂ units.",
    ),
    sources: ["B18", "B16", "FWM"],
    evidence: "A",
  },
  {
    id: "detection",
    keys: ["detector", "deteccion", "humo", "same", "particulas", "teflon", "kapton", "detection", "smoke", "particles", "obscuracion"],
    text: l(
      "En microgravedad el humo no sube: solo llega al detector si la ventilación lo lleva. SAME midió que el humo de materiales de nave suele tener 200–400 nm. El detector de la ISS (dispersión de luz, alarma a 1 % de obscuración por pie) responde mejor a partículas mayores de 1 µm: vio bien el humo grande de celulosa y silicona, pero falló con frecuencia con el humo fino de Teflon y Kapton. Ningún tipo de detector sirve para todos los materiales.",
      "In microgravity smoke does not rise: it reaches the detector only if ventilation carries it. SAME measured that smoke from spacecraft materials is typically 200–400 nm. The ISS detector (light scattering, alarm at 1% obscuration per foot) responds best to particles above 1 µm: it saw large cellulose and silicone smoke well but frequently missed fine Teflon and Kapton smoke. No single detector type works for every material.",
    ),
    sources: ["B11", "B13", "B12"],
    evidence: "A",
  },
  {
    id: "test1",
    keys: ["test", "norma", "6001", "std", "estandar", "standard", "materiales", "materials", "moc", "conservador", "conservative"],
    text: l(
      "NASA-STD-6001B (Test 1) prueba la propagación hacia arriba en 1 g, sin flujo de aire: el MOC es el máximo O₂ en el que cinco probetas no arden más de 15 cm. La evidencia de BASS sugiere que ese ensayo podría no ser conservador en microgravedad, donde algunos materiales arden con menos O₂. Un MOC de 15 cm no se puede comparar con un límite de propagación de otro protocolo.",
      "NASA-STD-6001B (Test 1) tests upward spread at 1 g with no forced flow: the MOC is the highest O₂ at which five specimens burn no more than 15 cm. BASS evidence suggests the test may not be conservative in microgravity, where some materials burn with less O₂. A 15 cm MOC cannot be compared with a spread limit from another protocol.",
    ),
    sources: ["B9", "ISSFIRE"],
  },
  {
    id: "psi",
    keys: ["psi", "datos", "repositorio", "investigaciones", "data", "repository", "investigations", "24", "tb"],
    text: l(
      "PSI (Physical Sciences Informatics) es el repositorio abierto de NASA con los datos de sus experimentos de ciencias físicas en microgravedad. El área de combustión reúne 24 investigaciones y unos 12 TB: cada investigación tiene su resumen, una carpeta por muestra ensayada y sus publicaciones con DOI. Esta plataforma las ordena por ambiente habitable y cita cada dato.",
      "PSI (Physical Sciences Informatics) is NASA's open repository of data from its microgravity physical-science experiments. The combustion area holds 24 investigations and about 12 TB: each investigation has a summary, one folder per tested sample and its publications with DOI. This platform ranks them by habitable environment and cites every figure.",
    ),
    sources: ["PSI", "CHALLENGE"],
  },
  {
    id: "fm2-luci",
    keys: ["fm2", "luci", "futuro", "future", "mision", "mission", "brecha", "gap", "new shepard", "hls"],
    text: l(
      "Dos misiones cierran la brecha de gravedad parcial. LUCI (4 de febrero de 2025) quemó tejido y PMMA en un cohete New Shepard que giraba para crear gravedad lunar durante más de 2,5 minutos, en aire. FM2 quemará SIBAL y PMMA en la superficie de la Luna, en aire a 101,3 kPa y en la atmósfera de exploración (34 % O₂ a 56,5 kPa): será el primer ensayo de fuego en gravedad lunar real.",
      "Two missions close the partial-gravity gap. LUCI (4 February 2025) burned fabric and PMMA on a New Shepard rocket spun to create lunar gravity for more than 2.5 minutes, in air. FM2 will burn SIBAL and PMMA on the lunar surface, in air at 101.3 kPa and in the exploration atmosphere (34% O₂ at 56.5 kPa): the first fire test in real lunar gravity.",
    ),
    sources: ["LUCI", "B7", "FM2WEB"],
    evidence: "C",
  },
  {
    id: "efield",
    keys: ["efield", "e-field", "electrico", "electric", "campo", "field", "proxy", "ionico", "ion"],
    text: l(
      "E-FIELD Flames aplica un campo eléctrico a la llama: los iones se mueven y arrastran gas (“viento iónico”), lo que cambia la forma de la llama como lo haría la flotabilidad. Es un análogo de un mecanismo de transporte (evidencia C), no una equivalencia entre voltios y gravedad lunar.",
      "E-FIELD Flames applies an electric field to the flame: ions move and drag gas (“ionic wind”), changing the flame shape much as buoyancy would. It is an analogue of a transport mechanism (evidence level C), not a volts-to-lunar-gravity conversion.",
    ),
    sources: ["B3"],
    evidence: "C",
  },
  {
    id: "apollo1",
    keys: ["apolo", "apollo", "1967", "grissom", "puro", "pure"],
    text: l(
      "El 27 de enero de 1967 un incendio en la cabina del Apolo 1, llena de oxígeno puro a 16,7 psi durante una prueba en tierra, mató a Grissom, White y Chaffee. Sin diluyente, materiales comunes como nylon y Velcro ardieron de forma explosiva y la presión rompió el casco en menos de 20 segundos. Lección: un material aceptado en una atmósfera no está probado en otra.",
      "On 27 January 1967 a fire in the Apollo 1 cabin, filled with pure oxygen at 16.7 psi during a ground test, killed Grissom, White and Chaffee. With no diluent, common materials such as nylon and Velcro burned explosively and pressure ruptured the hull in under 20 seconds. Lesson: a material accepted in one atmosphere is not proven in another.",
    ),
    sources: ["AP1", "B22"],
  },
  {
    id: "mir",
    keys: ["mir", "1997", "generador", "generator", "perclorato", "linenger"],
    text: l(
      "El 23 de febrero de 1997 un generador químico de oxígeno se incendió en la estación Mir y lanzó un chorro tipo soplete durante unos 14 minutos. Como llevaba su propio oxidante, cortar la ventilación o diluir el aire no lo apagaba: se extinguió al agotarse. El humo denso y el CO fueron el mayor peligro, y el fuego bloqueó el camino a una de las naves de escape.",
      "On 23 February 1997 a chemical oxygen generator caught fire on Mir and threw a blowtorch-like jet for about 14 minutes. Because it carried its own oxidiser, cutting ventilation or diluting the air did not put it out: it burned until exhausted. Dense smoke and CO were the main hazard, and the fire blocked the path to one of the escape vehicles.",
    ),
    sources: ["MIR97", "B22"],
  },
  {
    id: "earth-apps",
    keys: ["tierra", "bomberos", "spinoff", "aplicaciones", "earth", "firefighters", "applications", "pbi", "tanque", "tank"],
    text: l(
      "Tecnología espacial que hoy protege en la Tierra: los tanques de aire de material compuesto para bomberos (26 lb con el mismo aire que uno de acero de 41 lb), los textiles de PBI desarrollados tras el Apolo 1 que hoy visten a los bomberos, los detectores de fuego incipiente y la imagen infrarroja de llamas invisibles.",
      "Space technology that protects people on Earth today: composite air tanks for firefighters (26 lb with the same air as a 41 lb steel one), PBI textiles developed after Apollo 1 that firefighters wear today, incipient fire detectors and infrared imaging of invisible flames.",
    ),
    sources: ["SP-TANK", "SP-PBI", "SP-DET", "SP-FIRESCAPE"],
  },
];
