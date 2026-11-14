/**
 * Radar tecnológico (objetivo O3): evidencia → hallazgo → brecha → tecnología,
 * organizado por los destinos que pide el reto (protocolos, supresión,
 * selección de materiales) más detección. Cada nodo lleva su fuente
 * (documento maestro §9.2, §10, §17).
 */
import { l, type L } from "./i18n";
import type { EvidenceLevel } from "@/shared/types/api";

export type Stage = "evidence" | "finding" | "gap" | "technology";

export const STAGE_LABEL: Record<Stage, L> = {
  evidence: l("Evidencia", "Evidence"),
  finding: l("Hallazgo", "Finding"),
  gap: l("Brecha", "Gap"),
  technology: l("Tecnología", "Technology"),
};

export interface RadarNode {
  title: L;
  text: L;
  sources: string[];
  evidence?: EvidenceLevel;
}

export interface RadarLane {
  id: string;
  name: L;
  nodes: Record<Stage, RadarNode>;
}

export const RADAR: RadarLane[] = [
  {
    id: "protocols",
    name: l("Protocolos de ensayo", "Test protocols"),
    nodes: {
      evidence: { title: l("BASS-II y Saffire", "BASS-II and Saffire"), text: l("Con flujo bajo en µg hay materiales que arden con menos O₂ que en la Tierra.", "At low flow in µg some materials burn with less O₂ than on Earth."), sources: ["PSI25", "B10"], evidence: "A" },
      finding: { title: l("El ensayo en 1 g podría no ser conservador", "The 1 g test may not be conservative"), text: l("El límite depende del flujo, la presión y la gravedad; un MOC de 15 cm no equivale a un límite de propagación.", "The limit depends on flow, pressure and gravity; a 15 cm MOC is not a flame-spread limit."), sources: ["B9", "ISSFIRE"] },
      gap: { title: l("Gravedad parcial sin datos en PSI", "Partial gravity: no PSI data"), text: l("La gravedad lunar podría ser el peor caso: mínimo de O₂ cerca de 0,165 g en PMMA.", "Lunar gravity could be the worst case: O₂ minimum near 0.165 g for PMMA."), sources: ["B7", "OLSON24"], evidence: "NONE" },
      technology: { title: l("Protocolos para atmósferas de exploración", "Protocols for exploration atmospheres"), text: l("Factores de compensación lunar por material (0,3–2,3 puntos de O₂) y validación en superficie con FM2.", "Per-material lunar compensation factors (0.3–2.3 O₂ points) and surface validation with FM2."), sources: ["B6", "B7"], evidence: "D" },
    },
  },
  {
    id: "suppression",
    name: l("Diseño de supresión", "Suppression design"),
    nodes: {
      evidence: { title: l("FLEX, diluyentes y Mist", "FLEX, diluents and Mist"), text: l("Gotas en CO₂ y He; PMMA con CO₂, N₂ y He a 1–10 cm/s; niebla de agua en STS-107.", "Droplets in CO₂ and He; PMMA with CO₂, N₂ and He at 1–10 cm/s; water mist on STS-107."), sources: ["PSI69", "B17", "B18"], evidence: "A" },
      finding: { title: l("El agente necesario crece con el flujo", "Required agent grows with flow"), text: l("A ~10 cm/s se parece al de 1 g; el chorro del extintor induce flujo y las llamas frías pueden persistir.", "At ~10 cm/s it resembles the 1 g value; the extinguisher jet induces flow and cool flames can persist."), sources: ["B17", "B3"] },
      gap: { title: l("Dosis a escala de cabina", "Cabin-scale dose"), text: l("Una concentración de quemador no es una dosis; faltan datos con O₂ alto y gravedad parcial.", "A burner concentration is not a dose; data at high O₂ and partial gravity are missing."), sources: ["B17"], evidence: "NONE" },
      technology: { title: l("Extintor de niebla de agua fina", "Fine water mist extinguisher"), text: l("Certificado para reemplazar a los de CO₂ en la ISS: enfría sin añadir CO₂ a la cabina.", "Certified to replace CO₂ units on the ISS: it cools without adding CO₂ to the cabin."), sources: ["B16", "FWM"], evidence: "B" },
    },
  },
  {
    id: "materials",
    name: l("Selección de materiales", "Materials screening"),
    nodes: {
      evidence: { title: l("Saffire a escala de nave", "Vehicle-scale Saffire"), text: l("Telas y PMMA de hasta 94 cm a 22–31 % de O₂ y 54–100 kPa; Nomex entre 40 y 100 kPa.", "Fabrics and PMMA up to 94 cm at 22–31% O₂ and 54–100 kPa; Nomex between 40 and 100 kPa."), sources: ["B2", "B10", "B19"], evidence: "A" },
      finding: { title: l("Aceptado en aire ≠ aceptado al 34 %", "Accepted in air ≠ accepted at 34%"), text: l("Nomex necesita ≈24 % de O₂ a 100 kPa: no propaga en la ISS, pero supera su límite en la atmósfera de exploración.", "Nomex needs ≈24% O₂ at 100 kPa: it does not spread on the ISS but exceeds its limit in the exploration atmosphere."), sources: ["B19", "B10"] },
      gap: { title: l("Pocos ensayos grandes y con O₂ alto", "Few large, high-O₂ tests"), text: l("El comportamiento depende de la escala; los ensayos a tamaño real son escasos.", "Behaviour depends on scale; full-size tests are scarce."), sources: ["B2", "URB19"], evidence: "B" },
      technology: { title: l("Selección por margen y barreras", "Margin-based screening and barriers"), text: l("Elegir cada material por su margen en el ambiente real y proteger los inflamables con conjuntos de barrera.", "Choose each material by its margin in the real environment and protect flammable ones with barrier assemblies."), sources: ["B20", "B21"], evidence: "B" },
    },
  },
  {
    id: "detection",
    name: l("Detección", "Detection"),
    nodes: {
      evidence: { title: l("SAME, SAME-2 y DAFT", "SAME, SAME-2 and DAFT"), text: l("Tamaño y forma del humo de Teflon, Kapton, algodón, silicona y Pyrell en µg.", "Smoke size and shape for Teflon, Kapton, cotton, silicone and Pyrell in µg."), sources: ["B11", "B13", "B15"], evidence: "A" },
      finding: { title: l("Un solo detector no basta", "A single detector is not enough"), text: l("El detector de la ISS falla con frecuencia con el humo fino de Teflon y Kapton.", "The ISS detector frequently misses fine Teflon and Kapton smoke."), sources: ["B13", "B12"] },
      gap: { title: l("Detección con gravedad lunar y polvo", "Detection with lunar gravity and dust"), text: l("La ventilación dispersa la capa de humo del techo; el polvo suspendido puede dar falsas alarmas.", "Ventilation disperses the ceiling smoke layer; suspended dust can trigger false alarms."), sources: ["B14", "B15"], evidence: "C" },
      technology: { title: l("Detección multisensor", "Multi-sensor detection"), text: l("Combinar partículas finas y gruesas con gases (CO) para avisar en la fase de pirólisis.", "Combine fine and coarse particles with gases (CO) to warn at the pyrolysis stage."), sources: ["B15", "B22"], evidence: "B" },
    },
  },
];

