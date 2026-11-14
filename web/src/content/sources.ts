/**
 * Catálogo de fuentes (documento maestro §18). Cada número que muestra la
 * plataforma apunta a una de estas claves. No se añade nada sin DOI, registro
 * NTRS o página oficial.
 */
export interface Source {
  id: string;
  /** Cita corta para chips y tablas. */
  short: string;
  title: string;
  url: string;
  kind: "ntrs" | "doi" | "psi" | "nasa" | "standard" | "spinoff" | "history" | "asset";
}

const S = (id: string, short: string, title: string, url: string, kind: Source["kind"]): Source => ({
  id,
  short,
  title,
  url,
  kind,
});

export const SOURCES: Source[] = [
  S("B2", "Urban et al. 2024", "Preliminary Results from the Saffire VI Experiment (ICES-2024-365)", "https://ntrs.nasa.gov/citations/20240002981", "ntrs"),
  S("B3", "Stocker 2021", "Recent Research on Flames of Gaseous Fuel Aboard the ISS (ACME)", "https://ntrs.nasa.gov/citations/20210021781", "ntrs"),
  S("B4", "Liao et al. 2021", "Challenges and Research Needs for Micro- and Partial-Gravity Fires", "https://ntrs.nasa.gov/citations/20210022403", "ntrs"),
  S("B5", "Takahashi et al. 2026a", "Downward flame spread of thermally thin solid materials in partial-gravity environments", "https://doi.org/10.1016/j.proci.2026.106097", "doi"),
  S("B6", "Urban et al. 2025", "Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results", "https://ntrs.nasa.gov/citations/20250006779", "ntrs"),
  S("B7", "Zayac et al. 2024", "Flammability of Materials on the Moon (FM2)", "https://ntrs.nasa.gov/citations/20240015307", "ntrs"),
  S("B8", "Nakaya et al. 2025", "A Bayesian approach to estimate flame spread model parameters over cylindrical PMMA samples under various gravity conditions", "https://doi.org/10.1016/j.combustflame.2024.113828", "doi"),
  S("B9", "NASA-STD-6001B", "Flammability, Offgassing, and Compatibility Requirements and Test Procedures (Change 3, 2025)", "https://standards.nasa.gov/standard/nasa/nasa-std-6001", "standard"),
  S("B10", "Ferkul et al. 2017", "Results of Large-Scale Spacecraft Flammability Tests (Saffire I–II)", "https://ntrs.nasa.gov/citations/20170008805", "ntrs"),
  S("B11", "Urban et al. 2012", "Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2", "https://ntrs.nasa.gov/citations/20130000422", "ntrs"),
  S("B12", "Urban et al. 2008", "Spacecraft Fire Detection: Smoke Properties and Transport in Low-Gravity", "https://ntrs.nasa.gov/citations/20080012612", "ntrs"),
  S("B13", "Meyer et al. 2018", "Evaluation of Spacecraft Smoke Detector Performance in the Low-Gravity Environment", "https://doi.org/10.1016/j.firesaf.2018.04.004", "doi"),
  S("B14", "Fortenberry et al. 2023", "The Influence of Smoke Particle Properties and Cabin Characteristics on Smoke Detection in Lunar Gravity", "https://ntrs.nasa.gov/citations/20230013826", "ntrs"),
  S("B15", "Urban et al. 2007", "Particle and Smoke Detection on ISS for Next Generation Smoke Detectors (DAFT)", "https://ntrs.nasa.gov/citations/20070031686", "ntrs"),
  S("B16", "Rodriguez et al. 2012", "Development of the ISS Fine Water Mist Portable Fire Extinguisher", "https://ntrs.nasa.gov/citations/20120018019", "ntrs"),
  S("B17", "Ruff et al. 2004", "Evaluation of CO2, N2 and He as Fire Suppression Agents in Microgravity", "https://ntrs.nasa.gov/citations/20040161262", "ntrs"),
  S("B18", "Abbud-Madrid et al. 2003", "The Water-Mist Fire Suppression Experiment (Mist): Preliminary Results from STS-107", "https://ntrs.nasa.gov/citations/20040053582", "ntrs"),
  S("B19", "Thomsen et al. 2017", "Flame spread limits (LOC) of fire resistant fabrics", "https://doi.org/10.1016/j.firesaf.2017.03.072", "doi"),
  S("B20", "Abney 2026", "Flammability Testing Configuration and Approach of Barrier Material Assemblies (NESC TB 26-03)", "https://ntrs.nasa.gov/citations/20260001542", "ntrs"),
  S("B21", "JSC-29353B", "Flammability Configuration Analysis for Spacecraft Applications (2014)", "https://standards.nasa.gov/sites/default/files/standards/JSC/B/0/JSC-29353B.pdf", "standard"),
  S("B22", "OCHMO-TB-008", "Fire Protection — NASA-STD-3001 Technical Brief (Rev A, 2023)", "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf", "standard"),
  S("PSI25", "PSI-25 · BASS-II", "Burning and Suppression of Solids II — NASA PSI (DOI 10.60555/4qc4-de67)", "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25", "psi"),
  S("PSI69", "PSI-69 · FLEX", "Flame Extinguishment Experiment — NASA PSI", "https://psi.nasa.gov/physci/repo/data/investigations/PSI-69", "psi"),
  S("PSI", "NASA PSI", "Physical Sciences Informatics — combustion investigations", "https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation", "psi"),
  S("FLEX15", "Dietrich et al. 2015", "Detailed Results from the Flame Extinguishment Experiment (FLEX)", "https://ntrs.nasa.gov/citations/20150023456", "ntrs"),
  S("SAF45", "Urban et al. 2021", "Saffire IV–V results", "https://ntrs.nasa.gov/citations/20210011521", "ntrs"),
  S("LUCI", "Ferkul et al. 2025", "Lunar Combustion Investigation (LUCI)", "https://ntrs.nasa.gov/citations/20250010653", "ntrs"),
  S("MOON21", "Fire on the Moon 2021", "Lunar-gravity flammability hypothesis (NASA Glenn)", "https://ntrs.nasa.gov/citations/20210020516", "ntrs"),
  S("SMAC", "Langford 2024", "Spacecraft Maximum Allowable Concentrations, JSC 20584 rev. C", "https://ntrs.nasa.gov/citations/20240007713", "ntrs"),
  S("DET16", "Meyer 2016", "Spacecraft fire detection at NASA Glenn", "https://ntrs.nasa.gov/citations/20170007283", "ntrs"),
  S("SOFIE", "Ferkul et al. 2020", "Solid Fuel Ignition and Extinction (SoFIE) on the ISS", "https://ntrs.nasa.gov/citations/20200000361", "ntrs"),
  S("ACME22", "ACME 2017–2022", "Advanced Combustion via Microgravity Experiments: summary", "https://ntrs.nasa.gov/citations/20220015583", "ntrs"),
  S("OLSON24", "Olson et al. 2024", "Partial gravity flammability of cast PMMA rods", "https://doi.org/10.1016/j.firesaf.2024.104267", "doi"),
  S("OLSON17", "Olson & Ferkul 2017", "Microgravity flammability boundary for PMMA rods in axial stagnation flow", "https://doi.org/10.1016/j.combustflame.2017.03.001", "doi"),
  S("LIV26", "Liveretou et al. 2026", "Flame extinction of thermally thick PMMA: Earth vs. ISS", "https://doi.org/10.1016/j.firesaf.2025.104625", "doi"),
  S("RIV26", "Rivera et al. 2026", "Opposed flame spread limit over PMMA rods", "https://doi.org/10.1016/j.firesaf.2026.104719", "doi"),
  S("THOM19", "Thomsen et al. 2019", "Flame spread limits of externally heated Nomex", "https://doi.org/10.1016/j.proci.2018.05.055", "doi"),
  S("BRE21", "Dehghani et al. 2021", "Burning in microgravity: Burning Rate Emulator (BRE)", "https://doi.org/10.1016/j.combustflame.2021.01.035", "doi"),
  S("URB19", "Urban et al. 2019", "Flame spread: Effects of microgravity and scale", "https://doi.org/10.1016/j.combustflame.2018.10.012", "doi"),
  S("GUIDE15", "NASA 2015", "A Researcher's Guide to: Combustion Science", "https://www.nasa.gov/sites/default/files/atoms/files/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf", "nasa"),
  S("GLENN", "NASA Glenn", "Combustion Science — NASA Glenn Research Center", "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science", "nasa"),
  S("ISSFIRE", "NASA ISS Research", "Studying Combustion and Fire Safety on the ISS", "https://www.nasa.gov/missions/station/iss-research/studying-combustion-and-fire-safety/", "nasa"),
  S("FM2WEB", "NASA Glenn · FM2", "Flammability of Materials on the Moon (FM2)", "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/", "nasa"),
  S("FWM", "NASA TechPort 12180", "Fine Water Mist Portable Fire Extinguisher", "https://techport.nasa.gov/projects/12180", "nasa"),
  S("CHALLENGE", "Space Apps 2026", "Flame in Freefall — official challenge statement", "https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/", "nasa"),
  S("AP1", "NASA History", "Apollo 1", "https://www.nasa.gov/?p=96288", "history"),
  S("AP13", "NSSDC", "Apollo 13 accident", "https://nssdc.gsfc.nasa.gov/planetary/lunar/ap13acc.html", "history"),
  S("MIR97", "NASA APPEL", "Mir 1997 fire: oxygen generators", "https://appel.nasa.gov/?p=279500", "history"),
  S("SP-TANK", "NASA Spinoff 2019", "Composite air tanks for firefighters", "https://spinoff.nasa.gov/node/11031", "spinoff"),
  S("SP-PBI", "NASA Spinoff", "PBI textiles for firefighter gear", "https://spinoff.nasa.gov/node/10564", "spinoff"),
  S("SP-DET", "NASA Spinoff 1978", "Incipient fire detector", "https://spinoff.nasa.gov/node/9407", "spinoff"),
  S("SP-FIRESCAPE", "NASA Spinoff 1997", "FIRESCAPE infrared flame imaging", "https://spinoff.nasa.gov/node/10045", "spinoff"),
  S("SP-MIST", "NASA Spinoff", "Leak-free valve from water-mist extinguisher work", "https://spinoff.nasa.gov/node/11065", "spinoff"),
  S("N3D", "NASA 3D Resources", "NASA-3D-Resources: ISS (IGOAL), Space Exploration Vehicle, Habitat Demonstration Unit, Saturn V, Mobile Launcher, Astronaut", "https://github.com/nasa/NASA-3D-Resources", "asset"),
  S("SVS-EARTH", "NASA SVS 2915", "Blue Marble: Land Surface, Ocean Color and Sea Ice", "https://svs.gsfc.nasa.gov/2915", "asset"),
  S("SVS-MOON", "NASA SVS 4720", "CGI Moon Kit (LRO color map)", "https://svs.gsfc.nasa.gov/4720", "asset"),
];

const INDEX = new Map(SOURCES.map((s) => [s.id, s]));

/** Devuelve la fuente con esa clave (o undefined si no existe). */
export const getSource = (id: string): Source | undefined => INDEX.get(id);
