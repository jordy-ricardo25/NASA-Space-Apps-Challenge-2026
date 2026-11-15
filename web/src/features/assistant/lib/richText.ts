/**
 * Formato mínimo de las respuestas del asistente. El modelo de lenguaje a veces
 * escribe negritas, viñetas o títulos con marcas de Markdown: aquí se
 * convierten en bloques para que la interfaz no muestre asteriscos sueltos.
 * No interpreta HTML ni enlaces: el texto siempre se pinta como texto.
 */

export interface RichPart {
  text: string;
  bold: boolean;
}

export interface RichBlock {
  kind: "paragraph" | "bullet" | "heading";
  parts: RichPart[];
}

/** Separa las negritas (`**texto**`) y limpia las marcas de énfasis que queden. */
function inline(line: string): RichPart[] {
  const parts: RichPart[] = [];
  for (const piece of line.split(/(\*\*[^*]+\*\*)/g)) {
    if (!piece) continue;
    const bold = piece.length > 4 && piece.startsWith("**") && piece.endsWith("**");
    // Cursivas, código y asteriscos sin cerrar (texto a medio llegar): queda solo el texto.
    const text = (bold ? piece.slice(2, -2) : piece).replace(/\*\*|__|`/g, "").replace(/(^|\s)[*_]([^*_\s][^*_]*)[*_](?=\s|[.,;:!?)]|$)/g, "$1$2");
    if (text) parts.push({ text, bold });
  }
  return parts;
}

/** Convierte una respuesta en párrafos, viñetas y títulos. */
export function richText(text: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const bullet = /^(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    const kind: RichBlock["kind"] = heading ? "heading" : bullet ? "bullet" : "paragraph";
    const parts = inline(heading?.[1] ?? bullet?.[1] ?? line);
    if (parts.length) blocks.push({ kind, parts });
  }
  return blocks;
}
