/**
 * Fichas de investigaciones (documento maestro §12.2–§12.4). Solo aparecen
 * las investigaciones identificadas en las fuentes; el inventario completo de
 * las 24 de PSI sigue en verificación y no se rellena con fichas inventadas.
 * Los rangos numéricos vacíos (`null`) significan "no publicado en nuestras
 * fuentes", nunca cero.
 */
import { l, type L } from "./i18n";
import type { ModuleId } from "./modules";

export type Pillar = "prevention" | "detection" | "suppression" | "fundamental";
export type Family = "solid" | "liquid" | "gas" | "smoke";
export type Coverage = "yes" | "no" | "na";
export type VarKey = "o2" | "pressure" | "flow" | "partialG" | "spread" | "hrr" | "extinction" | "soot" | "smoke" | "toxics";

export const PILLAR_LABEL: Record<Pillar, L> = {
  prevention: l("Prevención", "Prevention"),
  detection: l("Detección", "Detection"),
  suppression: l("Supresión", "Suppression"),
  fundamental: l("Fundamental", "Fundamental"),
};

export const FAMILY_LABEL: Record<Family, L> = {
  solid: l("Sólidos", "Solids"),
  liquid: l("Gotas líquidas", "Liquid droplets"),
  gas: l("Gases", "Gases"),
  smoke: l("Humo y partículas", "Smoke and particles"),
};

export const VAR_LABEL: Record<VarKey, L> = {
  o2: l("O₂", "O₂"),
  pressure: l("Presión", "Pressure"),
  flow: l("Flujo", "Flow"),
  partialG: l("Gravedad parcial", "Partial gravity"),
  spread: l("Propagación", "Flame spread"),
  hrr: l("Potencia", "Heat release"),
  extinction: l("Extinción", "Extinction"),
  soot: l("Hollín", "Soot"),
  smoke: l("Humo", "Smoke"),
  toxics: l("CO / CO₂", "CO / CO₂"),
};

export const VAR_KEYS = Object.keys(VAR_LABEL) as VarKey[];

export interface Investigation {
  id: string;
  name: string;
  full: string;
  /** Identificador en PSI, o estado de sus datos. */
  psi: L;
  family: Family;
  pillars: Pillar[];
  platform: L;
  hardware: string;
  years: string;
  objective: L;
  fuel: L;
  conditions: L;
  findings: L;
  limitations: L;
  regime: "micro" | "partial" | "earth";
  /** Rangos ensayados: O₂ (%), presión (kPa) y flujo (cm/s). */
  o2: [number, number] | null;
  p: [number, number] | null;
  flow: [number, number] | null;
  scale: "bench" | "vehicle" | "surface";
  /** Disponibilidad de datos: 3 tablas en PSI · 2 reportes publicados · 1 por confirmar · 0 sin datos aún. */
  data: 0 | 1 | 2 | 3;
  vars: Record<VarKey, Coverage>;
  sources: string[];
  modules: ModuleId[];
}

const V = (s: string): Record<VarKey, Coverage> => {
  const map: Record<string, Coverage> = { y: "yes", n: "no", "-": "na" };
  const out = {} as Record<VarKey, Coverage>;
  VAR_KEYS.forEach((k, i) => (out[k] = map[s[i] ?? "n"] ?? "no"));
  return out;
};

const pending = l("Datos en PSI por confirmar", "PSI data to be confirmed");

