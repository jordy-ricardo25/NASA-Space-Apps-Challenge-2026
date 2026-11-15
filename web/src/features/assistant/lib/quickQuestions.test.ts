import { describe, expect, it } from "vitest";
import { featuredQuestions, findPrepared } from "./faq";
import { quickQuestions } from "./quickQuestions";

describe("preguntas de un toque", () => {
  it("sin contexto ofrece las preguntas preparadas", () => {
    const q = quickQuestions({ finding: false, scenario: null }, "es", 3);
    expect(q).toEqual(featuredQuestions("es").slice(0, 3));
    expect(q.every((x) => findPrepared(x))).toBe(true);
  });

  it("con un escenario pregunta primero por el material en ese lugar", () => {
    const es = quickQuestions({ finding: false, scenario: { material: "PMMA", place: "base lunar" } }, "es");
    expect(es[0]).toBe("¿Arde PMMA en base lunar?");
    const en = quickQuestions({ finding: false, scenario: { material: "PMMA", place: "lunar base" } }, "en");
    expect(en[0]).toBe("Does PMMA burn in the lunar base?");
  });

  it("con un hallazgo fijado sus preguntas van delante y no chocan con las preparadas", () => {
    const q = quickQuestions({ finding: true, scenario: { material: "PMMA", place: "base lunar" } }, "es", 4);
    expect(q).toHaveLength(4);
    expect(q[3]).toBe("¿Arde PMMA en base lunar?");
    // Si coincidieran con una pregunta preparada, se respondería lo general y no el hallazgo.
    expect(q.slice(0, 3).some((x) => findPrepared(x))).toBe(false);
  });

  it("respeta el límite y no repite", () => {
    const q = quickQuestions({ finding: true, scenario: null }, "en", 10);
    expect(new Set(q).size).toBe(q.length);
    expect(quickQuestions({ finding: true, scenario: null }, "en", 2)).toHaveLength(2);
  });
});
