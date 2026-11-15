import { describe, expect, it } from "vitest";
import type { FindingPack } from "@/features/psi/server/psi.service";
import { availableTopics, detectTopic, parseBurn, pendingTopics, topicAnswer } from "./findingTopics";

const PACK: FindingPack = {
  live: true,
  kernel: "1.7.0",
  brief: null,
  environment: { key: "lunar", label: "Base lunar", gravity_g: 0.165, o2_fraction: 0.32, pressure_atm: 0.558, egress_s: 300, diluent: "O2/N2" },
  finding: {
    key: "bass2::PMMA::opposed",
    experiment: "BASS-II",
    facility: "MSG",
    material: "PMMA",
    flame_mode: "opposed",
    o2_min: 0.17,
    o2_max: 0.21,
    pressure_atm: 1,
    observations: 129,
    quality: 0.95,
    rpi: 62,
    band: "high",
    relevance: "direct",
    sources: ["psi_025_bass_2.csv"],
    narrative: "PMMA (rod) ensayado a 19-19 % O2 y 1.00 atm. En Base lunar la fracción efectiva es 32 % (+11 puntos sobre el techo ensayado) a 0.56 atm. Proyección: propagación de 0.72 mm/s.",
  },
  factors: [
    { name: "o2_margin", value: 60, weight: 0.16, contribution: 9.6 },
    { name: "gravity_extrapolation", value: 70, weight: 0.13, contribution: 9.1 },
    { name: "material_fit", value: 68, weight: 0.11, contribution: 7.48 },
    { name: "soot_load", value: 20, weight: 0.1, contribution: 2 },
  ],
  evidence: [{ file: "psi_025_bass_2.csv", row: 7, quality: 0.9 }],
};

describe("temas de un hallazgo de PSI", () => {
  it("reconoce el tema de la pregunta en español e inglés", () => {
    expect(detectTopic("¿Por qué ese riesgo?")).toBe("why");
    expect(detectTopic("¿Y en el traje EVA?")).toBe("suit");
    expect(detectTopic("¿Cómo se apaga una llama así?")).toBe("extinguish");
    expect(detectTopic("¿Qué tan rápido avanza?")).toBe("speed");
    expect(detectTopic("How was it tested?")).toBe("conditions");
    expect(detectTopic("Is the data reliable?")).toBe("evidence");
    expect(detectTopic("¿Qué material no arde aquí?")).toBe("replace");
    expect(detectTopic("¿Qué falta por verificar?")).toBe("pending");
    expect(detectTopic("Explícame el hallazgo BASS-II · PMMA y qué significa en este ambiente.")).toBeNull();
  });

  it("lee del texto del backend si la velocidad se midió o se proyectó", () => {
    expect(parseBurn("… Medición directa en µg: 2.50 mm/s.")).toEqual({ kind: "measured", rate: 2.5 });
    expect(parseBurn("… Medición directa en µg: la muestra no sostuvo propagación.")).toEqual({ kind: "measured-none" });
    expect(parseBurn("… Proyección: propagación de 1.15 mm/s.")).toEqual({ kind: "projected", rate: 1.15 });
    expect(parseBurn("… Proyección: extinción, por debajo del límite de 22 % O2.")).toEqual({ kind: "quenched", limit: 22 });
    expect(parseBurn(undefined)).toBeNull();
  });

  it("explica el riesgo con los tres factores que más aportan y lo que mide cada uno", () => {
    const a = topicAnswer("why", PACK, "es");
    expect(a?.text).toContain("62 de 100 (alto)");
    expect(a?.text).toContain("(+9,6)");
    expect(a?.text).toContain("supera el mínimo que el material necesita");
    expect(a?.text).not.toContain("carga de hollín");
  });

  it("distingue una proyección de una medición y avisa de lo que queda por verificar", () => {
    expect(topicAnswer("speed", PACK, "es")?.text).toContain("0,72 mm/s, unos 4,3 cm por minuto. Es una proyección, no una medición.");
    expect(topicAnswer("conditions", PACK, "es")?.text).toContain("de 17 % a 21 % de O₂ a una presión mediana de 1,00 atm");
    expect(topicAnswer("conditions", PACK, "en")?.text).toContain("exceeds the highest oxygen tested");
    const pending = topicAnswer("pending", PACK, "es")?.text ?? "";
    expect(pending).toContain("gravedad parcial");
    expect(pending).toContain("supera el máximo ensayado (21 %)");
  });

  it("compara con el traje y usa la escalera de oxígeno del backend", () => {
    const suit: FindingPack = { ...PACK, environment: { key: "eva", label: "Traje EVA", gravity_g: 0, o2_fraction: 1, pressure_atm: 0.293 }, finding: { ...PACK.finding, rpi: 66 } };
    expect(topicAnswer("suit", PACK, "es", { suit })?.text).toContain("En el traje el índice es 4 puntos más alto.");
    expect(topicAnswer("suit", PACK, "es")).toBeNull();
    const ladder = { o2: 0.4, sustains: ["PMMA", "SIBAL"], quenches: [] };
    expect(topicAnswer("replace", PACK, "es", { ladder })?.text).toContain("los 2 materiales evaluados sostienen la llama");
    expect(topicAnswer("extinguish", PACK, "es", { suppression: "Ficha." })?.text).toBe("Ficha. En Base lunar el backend da a la tripulación 300 segundos para evacuar.");
  });

  it("ofrece solo los temas con datos que aún no se han preguntado", () => {
    expect(availableTopics({ ...PACK, environment: { ...PACK.environment, key: "eva" } })).not.toContain("suit");
    expect(pendingTopics(PACK, new Set(["why", "suit"])).slice(0, 2)).toEqual(["speed", "conditions"]);
    expect(topicAnswer("evidence", { ...PACK, finding: { ...PACK.finding, observations: 1 } }, "es")?.text).toContain("guarda 1 observación,");
    // Preguntas que antes caían en el tema equivocado.
    expect(detectTopic("¿Qué material se probó?")).toBe("conditions");
    expect(detectTopic("¿De dónde sale ese riesgo?")).toBe("why");
  });
});