export interface GapItem {
  name: L;
  status: L;
  closes: L;
  evidence: EvidenceLevel;
  sources: string[];
}

/** Mapa de brechas: cada una con la misión que la cerrará. */
export const GAPS: GapItem[] = [
  { name: l("Gravedad parcial", "Partial gravity"), status: l("Sin datos en PSI; vuelos parabólicos y centrífugas", "No PSI data; parabolic flights and centrifuges"), closes: l("LUCI (2025) · FM2 en la superficie lunar", "LUCI (2025) · FM2 on the lunar surface"), evidence: "D", sources: ["LUCI", "B7"] },
  { name: l("Oxígeno alto (30–34 %)", "High oxygen (30–34%)"), status: l("Saffire VI hasta 31 %; CFI-G hasta 85 % con gases", "Saffire VI up to 31%; CFI-G up to 85% with gases"), closes: l("SoFIE (10–40 %) · FM2 a 34 % y 56,5 kPa", "SoFIE (10–40%) · FM2 at 34% and 56.5 kPa"), evidence: "B", sources: ["B2", "SOFIE", "B7"] },
  { name: l("Escala real", "Full scale"), status: l("Pocos ensayos grandes; solo microgravedad", "Few large tests; microgravity only"), closes: l("Serie Saffire y sus modelos", "Saffire series and its models"), evidence: "B", sources: ["B2", "B10"] },
  { name: l("Humo con polvo lunar", "Smoke with lunar dust"), status: l("Sin datos; DAFT midió polvo de referencia", "No data; DAFT measured reference dust"), closes: l("Por definir", "To be defined"), evidence: "NONE", sources: ["B15", "B14"] },
];
