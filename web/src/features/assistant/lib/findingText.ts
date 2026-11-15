/**
 * Texto del asistente sobre un hallazgo de NASA PSI elegido en la Guía.
 * Dos salidas a partir del mismo paquete del backend:
 *  - `findingBlock`: el contexto que recibe el modelo de lenguaje.
 *  - `findingSummary`: la respuesta sin modelo (sin clave, sin red o si el
 *    modelo se abstiene). Solo ordena cifras del paquete: no añade
 *    recomendaciones ni números propios.
 */
import { l, type L, type Lang } from "@/content/i18n";
import type { FindingPack } from "@/features/psi/server/psi.service";

/** Nombre legible de cada factor del índice RPI (api/app/engine/kernel.py). */
const FACTOR: Record<string, L> = {
  o2_margin: l("margen de oxígeno sobre el límite del material", "oxygen margin above the material's limit"),
  o2_extrapolation: l("oxígeno por encima de lo ensayado", "oxygen above the tested range"),
  pressure_extrapolation: l("presión distinta de la ensayada", "pressure different from the tested one"),
  gravity_extrapolation: l("gravedad distinta de la ensayada", "gravity different from the tested one"),
  soot_load: l("carga de hollín", "soot load"),
  cool_flame: l("llama fría", "cool flame"),
  evidence_weakness: l("calidad baja de la evidencia", "weak evidence quality"),
  material_fit: l("afinidad del material con el ambiente", "material fit for the environment"),
  egress_window: l("ventana de evacuación", "egress window"),
  measured_sustain: l("combustión sostenida medida", "measured sustained burning"),
  evidence_density: l("cantidad de observaciones", "number of observations"),
};
const BAND: Record<string, L> = { critical: l("crítico", "critical"), high: l("alto", "high"), moderate: l("moderado", "moderate"), low: l("bajo", "low") };
const MODE: Record<string, L> = { opposed: l("contra el flujo", "opposed flow"), concurrent: l("a favor del flujo", "concurrent flow") };
const RELEVANCE: Record<string, L> = {
  direct: l("Su relevancia para este ambiente es directa.", "Its relevance for this environment is direct."),
  indirect: l("Su relevancia para este ambiente es indirecta.", "Its relevance for this environment is indirect."),
};

/** Tope del resumen del backend que se envía al modelo (caracteres). */
const BRIEF_LIMIT = 7000;

const pick = (table: Record<string, L>, key: string | null | undefined, lang: Lang): string => (key ? (table[key]?.[lang] ?? key) : "");

/** Gravedad parcial: PSI no tiene datos directos ahí (regla del asistente). */
const partialGravity = (g: number): boolean => g > 0.02 && g < 0.9;

/**
 * Contexto del hallazgo para el modelo de lenguaje (en inglés, como el resto
 * del prompt). Incluye las instrucciones propias de este tipo de respuesta.
 */
export function findingBlock(pack: FindingPack): string {
  const { finding: f, environment: e } = pack;
  const pct = (x: number | null | undefined): string => (x == null ? "not recorded" : `${(x * 100).toFixed(1)}%`);
  const lines = [
    `PSI finding pinned by the user (NASA PSI records processed by the team's emberwatch backend, kernel ${pack.kernel}). The question is about THIS finding.`,
    `Environment: ${e.label}; gravity ${e.gravity_g} g; oxygen ${(e.o2_fraction * 100).toFixed(0)}%; pressure ${e.pressure_atm.toFixed(2)} atm.`,
    `Finding: ${f.experiment}${f.facility ? ` (${f.facility})` : ""}; material ${f.material ?? "not recorded"}; flame mode ${f.flame_mode ?? "not recorded"}.`,
    `Oxygen tested: ${pct(f.o2_min)} to ${pct(f.o2_max)}. Observations: ${f.observations}.${f.quality != null ? ` Mean data quality: ${(f.quality * 100).toFixed(0)}%.` : ""} Relevance for this environment: ${f.relevance}.`,
    `RPI ${f.rpi} of 100, band ${f.band}. The RPI is the team's own ranking index for this environment, not a NASA figure.`,
  ];
  if (pack.factors.length) lines.push(`RPI factors (score 0-100, points added to the RPI): ${pack.factors.map((x) => `${x.name} ${x.value.toFixed(0)} (+${x.contribution.toFixed(1)})`).join("; ")}.`);
  if (pack.evidence.length) lines.push(`Evidence rows: ${pack.evidence.map((x) => `${x.file} row ${x.row} (quality ${(x.quality * 100).toFixed(0)}%)`).join("; ")}.`);
  if (pack.brief) lines.push(`Raw evidence prepared by the backend:\n${pack.brief.slice(0, BRIEF_LIMIT)}`);
  if (!pack.live) lines.push("The backend is not reachable: factor and row detail is unavailable. Say so.");
  if (partialGravity(e.gravity_g)) lines.push("This environment is in partial gravity: the experiment was not run there, so anything said about this environment is a projection.");
  lines.push(
    "Rules for this answer: figures in this block may be quoted exactly as given, and no others. Name the CSV file and row you rely on. Separate what the experiment measured from what is projected to this environment. Recommend nothing that the block or the documents do not support.",
    "Format: three short parts in plain sentences (what the experiment shows; what it means in this environment; what remains unverified). No markdown, no asterisks, no lists.",
  );
  return lines.join("\n");
}

