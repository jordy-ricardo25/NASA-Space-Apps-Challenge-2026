/**
 * Documento del proyecto para el corpus del asistente (RAG).
 *
 * Reúne en un solo texto lo que la plataforma ya sabe y muestra: ambientes,
 * fichas de investigaciones, materiales del motor físico, fichas de
 * conocimiento, preguntas preparadas, mitos y hechos, radar, casos de la
 * Tierra, equipo y fuentes. No añade ningún dato: todo sale de `src/content`
 * y del catálogo de materiales, con la fuente de cada bloque.
 *
 * Lo ejecuta `npm run knowledge-doc` (scripts/knowledge-doc.mjs), que escribe
 * el archivo en `conocimiento/` para subirlo con `npm run ingest`.
 */
import { EARTH_CASES, HISTORY } from "@/content/earth";
import { APP_TAGLINE, type L } from "@/content/i18n";
import { FAMILY_LABEL, INVESTIGATIONS, PILLAR_LABEL, VAR_KEYS, VAR_LABEL } from "@/content/investigations";
import { KNOWLEDGE } from "@/content/knowledge";
import { AI_USE, LICENSES } from "@/content/licenses";
import { MODULES } from "@/content/modules";
import { MYTHS } from "@/content/myths";
import { GAPS, RADAR, STAGE_LABEL, type Stage } from "@/content/radar";
import { SOURCES, getSource } from "@/content/sources";
import { TEAM } from "@/content/team";
import { MATERIAL_LIST } from "@/features/fire/engine/materials";
import { CARD_QUESTIONS, PLATFORM_QUESTIONS } from "@/content/questionBank";
import { ROUTES } from "@/content/routes";
import { FAQ, NO_ANSWER } from "../lib/faq";
import { PERSONA, RULES } from "../lib/persona";

/** Texto bilingüe: español y, a continuación, la versión en inglés. */
const both = (v: L): string => (v.es === v.en ? v.es : `${v.es} (EN: ${v.en})`);

/** Fuentes de un bloque con su cita corta y su enlace. */
const cite = (ids: string[]): string =>
  ids.length
    ? ids
        .map((id) => {
          const s = getSource(id);
          return s ? `${s.short} — ${s.title} (${s.url})` : id;
        })
        .join("; ")
    : "sin fuente registrada";

const range = (r: [number, number] | null, unit: string): string => (r ? `${r[0]}–${r[1]} ${unit}` : "no publicado en nuestras fuentes");

const STAGES: Stage[] = ["evidence", "finding", "gap", "technology"];
const REGIME = { micro: "microgravedad", partial: "gravedad parcial", earth: "gravedad terrestre (1 g)" } as const;
const ORIGIN = { measured: "valor publicado", calibrated: "ajustado para reproducir valores publicados", estimate: "orden de magnitud de ingeniería, por validar" } as const;
const DATA = ["sin datos aún", "datos en PSI por confirmar", "reportes publicados", "tablas en PSI"] as const;

/**
 * Construye el documento del proyecto en Markdown.
 * @param projectDoc Texto de `docs/documentacion-proyecto.md`, que se añade al final.
 * @returns El documento completo, listo para indexar.
 */
