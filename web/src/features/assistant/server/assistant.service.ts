/**
 * Servicio del asistente (solo servidor). Capas, de la más segura a la más abierta:
 *  1. Pregunta preparada → respuesta aprobada, al instante.
 *  2. Análisis del escenario → números calculados por el motor físico (nunca redactados).
 *  3. Búsqueda en el catálogo: la ficha de la investigación nombrada en la
 *     pregunta (Guía) o una ficha de la base de conocimiento, con sus fuentes.
 *  4. (Opcional) Gemini con File Search, si hay claves configuradas en el servidor;
 *     recibe la ficha como contexto y, si falla o responde sin apoyo, se usa la ficha.
 *  5. Sin evidencia → se abstiene.
 *
 * Si la persona fijó un hallazgo de NASA PSI en la Guía, la pregunta se
 * responde sobre ese hallazgo con el paquete del backend del equipo (factores
 * del índice y filas del CSV): con Gemini si hay clave y, si no, con las
 * cifras del paquete ordenadas.
 */
import { KNOWLEDGE, type KnowledgeCard } from "@/content/knowledge";
import type { Lang } from "@/content/i18n";
import { INVESTIGATIONS, type Investigation } from "@/content/investigations";
import { getModule } from "@/content/modules";
import { getSource } from "@/content/sources";
import { assess } from "@/features/fire/engine/analysis";
import { MATERIALS, type MaterialId } from "@/features/fire/engine/materials";
import { findingPack } from "@/features/psi/server/psi.service";
import type { EvidenceLevel } from "@/shared/types/api";
import { detectLang } from "../lib/detectLang";
import { FAQ, NO_ANSWER, findPrepared, normalize } from "../lib/faq";
import { findingBlock, findingSummary } from "../lib/findingText";
import { PERSONA, RULES } from "../lib/persona";

export interface ChatContext {
  module?: string;
  mat?: string;
  g?: number;
  o2?: number;
  p?: number;
  vent?: number;
  /** Hallazgo de NASA PSI fijado en la Guía: su clave y el módulo para el que se calculó. */
  finding?: { key: string; env: string };
  /** La pregunta pide explicar el escenario que se acaba de probar en la pestaña de materiales. */
  explain?: boolean;
}

export interface ChatAnswer {
  text: string;
  /** Idioma de la respuesta: el de la pregunta. */
  lang: Lang;
  origin: "prepared" | "analysis" | "documents" | "psi" | "none";
  sources: { id: string; short: string; url: string }[];
  evidence?: EvidenceLevel;
  /** Filas del CSV de NASA PSI que respaldan una respuesta sobre un hallazgo. */
  rows?: { file: string; row: number; quality: number }[];
}

const STOP = new Set("de la el en y a los las un una que por para con del al se es lo como mas the of and to in is a for on with what why how does do it an are que cual como cuando donde por si no me te su sus this that puede podria".split(" "));

const cite = (ids: string[]): ChatAnswer["sources"] =>
  ids.flatMap((id) => {
    const s = getSource(id);
    return s ? [{ id: s.id, short: s.short, url: s.url }] : [];
  });

const MATERIAL_WORDS: [MaterialId, string[]][] = [
  ["pmma", ["pmma", "acrilico", "acrylic", "plexiglas"]],
  ["nomex", ["nomex"]],
  ["sibal", ["sibal", "tela", "algodon", "cotton", "fabric", "papel", "paper"]],
  ["wire", ["cable", "kapton", "teflon", "aislante", "wire", "insulation"]],
  ["heptane", ["heptano", "heptane"]],
  ["methanol", ["metanol", "methanol"]],
];
const BURN_WORDS = ["arde", "arder", "quema", "inflamable", "inflamabilidad", "margen", "limite", "propaga", "burn", "burns", "flammable", "flammability", "margin", "limit", "spread", "seguro", "safe", "riesgo", "risk"];

function searchCards(question: string): { card: KnowledgeCard; score: number } | null {
  const tokens = normalize(question).split(" ").filter((w) => w.length > 1 && !STOP.has(w));
  let best: { card: KnowledgeCard; score: number } | null = null;
  for (const card of KNOWLEDGE) {
    const body = normalize(`${card.text.es} ${card.text.en}`);
    let score = 0;
    for (const tk of tokens) {
      if (card.keys.includes(tk)) score += 3;
      else if (tk.length >= 4 && body.includes(tk)) score += 1;
    }
    if (!best || score > best.score) best = { card, score };
  }
  return best && best.score >= 4 ? best : null;
}