/** Respuesta sin modelo de lenguaje: las cifras del paquete, ordenadas y en el idioma pedido. */
export function findingSummary(pack: FindingPack, lang: Lang): string {
  const { finding: f, environment: e } = pack;
  const es = lang === "es";
  const n = (x: number, digits = 0): string => x.toFixed(digits).replace(".", es ? "," : ".");
  const mode = pick(MODE, f.flame_mode, lang);
  const parts: string[] = [];

  const what = `${f.experiment}${f.facility ? ` (${f.facility})` : ""}, ${f.material ?? (es ? "material sin registrar" : "material not recorded")}${mode ? `, ${mode}` : ""}`;
  const tested = f.o2_min == null || f.o2_max == null ? "" : es ? `, ensayadas entre ${n(f.o2_min * 100, 1)} y ${n(f.o2_max * 100, 1)} % de O₂` : `, tested between ${n(f.o2_min * 100, 1)} and ${n(f.o2_max * 100, 1)}% O₂`;
  parts.push(es ? `${what}: NASA PSI guarda ${f.observations} observaciones${tested}.` : `${what}: NASA PSI holds ${f.observations} observations${tested}.`);

  const where = es
    ? `${e.label} (${n(e.gravity_g, e.gravity_g ? 3 : 0)} g, ${n(e.o2_fraction * 100)} % de O₂, ${n(e.pressure_atm, 2)} atm)`
    : `${e.label} (${n(e.gravity_g, e.gravity_g ? 3 : 0)} g, ${n(e.o2_fraction * 100)}% O₂, ${n(e.pressure_atm, 2)} atm)`;
  const band = pick(BAND, f.band, lang);
  parts.push(
    es
      ? `Para ${where}, el índice RPI que calcula el backend del equipo es ${f.rpi} de 100 (${band}). Es un índice propio para ordenar hallazgos, no una cifra de NASA.`
      : `For ${where}, the RPI index computed by the team's backend is ${f.rpi} out of 100 (${band}). It is our own index for ranking findings, not a NASA figure.`,
  );

  const top = pack.factors.slice(0, 3);
  if (top.length) {
    const list = top.map((x) => `${pick(FACTOR, x.name, lang)} (+${n(x.contribution, 1)})`).join(", ");
    parts.push(es ? `Lo que más puntos aporta: ${list}.` : `The largest contributions: ${list}.`);
  }
  const relevance = RELEVANCE[f.relevance]?.[lang];
  if (relevance) parts.push(relevance);
  if (partialGravity(e.gravity_g)) {
    parts.push(es ? "PSI no tiene datos directos en gravedad parcial: para este ambiente es una proyección, no una medición." : "PSI has no direct data in partial gravity: for this environment it is a projection, not a measurement.");
  }

  const rows = pack.evidence.slice(0, 3);
  if (rows.length) {
    const list = rows.map((x) => (es ? `${x.file}, fila ${x.row} (calidad ${n(x.quality * 100)} %)` : `${x.file}, row ${x.row} (quality ${n(x.quality * 100)}%)`)).join("; ");
    parts.push(es ? `Evidencia: ${list}.` : `Evidence: ${list}.`);
  } else if (f.sources?.length) {
    parts.push(es ? `Archivos de origen: ${f.sources.slice(0, 3).join(", ")}.` : `Source files: ${f.sources.slice(0, 3).join(", ")}.`);
  }
  if (!pack.live) {
    parts.push(es ? "El backend no respondió: uso la copia de respaldo, sin el detalle por factores ni por fila." : "The backend did not respond: I am using the backup copy, without factor or row detail.");
  }
  return parts.join(" ");
}
