import { describe, expect, it } from "vitest";
import { richText } from "./richText";

const flat = (text: string): string[] => richText(text).map((b) => `${b.kind}:${b.parts.map((p) => (p.bold ? `[${p.text}]` : p.text)).join("")}`);

describe("formato de las respuestas", () => {
  it("un texto sin marcas queda igual, párrafo a párrafo", () => {
    expect(flat("Primera frase.\n\nSegunda frase.")).toEqual(["paragraph:Primera frase.", "paragraph:Segunda frase."]);
  });

  it("reconoce negritas, viñetas, listas numeradas y títulos", () => {
    expect(flat("## Resumen\n- **Dictamen:** arde\n* otra\n1. primera\nCierre")).toEqual(["heading:Resumen", "bullet:[Dictamen:] arde", "bullet:otra", "bullet:primera", "paragraph:Cierre"]);
  });

  it("no deja asteriscos sueltos ni marcas de código", () => {
    const out = flat("Usa *cursiva* y `codigo` con **negrita sin cerrar").join(" ");
    expect(out).not.toMatch(/[*`]/);
    expect(out).toContain("cursiva");
    expect(out).toContain("codigo");
  });

  it("conserva los signos de las cifras", () => {
    expect(flat("Margen de -2,5 a +3,1 puntos (2 * 3 = 6).")).toEqual(["paragraph:Margen de -2,5 a +3,1 puntos (2 * 3 = 6)."]);
  });
});