const COMMON_WORDS = new Set(["same", "slice", "spice", "flex", "bass", "daft"]);

/** Investigación nombrada en la pregunta: por su sigla (CFI-G), su nombre completo o su clave. */
function findInvestigation(question: string): Investigation | null {
  const n = ` ${normalize(question)} `;
  let best: Investigation | null = null;
  let length = 0;
  for (const inv of INVESTIGATIONS) {
    // "ACME · CFI-G" se reconoce por "cfi g" y "Saffire I–VI" por "saffire";
    // el programa (ACME) no basta para elegir una ficha.
    const parts = (inv.name.split("·").pop() ?? inv.name).split("/").map(normalize);
    const short = parts.map((part) => part.replace(/( (\d+|[ivx]+))+$/, ""));
    for (const alias of new Set([normalize(inv.id), normalize(inv.full), ...parts, ...short])) {
      if (alias.length < 3 || alias.length <= length || !n.includes(` ${alias} `)) continue;
      // Siglas que también son palabras comunes: solo cuentan escritas en mayúsculas.
      if (COMMON_WORDS.has(alias) && !new RegExp(`\\b${alias.toUpperCase()}\\b`).test(question)) continue;
      [best, length] = [inv, alias.length];
    }
  }
  return best;
}

/** La ficha de una investigación (los mismos datos de la Guía) como texto citable. */
function investigationCard(inv: Investigation): KnowledgeCard {
  const dot = (x: string): string => (/[.!?]$/.test(x) ? x : `${x}.`);
  const text = (lang: Lang): string =>
    [
      `${inv.name} (${inv.full}), ${inv.platform[lang]}, ${inv.years}.`,
      `${lang === "es" ? "Objetivo" : "Objective"}: ${dot(inv.objective[lang])}`,
      `${lang === "es" ? "Combustible" : "Fuel"}: ${dot(inv.fuel[lang])}`,
      `${lang === "es" ? "Condiciones" : "Conditions"}: ${dot(inv.conditions[lang])}`,
      `${lang === "es" ? "Hallazgo" : "Finding"}: ${dot(inv.findings[lang])}`,
      `${lang === "es" ? "Limitación" : "Limitation"}: ${dot(inv.limitations[lang])}`,
    ].join(" ");
  return { id: `inv:${inv.id}`, keys: [], text: { es: text("es"), en: text("en") }, sources: inv.sources };
}

/** Respuesta numérica calculada con el motor físico para el ambiente activo. */
function analyse(question: string, ctx: ChatContext, lang: Lang): Omit<ChatAnswer, "lang"> | null {
  const n = ` ${normalize(question)} `;
  if (!BURN_WORDS.some((w) => n.includes(` ${w}`))) return null;
  const hit = MATERIAL_WORDS.find(([, words]) => words.some((w) => n.includes(w)));
  const mat = hit?.[0] ?? (ctx.mat && ctx.mat in MATERIALS ? (ctx.mat as MaterialId) : null);
  if (!mat || ctx.o2 == null || ctx.p == null || ctx.g == null) return null;
  return scenarioVerdict(mat, { ...ctx, g: ctx.g, o2: ctx.o2, p: ctx.p }, lang);
}

/**
 * Conclusión del motor físico para un material en un escenario: si supera su
 * frontera de propagación, con qué margen y con qué evidencia. La usan el chat
 * y la prueba de materiales, para que digan lo mismo.
 */
