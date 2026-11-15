/**
 * Genera el documento del proyecto para el corpus del asistente Flamey.
 *
 * Uso (desde web/):  npm run knowledge-doc
 *
 * - Empaqueta src/features/assistant/server/knowledgeDoc.ts (con el alias @/)
 *   y lo ejecuta: el texto sale del contenido verificado de la plataforma.
 * - Escribe conocimiento/Documento del proyecto Flame in Freefall.md.
 * - Después, "npm run ingest" lo sube al almacén existente. Si el documento ya
 *   estaba en el almacén, hay que borrarlo allí antes para que se reemplace:
 *   la ingesta omite los nombres que ya existen.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { rolldown } from "rolldown";

const OUT = "conocimiento/Documento del proyecto Flame in Freefall.md";
const TMP = path.resolve(".next/knowledge-doc");
const bundleFile = path.join(TMP, "knowledgeDoc.mjs");

mkdirSync(TMP, { recursive: true });
const bundle = await rolldown({
  input: "src/features/assistant/server/knowledgeDoc.ts",
  platform: "node",
  resolve: { alias: { "@": path.resolve("src") } },
  logLevel: "warn",
});
await bundle.write({ file: bundleFile, format: "esm" });
await bundle.close();

const { buildKnowledgeDoc } = await import(pathToFileURL(bundleFile).href);
const doc = buildKnowledgeDoc(readFileSync("docs/documentacion-proyecto.md", "utf8"));
mkdirSync("conocimiento", { recursive: true });
writeFileSync(OUT, doc);
rmSync(TMP, { recursive: true, force: true });
console.log(`Documento generado: ${OUT} (${(doc.length / 1024).toFixed(0)} KB, ${doc.split("\n").length} líneas)`);
