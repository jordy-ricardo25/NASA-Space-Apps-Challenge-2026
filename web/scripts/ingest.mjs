/**
 * Ingesta del corpus del asistente Flamey en Gemini File Search.
 *
 * Uso (desde web/):  npm run ingest
 *
 * - Lee los documentos de ./conocimiento (carpeta ignorada por git).
 * - Si FILE_SEARCH_STORE está vacío en .env.local, crea el almacén UNA vez y
 *   escribe su nombre en .env.local. Si ya tiene valor, reutiliza ese almacén:
 *   nunca crea otro.
 * - Omite los documentos que ya están en el almacén, así que se puede volver a
 *   ejecutar para añadir archivos nuevos (por ejemplo, el documento final).
 * - Al terminar dice cuántos archivos quedaron bien y cuántos mal, y guarda el
 *   detalle en conocimiento/ingesta.json.
 */
import { GoogleGenAI } from "@google/genai";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIR = "./conocimiento";
const ENV_FILE = ".env.local";
const STORE_LABEL = "flame-in-freefall-conocimiento";
const MAX_BYTES = 100 * 1024 * 1024;
const TYPES = {
  ".pdf": "application/pdf",
  ".md": "text/markdown",
  ".txt": "text/plain",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("Falta GEMINI_API_KEY en .env.local");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: key });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Escribe FILE_SEARCH_STORE=<nombre> en .env.local (sin tocar el resto). */
function saveStoreName(name) {
  const env = readFileSync(ENV_FILE, "utf8");
  const next = /^FILE_SEARCH_STORE=.*$/m.test(env) ? env.replace(/^FILE_SEARCH_STORE=.*$/m, `FILE_SEARCH_STORE=${name}`) : `${env.trimEnd()}\nFILE_SEARCH_STORE=${name}\n`;
  writeFileSync(ENV_FILE, next);
}

/** Nombres de los documentos que ya están en el almacén. */
async function existingDocs(store) {
  const names = new Set();
  try {
    const pager = await ai.fileSearchStores.documents.list({ parent: store, config: { pageSize: 20 } });
    for await (const doc of pager) if (doc.displayName) names.add(doc.displayName);
  } catch (e) {
    console.warn("No se pudo listar el almacén (se intentará subir todo):", e.message);
  }
  return names;
}

async function main() {
  let store = (process.env.FILE_SEARCH_STORE ?? "").trim();
  if (store) {
    console.log(`Almacén existente: ${store} (no se crea otro)`);
  } else {
    const created = await ai.fileSearchStores.create({ config: { displayName: STORE_LABEL } });
    store = created.name;
    saveStoreName(store);
    console.log(`Almacén creado: ${store}\nGuardado en ${ENV_FILE} como FILE_SEARCH_STORE.`);
  }

  const files = readdirSync(DIR)
    .filter((f) => TYPES[path.extname(f).toLowerCase()])
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
  const already = await existingDocs(store);
  console.log(`\n${files.length} documentos en ${DIR}; ${already.size} ya estaban en el almacén.\n`);

  const report = { store, date: new Date().toISOString(), ok: [], skipped: [], failed: [] };
  for (const file of files) {
    const full = path.join(DIR, file);
    const size = statSync(full).size;
    if (already.has(file)) {
      report.skipped.push(file);
      console.log(`•  ya estaba   ${file}`);
      continue;
    }
    if (size > MAX_BYTES) {
      report.failed.push({ file, error: "supera 100 MB" });
      console.log(`✗  falló       ${file} — supera 100 MB`);
      continue;
    }
    try {
      let op = await ai.fileSearchStores.uploadToFileSearchStore({
        file: full,
        fileSearchStoreName: store,
        config: { displayName: file, mimeType: TYPES[path.extname(file).toLowerCase()] },
      });
      const started = Date.now();
      while (!op.done) {
        if (Date.now() - started > 10 * 60 * 1000) throw new Error("la indexación tardó más de 10 minutos");
        await sleep(4000);
        op = await ai.operations.get({ operation: op });
      }
      if (op.error) throw new Error(JSON.stringify(op.error));
      report.ok.push(file);
      console.log(`✓  subido      ${file} (${(size / 1048576).toFixed(1)} MB)`);
    } catch (e) {
      report.failed.push({ file, error: String(e.message ?? e).slice(0, 300) });
      console.log(`✗  falló       ${file} — ${String(e.message ?? e).slice(0, 200)}`);
    }
  }

  writeFileSync(path.join(DIR, "ingesta.json"), JSON.stringify(report, null, 2));
  console.log(`\nResultado: ${report.ok.length} bien · ${report.failed.length} mal · ${report.skipped.length} ya estaban.`);
  console.log(`Almacén: ${store}`);
  if (report.failed.length) process.exitCode = 2;
}

main().catch((e) => {
  console.error("La ingesta no pudo completarse:", e.message ?? e);
  process.exit(1);
});