export function scenarioVerdict(mat: MaterialId, ctx: ChatContext & { g: number; o2: number; p: number }, lang: Lang): Omit<ChatAnswer, "lang"> {
  const m = MATERIALS[mat];
  const env = getModule(ctx.module);
  const a = assess({ mat, g: ctx.g, o2: ctx.o2, P: ctx.p, vent: ctx.vent ?? 10 });
  const where = env ? env.name[lang].toLowerCase() : lang === "es" ? "este ambiente" : "this environment";
  const f = (x: number): string => x.toFixed(1).replace(".", lang === "es" ? "," : ".");
  let text: string;
  if (a.margin == null || a.loc == null || a.marginLo == null || a.marginHi == null) {
    text =
      lang === "es"
        ? `No tengo evidencia de una frontera de inflamabilidad para ${m.short.es}: nuestras fuentes no publican un límite de O₂ comparable, así que no genero ningún número. Sí sabemos que su humo fino es difícil de ver para el detector de la ISS.`
        : `I have no evidence of a flammability boundary for ${m.short.en}: our sources publish no comparable O₂ limit, so I generate no number. We do know its fine smoke is hard for the ISS detector to see.`;
  } else {
    const verdict =
      a.level === "high"
        ? lang === "es" ? "supera su frontera de propagación" : "exceeds its flame-spread boundary"
        : a.level === "low"
          ? lang === "es" ? "queda por debajo de su frontera bajo este protocolo (no es una garantía)" : "sits below its boundary under this protocol (not a guarantee)"
          : lang === "es" ? "está cerca de su frontera: la posición es incierta" : "is close to its boundary: the position is uncertain";
    const partial = ctx.g > 0.02 && ctx.g < 0.9;
    text =
      lang === "es"
        ? `En ${where} (${f(ctx.o2)} % O₂, ${f(ctx.p)} kPa, flujo efectivo ${f(a.U)} cm/s), ${m.short.es} ${verdict}. Frontera estimada: ${f(a.loc)} % O₂; margen de ${a.marginLo >= 0 ? "+" : ""}${f(a.marginLo)} a ${a.marginHi >= 0 ? "+" : ""}${f(a.marginHi)} puntos.${partial ? " Es una predicción sin validación en gravedad parcial." : ""}`
        : `In ${where} (${f(ctx.o2)}% O₂, ${f(ctx.p)} kPa, effective flow ${f(a.U)} cm/s), ${m.short.en} ${verdict}. Estimated boundary: ${f(a.loc)}% O₂; margin ${a.marginLo >= 0 ? "+" : ""}${f(a.marginLo)} to ${a.marginHi >= 0 ? "+" : ""}${f(a.marginHi)} points.${partial ? " It is a prediction with no partial-gravity validation." : ""}`;
  }
  return { text, origin: "analysis", sources: cite(a.sources.slice(0, 4)), evidence: a.evidence };
}

/** Consulta opcional a Gemini (File Search), anclada a la ficha encontrada. */
/**
 * Cita de un documento del almacén. Los PDF de la bibliografía se llaman
 * "(n) Título.pdf" y corresponden a la fuente Bn del catálogo; el resto se
 * cita por su título y remite a la página de referencias.
 */
function citeDocument(title: string): ChatAnswer["sources"][number] {
  const n = /^\((\d+)\)/.exec(title)?.[1];
  const known = n ? getSource(`B${n}`) : undefined;
  if (known) return { id: known.id, short: known.short, url: known.url };
  const clean = title.replace(/^\(\d+\)\s*/, "").replace(/\.[a-z0-9]+$/i, "");
  return { id: title, short: clean.length > 48 ? `${clean.slice(0, 46)}…` : clean, url: "/referencias" };
}

/** Nombre válido de un almacén de File Search. */
const STORE_FORMAT = /^fileSearchStores\/[a-z0-9-]+$/;

/** Tiempo máximo de la consulta a Gemini (la ruta permite 30 s). */
const GEMINI_TIMEOUT_MS = 12000;

/** Marca con la que el modelo avisa de que no encontró la respuesta (vale para cualquier idioma). */
const NO_EVIDENCE = "[NO_EVIDENCE]";

/**
 * Lo que la persona tiene en pantalla y lo que el modelo físico calcula para
 * ese escenario. El modelo de lenguaje interpreta estas cifras como lo haría
 * un ingeniero; nunca calcula las suyas.
 */
function scenarioBlock(ctx: ChatContext): string {
  if (ctx.o2 == null || ctx.p == null || ctx.g == null) return "";
  const env = getModule(ctx.module);
  const mat = ctx.mat && ctx.mat in MATERIALS ? (ctx.mat as MaterialId) : null;
  const lines = [`Active scenario on the user's screen: ${env ? `${env.name.en} (${env.code})` : "no module selected"}; gravity ${ctx.g} g; oxygen ${ctx.o2}% at ${ctx.p} kPa (oxygen partial pressure ${((ctx.o2 / 100) * ctx.p).toFixed(1)} kPa); ventilation ${ctx.vent ?? 10} cm/s.`];
  if (mat) {
    const a = assess({ mat, g: ctx.g, o2: ctx.o2, P: ctx.p, vent: ctx.vent ?? 10 });
    const sign = (x: number): string => `${x >= 0 ? "+" : ""}${x.toFixed(1)}`;
    lines.push(
      a.loc == null || a.marginLo == null || a.marginHi == null
        ? `Model result for ${MATERIALS[mat].short.en}: NO published flammability boundary for this material (evidence ∅). Give no number.`
        : `Model result for ${MATERIALS[mat].short.en}: flame-spread boundary ${a.loc.toFixed(1)}% O2; margin (environment minus boundary) from ${sign(a.marginLo)} to ${sign(a.marginHi)} oxygen points; effective flow ${a.U.toFixed(1)} cm/s; risk level ${a.level}; evidence level ${a.evidence === "NONE" ? "∅" : a.evidence}.`,
    );
    if (a.alerts.length) lines.push(`Active analysis alerts: ${a.alerts.map((x) => `${x.id} (${x.message.en})`).join("; ")}.`);
  }
  return lines.join("\n");
}

