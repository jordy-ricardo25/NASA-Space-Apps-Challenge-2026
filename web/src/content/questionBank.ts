/**
 * Banco de preguntas del asistente: lo que cualquier persona preguntaría sobre
 * la plataforma, con su respuesta. Las respuestas describen el producto tal
 * como está construido (docs/documentacion-proyecto.md) y no añaden datos
 * científicos nuevos. El documento maestro del corpus lo completa con
 * preguntas generadas a partir de las fichas, los ambientes y los materiales.
 */
import { l, type L } from "./i18n";

export interface BankQuestion {
  q: L;
  a: L;
}

/** Pregunta que se responde con una ficha de conocimiento (clave de KNOWLEDGE). */
export const CARD_QUESTIONS: Record<string, L[]> = {
  sphere: [l("¿Por qué la llama es redonda y azul en el espacio?", "Why is the flame round and blue in space?"), l("¿Cómo se ve una vela en microgravedad?", "What does a candle look like in microgravity?")],
  "moon-worse": [l("¿Es más peligroso un incendio en la Luna que en la Estación Espacial?", "Is a fire on the Moon more dangerous than on the Space Station?"), l("¿Qué pasa con el fuego en gravedad parcial?", "What happens to fire in partial gravity?")],
  "o2-pressure": [l("¿Cómo se respira con 34 % de oxígeno y poca presión?", "How do you breathe with 34% oxygen and low pressure?"), l("¿Qué es la presión parcial de oxígeno?", "What is oxygen partial pressure?")],
  "why-low-pressure": [l("¿Por qué las bases lunares usan menos presión y más oxígeno?", "Why do lunar bases use less pressure and more oxygen?"), l("¿Qué tiene que ver la caminata espacial con la atmósfera de la cabina?", "What does a spacewalk have to do with the cabin atmosphere?")],
  "u-curve": [l("¿Qué es el límite de oxígeno de un material?", "What is a material's oxygen limit?"), l("¿Por qué importa la velocidad del aire para que algo arda?", "Why does air speed matter for something to burn?")],
  ventilation: [l("¿Qué hace la tripulación cuando suena la alarma de incendio?", "What does the crew do when the fire alarm sounds?"), l("¿Se apaga el fuego si corto la ventilación?", "Does the fire go out if I cut ventilation?")],
  saffire: [l("¿Qué es Saffire?", "What is Saffire?"), l("¿Se ha quemado algo grande a propósito en el espacio?", "Has anything large been burned on purpose in space?")],
  co: [l("¿Qué es lo más peligroso después de apagar un incendio en una nave?", "What is most dangerous after putting out a fire in a spacecraft?"), l("¿Por qué preocupa el monóxido de carbono en una cabina?", "Why is carbon monoxide a concern in a cabin?")],
  "cool-flames": [l("¿Qué es una llama fría?", "What is a cool flame?"), l("¿Puede seguir ardiendo algo que ya no se ve?", "Can something keep burning when you can no longer see it?")],
  d2: [l("¿Cómo arde una gota de combustible?", "How does a fuel droplet burn?"), l("¿Qué es la ley d²?", "What is the d² law?")],
  suppression: [l("¿Cómo se apaga un incendio en el espacio?", "How do you put out a fire in space?"), l("¿Qué gas apaga mejor, el CO₂ o el helio?", "Which gas suppresses better, CO₂ or helium?")],
  "water-mist": [l("¿Qué extintor se usa en la Estación Espacial?", "Which extinguisher is used on the Space Station?"), l("¿Sirve la niebla de agua contra el fuego en microgravedad?", "Does water mist work against fire in microgravity?")],
  detection: [l("¿Cómo se detecta el humo en una nave?", "How is smoke detected in a spacecraft?"), l("¿Por qué el humo es distinto en microgravedad?", "Why is smoke different in microgravity?")],
  test1: [l("¿Cómo decide NASA qué materiales pueden volar?", "How does NASA decide which materials can fly?"), l("¿El ensayo de materiales en la Tierra sirve para el espacio?", "Does the Earth material test hold for space?")],
  psi: [l("¿Qué es PSI?", "What is PSI?"), l("¿De dónde salen los datos de la plataforma?", "Where does the platform's data come from?")],
  "fm2-luci": [l("¿Qué experimentos medirán el fuego en la Luna?", "Which experiments will measure fire on the Moon?"), l("¿Cuándo habrá datos de gravedad lunar?", "When will lunar-gravity data exist?")],
  efield: [l("¿Para qué sirve un campo eléctrico sobre una llama?", "What is an electric field on a flame for?"), l("¿Cómo se imita la gravedad parcial sin ir a la Luna?", "How do you mimic partial gravity without going to the Moon?")],
  apollo1: [l("¿Qué pasó en el Apollo 1?", "What happened on Apollo 1?"), l("¿Por qué no se usa oxígeno puro a presión normal?", "Why isn't pure oxygen used at normal pressure?")],
  mir: [l("¿Qué pasó en el incendio de la Mir?", "What happened in the Mir fire?")],
  "earth-apps": [l("¿Para qué sirve todo esto en la Tierra?", "What is all this good for on Earth?"), l("¿Qué tecnología espacial usan los bomberos?", "Which space technology do firefighters use?")],
};

