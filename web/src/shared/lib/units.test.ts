import { describe, expect, it } from "vitest";
import { rankInvestigations } from "@/features/investigations/lib/ranking";
import { kpaToPsi, o2EnrichmentPct, ppO2, psiToKpa } from "./units";

// Valores de referencia del documento maestro (§4.3 y §12.8).
describe("unidades y atmósferas", () => {
  it("convierte psi ↔ kPa", () => {
    expect(psiToKpa(14.7)).toBeCloseTo(101.35, 1);
    expect(psiToKpa(8.2)).toBeCloseTo(56.5, 1);
    expect(kpaToPsi(70.3)).toBeCloseTo(10.2, 1);
  });

  it("calcula la presión parcial de oxígeno de cada ambiente", () => {
    expect(ppO2(21, 101.3)).toBeCloseTo(21.3, 1); // ISS
    expect(ppO2(30, 70.3)).toBeCloseTo(21.1, 1); // rover lunar
    expect(ppO2(34, 56.5)).toBeCloseTo(19.2, 1); // atmósfera de exploración
  });

  it("respirar igual no es arder igual: 34 % de O₂ es ~63 % más fracción que el aire", () => {
    expect(o2EnrichmentPct(34)).toBeGreaterThan(60);
    expect(o2EnrichmentPct(30)).toBeGreaterThan(40);
  });
});

describe("ranking de investigaciones (O1)", () => {
  it("ordena de mayor a menor puntaje y acota el puntaje a 0–1", () => {
    const ranked = rankInvestigations({ o2: 34, p: 56.5, g: 0.165 });
    expect(ranked.length).toBeGreaterThan(5);
    for (let i = 1; i < ranked.length; i++) expect(ranked[i - 1]!.score).toBeGreaterThanOrEqual(ranked[i]!.score);
    for (const r of ranked) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it("para la base lunar prioriza investigaciones de gravedad parcial", () => {
    const top = rankInvestigations({ o2: 34, p: 56.5, g: 0.165 }).slice(0, 4).map((r) => r.inv.regime);
    expect(top).toContain("partial");
  });
});