export function buildKnowledgeDoc(projectDoc: string): string {
  const out: string[] = [];
  const h = (level: number, title: string): void => void out.push("", `${"#".repeat(level)} ${title}`, "");
  const p = (...lines: string[]): void => void out.push(...lines);

  p("# Flame in Freefall — documento del proyecto para el asistente Flamey");
  p("", "Este documento describe la plataforma Flame in Freefall, del equipo Andora Labs, para el reto Flame in Freefall del NASA Space Apps Challenge 2026. Se genera a partir del contenido verificado de la plataforma: cada bloque indica su fuente. Si un dato no aparece aquí ni en la bibliografía, la respuesta correcta es que no hay evidencia.");

  h(2, "0. Instrucciones para el asistente (rol y reglas)");
  p("Estas son las instrucciones con las que trabaja Flamey. Se repiten aquí para que cualquier respuesta sobre su forma de trabajar salga de este texto.", "");
  h(3, "Rol");
  for (const line of PERSONA) p(`- ${line}`);
  h(3, "Reglas de rigor");
  for (const line of RULES) p(`- ${line}`);
  h(3, "Cómo responder");
  p(
    "- Responde en el idioma de la pregunta.",
    "- Primero la conclusión; después la evidencia y sus límites; al final, qué implica para la tripulación o el diseño, solo si las fuentes lo respaldan.",
    "- Si la pregunta es sobre la plataforma (qué hay, cómo se usa, quién la hizo), responde con el banco de preguntas de la sección 13 y con la sección 12.",
    "- Si la pregunta nombra una investigación, un ambiente o un material, usa su ficha (secciones 3, 4 y 5).",
    "- Si la pregunta pide un número de margen o de frontera y no llega el bloque 'Model result', explica la física y remite al Laboratorio o a la cabina, que lo calculan.",
    `- Si no hay evidencia, dilo con claridad: "${NO_ANSWER.es}"`,
  );

  h(2, "1. Qué es la plataforma y quién la hizo");
  p(`Flame in Freefall es un ${both(APP_TAGLINE)}.`, "", both(TEAM.pitch), "", `- Equipo: ${TEAM.name}.`, `- ${both(TEAM.challenge)}.`, `- ${both(TEAM.event)}.`, `- ${both(TEAM.disclaimer)}`);
  h(3, "Integrantes del equipo Andora Labs");
  for (const m of TEAM.members) p(`- ${m.name}, ${m.title}. Rol en el proyecto: ${m.role}.`);
  h(3, "El asistente Flamey");
  p("Flamey es la mascota y el asistente de la plataforma: una llama con carita que cae y se vuelve esfera. Su forma sigue la gravedad del ambiente activo: gota amarilla en 1 g y esfera azul en microgravedad.", "", "Flamey responde por capas: primero las preguntas preparadas por el equipo, después las cifras calculadas por el modelo físico, después las fichas del catálogo y por último los documentos de la bibliografía. Los números del margen de inflamabilidad los calcula el modelo físico; el asistente no los redacta ni los estima.", "", `Cuando no hay evidencia, Flamey responde: "${NO_ANSWER.es}" (EN: "${NO_ANSWER.en}").`);

  h(2, "2. Preguntas preparadas y sus respuestas aprobadas");
  for (const f of FAQ) {
    const card = f.card ? KNOWLEDGE.find((k) => k.id === f.card) : undefined;
    h(3, both(f.q));
    p(both(card ? card.text : f.a), "", `Fuentes: ${cite(card?.sources ?? f.sources ?? [])}.`);
  }

  h(2, "3. Ambientes habitables (módulos)");
  p("Cada módulo de la plataforma es uno de los ambientes habitables del reto. Los valores de atmósfera son parámetros de diseño del ambiente, no mediciones en vivo.");
  for (const m of MODULES) {
    h(3, `${m.code} · ${both(m.name)}`);
    p(`- Tipo: ${both(m.kind)}.`, `- Descripción: ${both(m.description)}`, `- Especialidades: ${m.specialties.map(both).join("; ")}.`, `- Ventilación nominal: ${m.vent} cm/s. Volumen libre: ${m.volume} m³.`, `- Nivel de evidencia: ${both(m.evidence)}`, `- Investigaciones clave: ${m.investigations.map((id) => INVESTIGATIONS.find((i) => i.id === id)?.name ?? id).join(", ")}.`, `- Mensaje de Flamey: ${both(m.guide)}`);
    for (const c of m.components) p(`- Componente ${both(c.name)}: ${both(c.info)}`);
    for (const v of m.variants) {
      p(`- Atmósfera "${both(v.name)}": gravedad ${v.g} g, ${v.undefinedAtmosphere ? "atmósfera sin definir en las fuentes (sin evidencia)" : `oxígeno ${v.o2} %, presión ${v.P} kPa, presión parcial de oxígeno ${((v.o2 / 100) * v.P).toFixed(1)} kPa`}. ${both(v.note)} Fuentes: ${cite(v.sources)}.`);
    }
  }

  h(2, "4. Investigaciones de combustión (fichas de la Guía)");
  p("Solo aparecen las investigaciones identificadas en las fuentes. Un rango vacío significa que no está publicado en nuestras fuentes, nunca cero.");
  for (const i of INVESTIGATIONS) {
    h(3, `${i.name} — ${i.full}`);
    p(
      `- Familia: ${both(FAMILY_LABEL[i.family])}. Pilares: ${i.pillars.map((x) => both(PILLAR_LABEL[x])).join(", ")}.`,
      `- Plataforma: ${both(i.platform)}. Equipo: ${i.hardware}. Años: ${i.years}. Régimen: ${REGIME[i.regime]}.`,
      `- Objetivo: ${both(i.objective)}`,
      `- Combustible: ${both(i.fuel)}`,
      `- Condiciones: ${both(i.conditions)}`,
      `- Rangos ensayados: oxígeno ${range(i.o2, "%")}; presión ${range(i.p, "kPa")}; flujo ${range(i.flow, "cm/s")}.`,
      `- Hallazgos: ${both(i.findings)}`,
      `- Limitaciones: ${both(i.limitations)}`,
      `- Variables medidas: ${VAR_KEYS.filter((k) => i.vars[k] === "yes").map((k) => VAR_LABEL[k].es).join(", ") || "ninguna registrada"}. No medidas: ${VAR_KEYS.filter((k) => i.vars[k] === "no").map((k) => VAR_LABEL[k].es).join(", ") || "ninguna"}.`,
      `- Datos: ${DATA[i.data]} (${both(i.psi)}).`,
      `- Ambientes donde aplica: ${i.modules.map((id) => MODULES.find((m) => m.id === id)?.name.es ?? id).join(", ")}.`,
      `- Fuentes: ${cite(i.sources)}.`,
    );
  }

  h(2, "5. Materiales del modelo físico");
  p("Cada parámetro declara su origen: measured (valor publicado), calibrated (ajustado para reproducir valores publicados) o estimate (orden de magnitud por validar). Un material sin frontera publicada se muestra como sin evidencia: el modelo no le inventa un límite de oxígeno.");
  for (const m of MATERIAL_LIST) {
    h(3, both(m.name));
    const f = m.frontier;
    const d = m.droplet;
    p(
      `- Se asocia con: ${both(m.tag)}. Origen de los parámetros: ${ORIGIN[m.origin]}.`,
      `- Nota: ${both(m.note)}`,
      f
        ? `- Frontera de propagación (${ORIGIN[f.origin]}): oxígeno mínimo ${f.locMin} % a 101,3 kPa, en el flujo más desfavorable (${f.uStar} cm/s). Incertidumbre de ±${f.sigma} puntos de oxígeno dentro del dominio ensayado. Factor de compensación lunar: ${f.lunarComp} puntos de oxígeno. Protocolo: ${both(f.protocol)} Dominio ensayado en microgravedad: oxígeno ${range(f.domain.o2, "%")}, presión ${range(f.domain.p, "kPa")}, flujo ${range(f.domain.flow, "cm/s")}. Nivel de evidencia en microgravedad ${f.evidenceMicro} y en tierra ${f.evidenceGround}. Fuentes: ${cite(f.sources)}.`
        : "- Frontera de propagación: sin evidencia. Nuestras fuentes no publican un límite de oxígeno comparable para este material y el modelo no genera ninguno.",
      `- Temperatura de ignición de la superficie: ${m.tig} °C a 101,3 kPa. Productos por energía liberada: ${m.co2PerMJ} mol/MJ de CO₂ y ${m.coPerMJ} mol/MJ de CO.`,
      `- Humo: ${m.smoke.yield} mg/kJ, diámetro medio ${m.smoke.dCount} nm. Fuentes: ${cite(m.smoke.sources)}.`,
    );
    if (d) p(`- Gota: constante de combustión K de ${d.k21} mm²/s en aire a 1 atm, diámetro inicial típico ${d.d0} mm. Química de llama fría documentada: ${d.coolFlame ? "sí" : "no"}. Fuentes: ${cite(d.sources)}.`);
    p(`- Fuentes del material: ${cite(m.sources)}.`);
  }

  h(2, "6. Fichas de conocimiento");
  for (const k of KNOWLEDGE) {
    h(3, `Ficha ${k.id}`);
    p(both(k.text), "", `Nivel de evidencia: ${k.evidence ?? "no asignado"}. Fuentes: ${cite(k.sources)}.`);
  }

  h(2, "7. Mitos y hechos del fuego sin gravedad");
  for (const m of MYTHS) p(`- Mito: ${both(m.myth)} Hecho: ${both(m.fact)} Fuentes: ${cite(m.sources)}.`);

  h(2, "8. Radar tecnológico: de la evidencia a la tecnología");
  for (const lane of RADAR) {
    h(3, both(lane.name));
    for (const s of STAGES) {
      const n = lane.nodes[s];
      p(`- ${STAGE_LABEL[s].es}: ${both(n.title)}. ${both(n.text)} ${n.evidence ? `Nivel de evidencia ${n.evidence}. ` : ""}Fuentes: ${cite(n.sources)}.`);
    }
  }
  h(3, "Mapa de brechas");
  for (const g of GAPS) p(`- ${both(g.name)}: ${both(g.status)}. La cierra: ${both(g.closes)}. Nivel de evidencia ${g.evidence}. Fuentes: ${cite(g.sources)}.`);

  h(2, "9. Aplicaciones en la Tierra y lecciones históricas");
  for (const c of EARTH_CASES) {
    h(3, both(c.title));
    p(`- Tipo: ${c.kind === "documented" ? "transferencia documentada" : "aplicación posible"}.`, `- Problema: ${both(c.problem)}`, `- Tecnología: ${both(c.technology)}`, `- Impacto: ${both(c.impact)}`, `- Relación con el espacio: ${both(c.link)}`, `- En la plataforma: ${both(c.platform.label)}. ${both(c.platform.why)}`, `- Dato: ${c.stat.value} — ${both(c.stat.label)}`, `- Fuentes: ${cite(c.sources)}.`);
  }
  for (const c of HISTORY) {
    h(3, `${both(c.name)} (${c.year})`);
    p(`- Qué pasó: ${both(c.what)}`, `- Física: ${both(c.physics)}`, `- Lección: ${both(c.lesson)}`, `- Regla: ${both(c.rule)}`, `- Fuentes: ${cite(c.sources)}.`);
  }

  h(2, "10. Licencias y uso de inteligencia artificial");
  for (const a of AI_USE) p(`- ${both(a.title)}: ${both(a.text)}`);
  for (const x of LICENSES) p(`- ${x.name}: ${both(x.use)}. Licencia: ${both(x.license)} (${x.url}).`);

  h(2, "11. Catálogo de fuentes");
  for (const s of SOURCES) p(`- ${s.id}: ${s.short} — ${s.title}. ${s.url}`);

  h(2, "12. Documentación técnica de la plataforma");
  p(projectDoc.replace(/^# .*$/m, "").trim());

  // ── Banco de preguntas ────────────────────────────────────────────────────
  h(2, "13. Banco de preguntas y respuestas");
  p("Preguntas que haría cualquier persona, con la respuesta que debe dar el asistente. Las respuestas salen del contenido verificado de las secciones anteriores.");
  const qa = (q: string, a: string): void => void p("", `**P: ${q}**`, "", `R: ${a}`);

  h(3, "Sobre la plataforma");
  for (const x of PLATFORM_QUESTIONS) qa(both(x.q), both(x.a));
  for (const f of FAQ) {
    const card = f.card ? KNOWLEDGE.find((k) => k.id === f.card) : undefined;
    qa(both(f.q), both(card ? card.text : f.a));
  }

  h(3, "Sobre las secciones del sitio");
  for (const r of ROUTES) qa(`¿Qué hay en ${r.label.es}? (EN: What is in ${r.label.en}?)`, `${both(r.description)} Ruta: ${r.href}.`);

  h(3, "Sobre la física y la seguridad contra incendios");
  for (const k of KNOWLEDGE) {
    for (const q of CARD_QUESTIONS[k.id] ?? []) qa(both(q), `${both(k.text)} Nivel de evidencia: ${k.evidence ?? "no asignado"}. Fuentes: ${cite(k.sources)}.`);
  }
  for (const m of MYTHS) qa(`¿Es cierto que: ${m.myth.es} (EN: Is it true that: ${m.myth.en})`, `No. ${both(m.fact)} Fuentes: ${cite(m.sources)}.`);

  h(3, "Sobre cada ambiente");
  for (const m of MODULES) {
    const v = m.variants[0]!;
    const air = v.undefinedAtmosphere
      ? { es: `ninguna fuente fija todavía su atmósfera de cabina; la plataforma explora como hipótesis ${v.o2} % de oxígeno a ${v.P} kPa y lo marca como sin evidencia`, en: `no source fixes its cabin atmosphere yet; the platform explores ${v.o2}% oxygen at ${v.P} kPa as a hypothesis and marks it as no evidence` }
      : { es: `${v.o2} % de oxígeno a ${v.P} kPa (presión parcial de oxígeno ${((v.o2 / 100) * v.P).toFixed(1)} kPa)`, en: `${v.o2}% oxygen at ${v.P} kPa (oxygen partial pressure ${((v.o2 / 100) * v.P).toFixed(1)} kPa)` };
    qa(
      `¿Qué atmósfera y qué gravedad tiene ${m.name.es}? (EN: What atmosphere and gravity does the ${m.name.en} have?)`,
      `${m.name.es} (${m.code}): gravedad ${v.g} g; ${air.es}. ${m.evidence.es} (EN: ${m.name.en} (${m.code}): gravity ${v.g} g; ${air.en}. ${m.evidence.en}) Fuentes: ${cite(v.sources)}.`,
    );
    qa(`¿Qué es ${m.name.es} en la plataforma? (EN: What is the ${m.name.en} in the platform?)`, `${both(m.description)} ${both(m.guide)}`);
    qa(
      `¿Qué investigaciones son las más relevantes para ${m.name.es}? (EN: Which investigations are most relevant to the ${m.name.en}?)`,
      `${m.investigations.map((id) => INVESTIGATIONS.find((i) => i.id === id)?.name ?? id).join(", ")}. La Guía las ordena por ambiente en la pestaña Ranking por ambiente.`,
    );
  }

  h(3, "Sobre cada investigación");
  for (const i of INVESTIGATIONS) {
    qa(`¿Qué es ${i.name}? (EN: What is ${i.name}?)`, `${i.name} (${i.full}), ${both(i.platform)}, ${i.years}. ${both(i.objective)} Fuentes: ${cite(i.sources)}.`);
    qa(`¿Qué combustible y qué condiciones usó ${i.name}? (EN: Which fuel and conditions did ${i.name} use?)`, `Combustible: ${both(i.fuel)}. Condiciones: ${both(i.conditions)}. Oxígeno ensayado: ${range(i.o2, "%")}; presión: ${range(i.p, "kPa")}; flujo: ${range(i.flow, "cm/s")}.`);
    qa(`¿Qué descubrió ${i.name} y qué limitaciones tiene? (EN: What did ${i.name} find and what are its limitations?)`, `Hallazgo: ${both(i.findings)} Limitación: ${both(i.limitations)}`);
  }

  h(3, "Sobre cada material");
  for (const m of MATERIAL_LIST) {
    const f = m.frontier;
    qa(
      `¿Con cuánto oxígeno arde ${m.short.es}? (EN: At what oxygen level does ${m.short.en} burn?)`,
      f
        ? `La frontera de propagación de ${m.short.es} en el flujo más desfavorable (${f.uStar} cm/s) es ${f.locMin} % de oxígeno a 101,3 kPa, con una incertidumbre de ±${f.sigma} puntos dentro del dominio ensayado. Cambia con el flujo, la presión y la gravedad: el valor para un ambiente concreto lo calcula el Laboratorio, con su intervalo y su nivel de evidencia. ${both(f.protocol)} Fuentes: ${cite(f.sources)}.`
        : `Sin evidencia: nuestras fuentes no publican una frontera de oxígeno comparable para ${m.short.es}, y la plataforma no genera ninguna. ${both(m.note)}`,
    );
  }

  return `${out.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}