export const INVESTIGATIONS: Investigation[] = [
  {
    id: "bass2", name: "BASS / BASS-II", full: "Burning and Suppression of Solids", psi: l("PSI-25 · DOI 10.60555/4qc4-de67", "PSI-25 · DOI 10.60555/4qc4-de67"),
    family: "solid", pillars: ["prevention", "suppression"], platform: l("ISS · guantera MSG", "ISS · MSG glovebox"), hardware: "MSG + SPICE flow duct", years: "2012–2017",
    objective: l("Medir cómo arden y se apagan muestras sólidas pequeñas variando el flujo de aire y el O₂.", "Measure how small solid samples burn and extinguish while varying airflow and O₂."),
    fuel: l("Acrílico (PMMA), papel y tejidos", "Acrylic (PMMA), paper and fabrics"),
    conditions: l("Flujo de 0 a decenas de cm/s; O₂ variable; microgravedad", "Flow from 0 to tens of cm/s; variable O₂; microgravity"),
    findings: l("La propagación es más rápida cerca de ≈10 cm/s; el flujo de calor crítico de ignición puede ser la mitad que en 1 g; el ensayo en 1 g podría no ser conservador.", "Spread is fastest near ≈10 cm/s; critical ignition heat flux can be half the 1 g value; the 1 g test may not be conservative."),
    limitations: l("Muestras pequeñas; la vista de PSI tiene 130 filas que no equivalen a 130 ensayos independientes.", "Small samples; the PSI view has 130 rows that are not 130 independent tests."),
    regime: "micro", o2: [13.6, 22.2], p: [101.3, 101.3], flow: [0, 55], scale: "bench", data: 3, vars: V("ynynynynnn"), sources: ["PSI25", "ISSFIRE", "OLSON17"], modules: ["estacion", "nave"],
  },
  {
    id: "saffire", name: "Saffire I–VI", full: "Spacecraft Fire Safety Demonstration", psi: pending,
    family: "solid", pillars: ["prevention", "detection"], platform: l("Nave Cygnus sin tripulación", "Uncrewed Cygnus vehicle"), hardware: "Flow duct 30 × 45 × 109 cm", years: "2016–2024",
    objective: l("Quemar muestras grandes para medir propagación, calor, gases y humo a escala de nave.", "Burn large samples to measure spread, heat, gases and smoke at vehicle scale."),
    fuel: l("Tela SIBAL (94 × 40,6 cm), PMMA, algodón, silicona, Nomex", "SIBAL fabric (94 × 40.6 cm), PMMA, cotton, silicone, Nomex"),
    conditions: l("20–25 cm/s; 22–31 % O₂; 54–100 kPa; volumen libre 16,7–19 m³", "20–25 cm/s; 22–31% O₂; 54–100 kPa; 16.7–19 m³ free volume"),
    findings: l("1,8 mm/s a favor del flujo y 1,3 mm/s en contra; fuegos de 1,5–3,2 kW; el CO y el CO₂ pesan más que la presión y la temperatura.", "1.8 mm/s concurrent and 1.3 mm/s opposed; 1.5–3.2 kW fires; CO and CO₂ matter more than pressure and temperature."),
    limitations: l("Pocos ensayos por condición; sin tripulación; solo microgravedad.", "Few tests per condition; uncrewed; microgravity only."),
    regime: "micro", o2: [21.5, 31], p: [54.1, 101.3], flow: [20, 25], scale: "vehicle", data: 2, vars: V("yyynyyynyy"), sources: ["B10", "B2", "SAF45"], modules: ["nave", "estacion", "rover", "base"],
  },
  {
    id: "sofie", name: "SoFIE", full: "Solid Fuel Ignition and Extinction", psi: pending,
    family: "solid", pillars: ["prevention", "suppression"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "SoFIE insert in CIR", years: "2022–2025",
    objective: l("Estudiar ignición, propagación y extinción de sólidos, con supresión por diluyentes, reducción de flujo y venteo.", "Study ignition, spread and extinction of solids, with suppression by diluents, flow reduction and venting."),
    fuel: l("Sólidos delgados y gruesos (MIST, GEL y otras)", "Thin and thick solids (MIST, GEL and others)"),
    conditions: l("10–40 % O₂; 20–152 kPa; 0–30 cm/s; radiación externa", "10–40% O₂; 20–152 kPa; 0–30 cm/s; external radiation"),
    findings: l("Amplía el dominio ensayado en O₂ y presión hasta las atmósferas de exploración.", "Extends the tested O₂ and pressure domain up to exploration atmospheres."),
    limitations: l("Resultados en publicación; escala de laboratorio.", "Results being published; bench scale."),
    regime: "micro", o2: [10, 40], p: [20, 152], flow: [0, 30], scale: "bench", data: 1, vars: V("yyynynynnn"), sources: ["SOFIE"], modules: ["estacion", "rover", "base"],
  },
  {
    id: "flex", name: "FLEX / FLEX-2", full: "Flame Extinguishment Experiment", psi: l("PSI-69", "PSI-69"),
    family: "liquid", pillars: ["suppression"], platform: l("ISS · CIR con MDCA", "ISS · CIR with MDCA"), hardware: "MDCA in CIR", years: "2009–2014",
    objective: l("Medir cómo arden y se extinguen gotas de combustible en atmósferas con distinto O₂, CO₂, He y presión.", "Measure how fuel droplets burn and extinguish in atmospheres with different O₂, CO₂, He and pressure."),
    fuel: l("Gotas de metanol y n-heptano de 1–5 mm", "1–5 mm methanol and n-heptane droplets"),
    conditions: l("O₂ hasta 40 %; 0–3 atm; diluyentes CO₂, He y N₂", "O₂ up to 40%; 0–3 atm; CO₂, He and N₂ diluents"),
    findings: l("Descubrió las llamas frías; el índice de oxígeno límite es bastante menor que en 1 g; ley d² con extinción a diámetro finito.", "Discovered cool flames; the limiting oxygen index is well below the 1 g value; d² law with extinction at finite diameter."),
    limitations: l("Gotas aisladas: una concentración crítica no es una dosis para una cabina.", "Isolated droplets: a critical concentration is not a cabin dose."),
    regime: "micro", o2: [10, 40], p: [50, 304], flow: [0, 5], scale: "bench", data: 3, vars: V("yynn-nyynn"), sources: ["PSI69", "FLEX15"], modules: ["estacion", "nave"],
  },
  {
    id: "cfi", name: "CFI", full: "Cool Flames Investigation", psi: pending,
    family: "liquid", pillars: ["fundamental"], platform: l("ISS · CIR con MDCA", "ISS · CIR with MDCA"), hardware: "MDCA in CIR", years: "2014–2017",
    objective: l("Caracterizar las llamas frías de gotas tras la extinción de la llama visible.", "Characterise droplet cool flames after the visible flame extinguishes."),
    fuel: l("Gotas de alcanos", "Alkane droplets"),
    conditions: l("O₂ y presión variables; microgravedad", "Variable O₂ and pressure; microgravity"),
    findings: l("Las llamas frías pueden durar minutos en microgravedad.", "Cool flames can last minutes in microgravity."),
    limitations: l("Requiere diagnóstico específico: una caída de luz no prueba la llama fría.", "Needs a specific diagnostic: a drop in light does not prove a cool flame."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("yynn-nynnn"), sources: ["B3", "ISSFIRE"], modules: ["estacion"],
  },
  {
    id: "cfig", name: "ACME · CFI-G", full: "Cool Flames Investigation with Gases", psi: pending,
    family: "gas", pillars: ["prevention"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "ACME insert in CIR", years: "2021–2022",
    objective: l("Estudiar llamas frías de gas en quemador poroso con oxígeno muy alto.", "Study gaseous cool flames on a porous burner at very high oxygen."),
    fuel: l("Etano, propano y n-butano", "Ethane, propane and n-butane"),
    conditions: l("O₂ hasta 85 %", "O₂ up to 85%"),
    findings: l("Es el O₂ más alto ensayado en PSI; la llama puede arder “de adentro hacia afuera”.", "The highest O₂ tested in PSI; the flame can burn “inside out”."),
    limitations: l("Quemador de gas: no es una medición directa de un material sólido.", "Gas burner: not a direct measurement of a solid material."),
    regime: "micro", o2: [21, 85], p: null, flow: null, scale: "bench", data: 1, vars: V("ynnn-nynnn"), sources: ["B3", "CHALLENGE"], modules: ["rover", "base"],
  },
  {
    id: "efield", name: "ACME · E-FIELD Flames", full: "Electric-Field Effects on Laminar Diffusion Flames", psi: l("Datos publicados en PSI", "Data published in PSI"),
    family: "gas", pillars: ["fundamental"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "ACME insert in CIR", years: "2018–2019",
    objective: l("Ver cómo un campo eléctrico mueve los iones de la llama y cambia su forma.", "See how an electric field moves the flame's ions and changes its shape."),
    fuel: l("Llamas de gas laminares", "Laminar gas flames"),
    conditions: l("Voltaje variable; microgravedad", "Variable voltage; microgravity"),
    findings: l("El “viento iónico” devuelve a la llama esférica una forma de gota.", "The “ionic wind” gives the spherical flame a teardrop shape again."),
    limitations: l("Análogo de un mecanismo de transporte: no existe una conversión de voltios a gravedad lunar.", "Analogue of a transport mechanism: there is no volts-to-lunar-gravity conversion."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 2, vars: V("nnnn-nnynn"), sources: ["B3"], modules: ["rover", "base"],
  },
  {
    id: "bre", name: "ACME · BRE", full: "Burning Rate Emulator", psi: pending,
    family: "gas", pillars: ["prevention"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "25 mm porous burner", years: "2019–2020",
    objective: l("Imitar con un quemador de gas cómo arde la superficie de un sólido y medir el calor que vuelve a ella.", "Emulate with a gas burner how a solid surface burns and measure the heat fed back to it."),
    fuel: l("Etileno puro o diluido", "Pure or diluted ethylene"),
    conditions: l("59 ensayos; 21–40 % O₂; ≈56–100 kPa", "59 tests; 21–40% O₂; ≈56–100 kPa"),
    findings: l("Llamas azules estables durante minutos; cubre las presiones y fracciones de O₂ de las atmósferas de exploración.", "Stable blue flames for minutes; covers exploration-atmosphere pressures and O₂ fractions."),
    limitations: l("Emula materiales; no mide cada plástico directamente.", "It emulates materials; it does not measure each plastic directly."),
    regime: "micro", o2: [21, 40], p: [56, 100], flow: null, scale: "bench", data: 1, vars: V("yynn-yynnn"), sources: ["BRE21", "B3"], modules: ["base", "rover"],
  },
  {
    id: "acme-sflame", name: "ACME · s-Flame", full: "Structure and Response of Spherical Diffusion Flames", psi: pending,
    family: "gas", pillars: ["fundamental"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "Spherical porous burner", years: "2019–2021",
    objective: l("Estudiar llamas esféricas de gas: extinción radiativa y cinética.", "Study spherical gas flames: radiative and kinetic extinction."),
    fuel: l("H₂, CH₄ y C₂H₄ con N₂ o He", "H₂, CH₄ and C₂H₄ with N₂ or He"),
    conditions: l("Caudal y diluyente variables", "Variable flow rate and diluent"),
    findings: l("Las llamas grandes crecen hasta apagarse por pérdida radiativa.", "Large flames grow until they extinguish by radiative loss."),
    limitations: l("Geometría ideal de laboratorio.", "Idealised laboratory geometry."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("ynnn-nyynn"), sources: ["B3", "ACME22"], modules: ["estacion"],
  },
  {
    id: "acme-cld", name: "ACME · CLD Flame", full: "Coflow Laminar Diffusion Flame", psi: pending,
    family: "gas", pillars: ["fundamental"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "ACME insert in CIR", years: "2017–2018",
    objective: l("Medir hollín y temperatura en llamas de chorro rodeadas de aire.", "Measure soot and temperature in jet flames surrounded by coflowing air."),
    fuel: l("Chorro de gas con dilución variable", "Gas jet with variable dilution"),
    conditions: l("Velocidad y dilución variables", "Variable velocity and dilution"),
    findings: l("La fracción de hollín puede ser varias veces mayor que en 1 g.", "The soot fraction can be several times higher than at 1 g."),
    limitations: l("No toda llama en microgravedad es más hollinosa: cerca del límite son azules.", "Not every microgravity flame is sootier: near the limit they are blue."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("nnyn-nnynn"), sources: ["B3"], modules: ["estacion"],
  },
  {
    id: "flame-design", name: "ACME · Flame Design", full: "Flame Design", psi: pending,
    family: "gas", pillars: ["fundamental"], platform: l("ISS · CIR", "ISS · CIR"), hardware: "ACME insert in CIR", years: "2019–2022",
    objective: l("“Diseñar” llamas sin hollín cambiando dónde está el oxígeno.", "“Design” soot-free flames by changing where the oxygen is."),
    fuel: l("Etileno, llama normal e inversa", "Ethylene, normal and inverse flames"),
    conditions: l("O₂ y caudal variables", "Variable O₂ and flow rate"),
    findings: l("La llama crece con el caudal y se encoge con más O₂.", "The flame grows with flow rate and shrinks with more O₂."),
    limitations: l("Fundamental; sin materiales de cabina.", "Fundamental; no cabin materials."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("ynyn-nyynn"), sources: ["B3"], modules: ["estacion"],
  },
  {
    id: "spice", name: "SPICE", full: "Smoke Point In Coflow Experiment", psi: pending,
    family: "gas", pillars: ["fundamental"], platform: l("ISS · guantera MSG", "ISS · MSG glovebox"), hardware: "SPICE duct in MSG", years: "2009–2012",
    objective: l("Hallar el punto de humo: cuándo una llama de gas empieza a soltar hollín.", "Find the smoke point: when a gas flame starts releasing soot."),
    fuel: l("Chorros de gas", "Gas jets"),
    conditions: l("Flujo coaxial variable", "Variable coflow"),
    findings: l("El punto de humo define cuándo el hollín escapa sin quemarse.", "The smoke point defines when soot escapes unburned."),
    limitations: l("Fundamental.", "Fundamental."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("nnyn-nnyyn"), sources: ["CHALLENGE"], modules: ["estacion"],
  },
  {
    id: "slice", name: "SLICE", full: "Structure & Liftoff in Combustion Experiment", psi: pending,
    family: "gas", pillars: ["fundamental"], platform: l("ISS · guantera MSG", "ISS · MSG glovebox"), hardware: "SPICE hardware in MSG", years: "2012",
    objective: l("Estudiar llamas de chorro que se despegan del quemador.", "Study jet flames that lift off the burner."),
    fuel: l("Chorros de gas", "Gas jets"),
    conditions: l("Velocidades variables", "Variable velocities"),
    findings: l("Datos de estabilidad y despegue de llama.", "Flame stability and lift-off data."),
    limitations: l("Fundamental.", "Fundamental."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("nnyn-nynnn"), sources: ["GLENN"], modules: ["estacion"],
  },
  {
    id: "same", name: "SAME / SAME-2", full: "Smoke Aerosol Measurement Experiment", psi: pending,
    family: "smoke", pillars: ["detection"], platform: l("ISS · guantera MSG", "ISS · MSG glovebox"), hardware: "P-Trak, ionisation chamber, DustTrak", years: "2007–2010",
    objective: l("Calentar materiales de nave para producir humo y medir el tamaño de sus partículas.", "Heat spacecraft materials to make smoke and measure its particle size."),
    fuel: l("Teflon, Kapton, algodón, silicona y Pyrell", "Teflon, Kapton, cotton, silicone and Pyrell"),
    conditions: l("Flujo 0–8 cm/s; envejecimiento 11–1800 s", "Flow 0–8 cm/s; ageing 11–1800 s"),
    findings: l("Tamaños típicos de 200–400 nm; el detector de la ISS falla con frecuencia con el humo fino de Teflon y Kapton.", "Typical sizes of 200–400 nm; the ISS detector frequently misses fine Teflon and Kapton smoke."),
    limitations: l("Humo de sobrecalentamiento, no de llama; solo microgravedad.", "Overheating smoke, not flaming; microgravity only."),
    regime: "micro", o2: [21, 21], p: [101.3, 101.3], flow: [0, 8], scale: "bench", data: 2, vars: V("nnynnnnnyn"), sources: ["B11", "B13", "B12"], modules: ["nave", "estacion"],
  },
  {
    id: "daft", name: "DAFT", full: "Dust and Aerosol measurement Feasibility Test", psi: pending,
    family: "smoke", pillars: ["detection"], platform: l("ISS", "ISS"), hardware: "P-Trak", years: "2005–2006",
    objective: l("Comprobar que los instrumentos de partículas funcionan en microgravedad.", "Check that particle instruments work in microgravity."),
    fuel: l("Polvo de referencia y aerosol de fondo", "Reference dust and background aerosol"),
    conditions: l("Cabina de la ISS", "ISS cabin"),
    findings: l("Precursor de SAME; el polvo suspendido puede causar falsas alarmas.", "Precursor of SAME; suspended dust can cause false alarms."),
    limitations: l("Relevancia para el polvo lunar aún por verificar.", "Relevance to lunar dust still to be verified."),
    regime: "micro", o2: null, p: null, flow: null, scale: "bench", data: 1, vars: V("nnnnnnnnyn"), sources: ["B15"], modules: ["estacion", "base"],
  },
  {
    id: "luci", name: "LUCI", full: "Lunar Combustion Investigation", psi: l("No está en PSI", "Not in PSI"),
    family: "solid", pillars: ["prevention"], platform: l("Cohete suborbital New Shepard giratorio", "Spinning New Shepard suborbital rocket"), hardware: "Centrifuge payload", years: "2025",
    objective: l("Quemar sólidos en gravedad lunar creada por rotación durante más de 2,5 minutos.", "Burn solids in lunar gravity created by rotation for more than 2.5 minutes."),
    fuel: l("Tejido 5 × 30 cm y PMMA de 4 mm", "5 × 30 cm fabric and 4 mm PMMA"),
    conditions: l("Aire a presión normal; ≈0,165 g por rotación", "Air at normal pressure; ≈0.165 g by rotation"),
    findings: l("Primera quema prolongada en gravedad lunar simulada.", "First sustained burn in simulated lunar gravity."),
    limitations: l("Un vuelo; gravedad por rotación (Coriolis); en aire, no en atmósfera de exploración.", "One flight; gravity by rotation (Coriolis); in air, not in an exploration atmosphere."),
    regime: "partial", o2: [21, 21], p: [101.3, 101.3], flow: null, scale: "bench", data: 2, vars: V("nnnyynnnnn"), sources: ["LUCI"], modules: ["base", "rover"],
  },
  {
    id: "fm2", name: "FM2", full: "Flammability of Materials on the Moon", psi: l("Sin datos aún (misión futura)", "No data yet (future mission)"),
    family: "solid", pillars: ["prevention"], platform: l("Superficie lunar · aterrizador HLS", "Lunar surface · HLS lander"), hardware: "FM2 chamber, 4 igniters, colour cameras", years: "—",
    objective: l("Quemar materiales en la superficie de la Luna: gravedad lunar real y prolongada.", "Burn materials on the Moon's surface: real, sustained lunar gravity."),
    fuel: l("SIBAL y PMMA de 4 mm", "SIBAL and 4 mm PMMA"),
    conditions: l("21 % O₂ a 101,3 kPa y 34 % O₂ a 56,5 kPa", "21% O₂ at 101.3 kPa and 34% O₂ at 56.5 kPa"),
    findings: l("Cerrará la brecha de gravedad parcial con la atmósfera de exploración.", "It will close the partial-gravity gap in the exploration atmosphere."),
    limitations: l("Aún no hay resultados en superficie.", "No surface results yet."),
    regime: "partial", o2: [21, 34], p: [56.5, 101.3], flow: null, scale: "surface", data: 0, vars: V("yynyynnnnn"), sources: ["B7", "FM2WEB"], modules: ["base", "rover"],
  },
];

const INDEX = new Map(INVESTIGATIONS.map((i) => [i.id, i]));
export const getInvestigation = (id: string): Investigation | undefined => INDEX.get(id);