async function askGemini(question: string, card: KnowledgeCard | null, lang: Lang, ctx: ChatContext = {}, finding = ""): Promise<{ text: string; docs: string[]; abstained: boolean } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  const store = process.env.FILE_SEARCH_STORE?.trim();
  const scenario = scenarioBlock(ctx);
  const system = [
    ...PERSONA,
    ...RULES,
    "Always search the file-search documents before answering. Most are written in English: search with English terms and acronyms even when the question is in Spanish. The project document also holds a bank of questions and answers about the platform.",
    // El propio modelo responde en el idioma de la pregunta: no hay una segunda petición de traducción.
    `Answer in the same language as the user's question, whatever it is. If the language of the question is unclear, answer in ${lang === "es" ? "Spanish" : "English"}.`,
    `If the information is missing, start your answer with the marker ${NO_EVIDENCE} and then say, in the language of the question, that you could not find it in our NASA sources.`,
    "At most 130 words, short clear sentences, no tables, no headings.",
    scenario,
    finding,
    card ? `Context:\n${card.text[lang]}` : "",
  ].join("\n");
  // TODO(diagnóstico): registro temporal en la terminal del servidor. Retirar
  // cuando el almacén quede verificado en la demo.
  const log = (msg: string): void => console.info(`[asistente] ${msg}`);
  const started = Date.now();
  log(`pregunta="${question.slice(0, 80)}" modelo=${model} almacén=${store ? (STORE_FORMAT.test(store) ? "configurado" : "FORMATO INVÁLIDO (debe ser fileSearchStores/...)") : "SIN CONFIGURAR"} ficha=${card?.id ?? "ninguna"}`);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        ...(store ? { tools: [{ fileSearch: { fileSearchStoreNames: [store] } }] } : {}),
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 400);
      log(`ERROR de la API: HTTP ${res.status} en ${Date.now() - started} ms — ${detail}`);
      return null;
    }
    const data = (await res.json()) as { candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] }; groundingMetadata?: { groundingChunks?: { retrievedContext?: { title?: string } }[] } }[] };
    const cand = data.candidates?.[0];
    const text = cand?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    // Documentos del almacén en los que se apoyó la respuesta (sin repetir).
    const docs = [...new Set((cand?.groundingMetadata?.groundingChunks ?? []).flatMap((c) => c.retrievedContext?.title ?? []))];
    // Hay apoyo si respondió con documentos, con una ficha, con el escenario calculado o con un hallazgo de PSI.
    const grounded = docs.length > 0 || !!card || !!scenario || !!finding;
    const abstained = !!text && (text.includes(NO_EVIDENCE) || text.includes(NO_ANSWER.es) || text.includes(NO_ANSWER.en));
    log(`respuesta en ${Date.now() - started} ms · fin=${cand?.finishReason ?? "?"} · fuentes=${docs.length}${docs.length ? ` [${docs.map((d) => d.slice(0, 40)).join(" | ")}]` : " (SIN FUENTES del almacén)"} · texto=${text ? `${text.length} caracteres` : "vacío"}${abstained ? " · el modelo se abstuvo" : ""}`);
    return text && grounded ? { text: text.replaceAll(NO_EVIDENCE, "").trim(), docs, abstained } : null;
  } catch (e) {
    log(`ERROR al llamar a la API tras ${Date.now() - started} ms: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
    return null;
  }
}

/**
 * Responde una pregunta del usuario con su origen, fuentes y nivel de evidencia.
 * La respuesta va en el idioma de la pregunta. `hint` es el idioma de la
 * conversación (o de la interfaz) y solo decide cuando la pregunta es
 * demasiado corta o ambigua para reconocer su idioma.
 */
export async function answerQuestion(question: string, hint: Lang, ctx: ChatContext = {}): Promise<ChatAnswer> {
  const prepared = findPrepared(question);
  // Una pregunta preparada se responde en el idioma en que está escrita.
  const lang: Lang = (prepared ? (normalize(prepared.q.en) === normalize(question) && normalize(prepared.q.es) !== normalize(question) ? "en" : normalize(prepared.q.es) === normalize(question) && normalize(prepared.q.en) !== normalize(question) ? "es" : null) : null) ?? detectLang(question) ?? hint;
  if (prepared) {
    const card = prepared.card ? KNOWLEDGE.find((k) => k.id === prepared.card) : undefined;
    return {
      lang,
      text: card ? card.text[lang] : prepared.a[lang],
      origin: "prepared",
      sources: cite(card?.sources ?? prepared.sources ?? []),
      evidence: card?.evidence,
    };
  }
  // Hallazgo de PSI fijado: la respuesta trata de ese hallazgo. Si ya no existe
  // para ese ambiente, la pregunta sigue por el camino general.
  const pack = ctx.finding ? await findingPack(ctx.finding.key, ctx.finding.env) : null;
  if (pack) {
    // El escenario del Laboratorio no se mezcla: el hallazgo trae su propio ambiente.
    const explained = await askGemini(question, null, lang, {}, findingBlock(pack));
    const docs = explained && !explained.abstained ? explained.docs.map(citeDocument) : [];
    const sources = [...cite(["PSI"]), ...docs];
    return {
      lang,
      text: explained && !explained.abstained ? explained.text : findingSummary(pack, lang),
      origin: "psi",
      sources: sources.filter((x, i) => sources.findIndex((y) => y.id === x.id) === i).slice(0, 5),
      rows: pack.evidence.slice(0, 6),
    };
  }
  // Explicación de un escenario probado en la pestaña de materiales: el modelo
  // de lenguaje interpreta las cifras del motor físico; sin él, queda la
  // conclusión calculada.
  if (ctx.explain && ctx.mat && ctx.mat in MATERIALS && ctx.g != null && ctx.o2 != null && ctx.p != null) {
    const verdict = scenarioVerdict(ctx.mat as MaterialId, { ...ctx, g: ctx.g, o2: ctx.o2, p: ctx.p }, lang);
    const explained = await askGemini(question, null, lang, ctx);
    if (explained && !explained.abstained) {
      const sources = [...verdict.sources, ...explained.docs.map(citeDocument)];
      return { ...verdict, lang, text: explained.text, sources: sources.filter((x, i) => sources.findIndex((y) => y.id === x.id) === i).slice(0, 5) };
    }
    return { ...verdict, lang };
  }
  const analysis = analyse(question, ctx, lang);
  if (analysis) return { ...analysis, lang };
  // La ficha de la investigación nombrada tiene prioridad sobre la búsqueda por palabras.
  const named = findInvestigation(question);
  const found = named ? { card: investigationCard(named) } : searchCards(question);
  const generated = await askGemini(question, found?.card ?? null, lang, ctx);
  // Si el modelo se abstiene (aunque sea a medias), vale más la ficha verificada que una respuesta parcial.
  if (generated && !generated.abstained) {
    // Se citan los documentos consultados y, si la hubo, las fuentes de la ficha (sin duplicar).
    const sources = [...generated.docs.map(citeDocument), ...cite(found?.card.sources ?? [])];
    const unique = sources.filter((x, i) => sources.findIndex((y) => y.id === x.id) === i).slice(0, 5);
    return { lang, text: generated.text, origin: "documents", sources: unique, evidence: found?.card.evidence };
  }
  if (found) return { lang, text: found.card.text[lang], origin: "documents", sources: cite(found.card.sources), evidence: found.card.evidence };
  // Sin evidencia: en español o inglés, el texto aprobado; en otro idioma, la frase del propio modelo.
  const own = generated?.abstained && detectLang(question) === null && generated.text ? generated.text : NO_ANSWER[lang];
  return { lang, text: own, origin: "none", sources: [] };
}

/** Número de preguntas preparadas y fichas (para el estado del sistema). */
export const assistantStats = (): { prepared: number; cards: number } => ({ prepared: FAQ.length, cards: KNOWLEDGE.length });