export const PLATFORM_QUESTIONS: BankQuestion[] = [
  {
    q: l("¿Qué problema resuelve esta plataforma?", "What problem does this platform solve?"),
    a: l(
      "NASA tiene décadas de experimentos de combustión en baja gravedad en su base de datos PSI, pero son difíciles de encontrar, de comparar y de interpretar. La plataforma los resume, los ordena y los interpreta para la seguridad contra incendios de naves, estaciones, rovers, trajes y bases.",
      "NASA has decades of low-gravity combustion experiments in its PSI database, but they are hard to find, compare and interpret. The platform summarises, ranks and interprets them for the fire safety of spacecraft, stations, rovers, suits and bases.",
    ),
  },
  {
    q: l("¿Quién hizo Flame in Freefall?", "Who built Flame in Freefall?"),
    a: l(
      "El equipo Andora Labs, de Riobamba (Ecuador), para el NASA Space Apps Challenge 2026. Es un proyecto independiente: usa datos y modelos abiertos de NASA y no implica aval de NASA.",
      "Team Andora Labs, from Riobamba (Ecuador), for the NASA Space Apps Challenge 2026. It is an independent project: it uses open NASA data and models and implies no NASA endorsement.",
    ),
  },
  {
    q: l("¿Cómo empiezo a usar la plataforma?", "How do I start using the platform?"),
    a: l(
      "Elige un ambiente en el inicio o en Módulos, entra a su cabina, cambia el oxígeno, la presión, la ventilación o el material y pulsa Encender muestra. Para la explicación de cada número, abre el Laboratorio; para las investigaciones, la Guía.",
      "Pick an environment on the home screen or in Modules, enter its cabin, change oxygen, pressure, ventilation or material and press Ignite sample. For the explanation of each number open the Laboratory; for the investigations, the Guide.",
    ),
  },
  {
    q: l("¿Qué puedo hacer dentro de una cabina?", "What can I do inside a cabin?"),
    a: l(
      "Cambiar la atmósfera, el material y la ventilación, encender una muestra y ver una llama volumétrica que responde en tiempo real junto a la misma llama en la Tierra. La telemetría muestra la potencia del fuego, la frontera de oxígeno, el CO de cabina y el detector, y puedes probar la respuesta de la tripulación: cortar la ventilación, cortar la energía, extintor de CO₂, niebla de agua o despresurizar.",
      "Change the atmosphere, the material and the ventilation, ignite a sample and watch a volumetric flame respond in real time next to the same flame on Earth. Telemetry shows fire power, the oxygen boundary, cabin CO and the detector, and you can try the crew response: cut ventilation, cut power, CO₂ extinguisher, water mist or depressurise.",
    ),
  },
  {
    q: l("¿Qué es el margen de inflamabilidad?", "What is the flammability margin?"),
    a: l(
      "Es la diferencia entre el oxígeno del ambiente y la frontera de oxígeno con la que el material propaga la llama, en puntos de oxígeno. Si es positivo, el ambiente supera la frontera. Siempre se muestra con su intervalo y su nivel de evidencia.",
      "It is the difference between the environment's oxygen and the oxygen boundary at which the material spreads flame, in oxygen points. If it is positive, the environment exceeds the boundary. It is always shown with its interval and its evidence level.",
    ),
  },
  {
    q: l("¿Qué significan los niveles de evidencia A, B, C, D y ∅?", "What do the evidence levels A, B, C, D and ∅ mean?"),
    a: l(
      "A es evidencia directa: mismo régimen de gravedad y atmósfera, dentro del rango ensayado. B es análoga: régimen similar con otro material o escala. C es un proxy: un mecanismo sustituto. D es una extrapolación fuera del rango de los datos, como la gravedad lunar. ∅ es sin evidencia. Sin evidencia nunca se presenta como riesgo bajo.",
      "A is direct evidence: same gravity regime and atmosphere, inside the tested range. B is analogous: a similar regime with another material or scale. C is a proxy: a substitute mechanism. D is an extrapolation outside the data range, such as lunar gravity. ∅ is no evidence. No evidence is never presented as low risk.",
    ),
  },
  {
    q: l("¿Qué son las alertas ALR?", "What are the ALR alerts?"),
    a: l(
      "Son avisos de análisis, no de sensores. ALR-01: el oxígeno supera el límite del material. ALR-02: a menos de 2 puntos del límite. ALR-03: oxígeno de 30 % o más. ALR-04: gravedad entre 0 y 1 g, sin datos directos en PSI. ALR-05: material sin límite conocido. ALR-06: flujo cercano al de mayor inflamabilidad. ALR-07: posible llama fría tras apagarse la visible. ALR-08: material evaluado solo en 1 g. ALR-09: consulta fuera del rango de los datos.",
      "They are analysis notices, not sensor alarms. ALR-01: oxygen exceeds the material's limit. ALR-02: within 2 points of the limit. ALR-03: oxygen at 30% or more. ALR-04: gravity between 0 and 1 g, no direct PSI data. ALR-05: material with no known limit. ALR-06: flow close to the most flammable one. ALR-07: possible cool flame after the visible one goes out. ALR-08: material assessed only in 1 g. ALR-09: query outside the data range.",
    ),
  },
  {
    q: l("¿La plataforma detecta incendios reales?", "Does the platform detect real fires?"),
    a: l(
      "No. No recibe datos de sensores. Analiza escenarios con un modelo físico y con la evidencia publicada; el reto deja fuera la detección de incendios reales en tiempo real.",
      "No. It receives no sensor data. It analyses scenarios with a physical model and published evidence; the challenge leaves real-time fire detection out of scope.",
    ),
  },
  {
    q: l("¿De dónde salen los números?", "Where do the numbers come from?"),
    a: l(
      "De un modelo físico de orden reducido calibrado con valores publicados, y cada cifra enlaza a su fuente (DOI o registro NTRS). La pestaña Datos PSI de la Guía muestra además hallazgos procesados por el backend del equipo a partir de los datos de PSI.",
      "From a reduced-order physical model calibrated with published values, and every figure links to its source (DOI or NTRS record). The PSI data tab in the Guide also shows findings processed by the team's backend from PSI data.",
    ),
  },
  {
    q: l("¿Qué es el índice RPI de la pestaña Datos PSI?", "What is the RPI index in the PSI data tab?"),
    a: l(
      "Es un índice de 0 a 100 que calcula el backend del equipo para ordenar los hallazgos de PSI según el ambiente elegido, con una banda (bajo, moderado, alto o crítico). Sirve para priorizar qué leer; no es una probabilidad de incendio.",
      "It is an index from 0 to 100 that the team's backend computes to rank PSI findings for the chosen environment, with a band (low, moderate, high or critical). It helps prioritise what to read; it is not a fire probability.",
    ),
  },
  {
    q: l("¿Cómo evita el asistente inventar respuestas?", "How does the assistant avoid making things up?"),
    a: l(
      "Responde solo con las respuestas aprobadas por el equipo, las cifras del modelo físico, las fichas del catálogo y los documentos de la bibliografía, y muestra el origen y las fuentes de cada respuesta. Si algo no está en las fuentes, lo dice.",
      "It answers only with the team's approved answers, the physical model's figures, the catalogue records and the bibliography documents, and it shows the origin and sources of every answer. If something is not in the sources, it says so.",
    ),
  },
  {
    q: l("¿Puedo hablarle al asistente?", "Can I talk to the assistant?"),
    a: l(
      "Sí. El micrófono del chat escribe lo que dices y, con el envío automático activo, manda la pregunta cuando dejas de hablar. Funciona en Chrome y Edge. La respuesta se lee en voz alta si la lectura automática está activada.",
      "Yes. The chat microphone writes what you say and, with auto-send on, sends the question when you stop talking. It works in Chrome and Edge. The answer is read aloud if read-aloud is on.",
    ),
  },
  {
    q: l("¿En qué idiomas funciona?", "Which languages does it work in?"),
    a: l(
      "La interfaz está en español y en inglés. El asistente responde en el idioma en que le preguntas.",
      "The interface is in Spanish and English. The assistant answers in the language you ask in.",
    ),
  },
  {
    q: l("¿Por qué hay una base lunar y otra en Marte?", "Why is there a lunar base and a Mars base?"),
    a: l(
      "Porque son ambientes distintos. La base lunar tiene gravedad de 0,165 g y la atmósfera de exploración (34 % de oxígeno a 56,5 kPa). La base marciana tiene 0,38 g y ninguna fuente fija todavía su atmósfera de cabina: se muestra como hipótesis y sin evidencia.",
      "Because they are different environments. The lunar base has 0.165 g gravity and the exploration atmosphere (34% oxygen at 56.5 kPa). The Mars base has 0.38 g and no source yet fixes its cabin atmosphere: it is shown as a hypothesis with no evidence.",
    ),
  },
  {
    q: l("¿Por qué no hay datos de la Luna ni de Marte?", "Why is there no data for the Moon or Mars?"),
    a: l(
      "Porque los experimentos de PSI se hicieron en microgravedad o en la Tierra. Ninguno midió en gravedad lunar o marciana. Experimentos futuros como LUCI y FM2 lo harán; hasta entonces, la plataforma marca esos resultados como predicción.",
      "Because PSI experiments were run in microgravity or on Earth. None measured in lunar or Martian gravity. Future experiments such as LUCI and FM2 will; until then the platform marks those results as predictions.",
    ),
  },
  {
    q: l("¿La plataforma estudia cohetes o motores?", "Does the platform study rockets or engines?"),
    a: l(
      "No. El reto deja fuera cohetes y propelentes: en un motor las velocidades son tan altas que la combustión es prácticamente independiente de la gravedad. El módulo Nave es la cabina tripulada, no el motor.",
      "No. The challenge leaves rockets and propellants out: in an engine velocities are so high that combustion is effectively independent of gravity. The Spacecraft module is the crewed cabin, not the engine.",
    ),
  },
  {
    q: l("¿Quién es Flamey?", "Who is Flamey?"),
    a: l(
      "La mascota y el asistente: una llama con carita. Su forma sigue la gravedad del ambiente activo: gota con punta amarilla donde hay gravedad y esfera azul en microgravedad, igual que una llama real.",
      "The mascot and the assistant: a flame with a little face. Its shape follows the gravity of the active environment: a teardrop with a yellow tip where there is gravity and a blue sphere in microgravity, just like a real flame.",
    ),
  },
  {
    q: l("¿Puedo compartir un escenario exacto?", "Can I share an exact scenario?"),
    a: l(
      "Sí. El estado de cada pantalla vive en la dirección de la página: al copiar el enlace se comparte el ambiente, el material y la atmósfera que estás viendo.",
      "Yes. The state of each screen lives in the page address: copying the link shares the environment, material and atmosphere you are looking at.",
    ),
  },
  {
    q: l("¿Se usó inteligencia artificial en el proyecto?", "Was artificial intelligence used in the project?"),
    a: l(
      "Sí, y está declarado en Datos y referencias: el asistente usa un modelo de lenguaje apoyado en los documentos de la bibliografía, y la voz puede ser generada con IA. Las cifras científicas no las genera la IA: salen del modelo físico y de las fuentes.",
      "Yes, and it is declared under Data and references: the assistant uses a language model grounded in the bibliography documents, and the voice may be AI-generated. Scientific figures are not generated by AI: they come from the physical model and the sources.",
    ),
  },
];
