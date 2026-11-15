/**
 * Guarda una copia de respaldo de los datos del backend (emberwatch API):
 *
 *   npm run psi-snapshot          (usa API_BASE_URL de .env.local)
 *
 * La plataforma pide estos datos en vivo; si el backend no responde, usa esta
 * copia (src/features/psi/server/snapshot.json) para que ninguna pantalla se
 * quede sin datos. Solo se guardan los campos que la interfaz muestra.
 */
import { writeFileSync } from "node:fs";

const BASE = (process.env.API_BASE_URL ?? "").trim().replace(/\/+$/, "");
if (!BASE) {
  console.error("Falta API_BASE_URL en .env.local");
  process.exit(1);
}
const get = async (path) => {
  const res = await fetch(BASE + path, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
};

const meta = await get("/api/meta");
const gaps = await get("/api/gaps");
const findings = {};
for (const env of Object.keys(meta.environments)) {
  const list = await get(`/api/findings?environment=${env}&limit=100`);
  findings[env] = list.map((f) => ({
    key: f.key,
    experiment: f.experiment,
    facility: f.facility,
    material: f.material,
    flame_mode: f.flame_mode,
    o2_min: f.o2_min,
    o2_max: f.o2_max,
    observations: f.observations,
    quality: f.quality,
    rpi: f.rpi,
    band: f.band,
    relevance: f.relevance,
    sources: f.sources,
  }));
  console.log(`✓ ${env}: ${list.length} hallazgos`);
}

const snapshot = {
  taken: new Date().toISOString(),
  kernel_version: meta.kernel_version,
  environments: Object.fromEntries(Object.entries(meta.environments).map(([k, e]) => [k, { key: e.key, label: e.label, gravity_g: e.gravity_g, o2_fraction: e.o2_fraction, pressure_atm: e.pressure_atm }])),
  bands: meta.bands,
  findings,
  gaps,
};
writeFileSync("src/features/psi/server/snapshot.json", `${JSON.stringify(snapshot)}\n`);
console.log(`Copia guardada: kernel ${meta.kernel_version}, ${Object.values(findings).flat().length} filas.`);
