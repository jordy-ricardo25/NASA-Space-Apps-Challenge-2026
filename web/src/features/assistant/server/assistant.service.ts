/**
 * Servicio del asistente (solo servidor). Capas, de la más segura a la más abierta:
 *  1. Pregunta preparada → respuesta aprobada, al instante.
 *  2. Análisis del escenario → números calculados por el motor físico (nunca redactados).
 *  3. Búsqueda en el catálogo: la ficha de la investigación nombrada en la
 *     pregunta (Guía) o una ficha de la base de conocimiento, con sus fuentes.
 *  4. (Opcional) Modelo de lenguaje, si está configurado en el servidor: primero
 *     el modelo del equipo en Ollama (OLLAMA_BASE_URL) y, si no está o no
 *     responde, Gemini con File Search (GEMINI_API_KEY). Recibe la ficha como
 *     contexto y, si falla o responde sin apoyo, se usa la ficha.
 *  5. Sin evidencia → se abstiene.
 *
 * Si la persona fijó un hallazgo de NASA PSI en la Guía, la pregunta se
 * responde sobre ese hallazgo con el paquete del backend del equipo (factores
 * del índice y filas del CSV): con el modelo de lenguaje si lo hay y, si no, con las
 * cifras del paquete ordenadas.
 */
import { KNOWLEDGE, type KnowledgeCard } from "@/content/knowledge";
import type { Lang } from "@/content/i18n";
import { INVESTIGATIONS, type Investigation } from "@/content/investigations";
import { getModule } from "@/content/modules";
import { getSource } from "@/content/sources";
import { assess } from "@/features/fire/engine/analysis";
import { MATERIALS, type MaterialId } from "@/features/fire/engine/materials";
import { PSI_ENV } from "@/features/psi/lib/env";
import { findingPack, ladderFor, type FindingPack } from "@/features/psi/server/psi.service";
import type { EvidenceLevel } from "@/shared/types/api";
import { detectLang } from "../lib/detectLang";
import { FAQ, NO_ANSWER, findPrepared, normalize } from "../lib/faq";
import { findingBlock, findingSummary } from "../lib/findingText";
import { detectTopic, pendingTopics, topicAnswer, topicAsk } from "../lib/findingTopics";
import { PERSONA, RULES } from "../lib/persona";
import { knowledgeBase } from "./knowledgeBase";
import { askOllama, ollamaConfig, resolveModel } from "./ollama";

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

/** Un turno anterior de la conversación. */
export interface ChatTurn {
  role: "user" | "bot";
  text: string;
}

/** Turnos anteriores que recibe el modelo (los mismos que el Flamey de Johnatan). */
export const HISTORY_TURNS = 6;

/** Turnos que recibe el modelo de Ollama (los que usa el Flamey de Johnatan). */
const LOCAL_TURNS = 2;

/** Respuestas cortas que aceptan lo que Flamey acaba de ofrecer. */
// El mensaje entero debe ser una afirmación: "Si arde, ¿qué hago?" no lo es.
const AFFIRMATIVE = /^[\s¡]*(?:(?:s[ií]|claro|dale|ok|okay|vale|bueno|de una|yes|yeah|sure)[\s,.!]*(?:por favor|please)?|por favor|please)[\s.!]*$/i;

/**
 * Un "sí" responde a la última pregunta que hizo Flamey: se toma esa pregunta
 * como la consulta, para que todas las capas la entiendan.
 */
export function followUp(question: string, history: ChatTurn[]): string {
  if (question.length > 24 || !AFFIRMATIVE.test(question)) return question;
  const last = [...history].reverse().find((turn) => turn.role === "bot")?.text.trim() ?? "";
  const asked = /[^.?!¿\n]*\?$/.exec(last)?.[0].trim();
  if (!asked) return question;
  // "¿Quieres saber cómo…?" se convierte en la consulta "¿Cómo…?".
  const direct = asked.replace(/^(quieres saber|do you want to know)\s+/i, "");
  const query = direct.charAt(0).toUpperCase() + direct.slice(1);
  return last.includes(`¿${asked}`) ? `¿${query}` : query;
}

/** Con lo que Flamey cierra la explicación de un hallazgo; un "sí" lo retoma. */
const OFFER: Record<Lang, string> = {
  es: "¿Quieres saber cómo se apaga una llama así?",
  en: "Do you want to know how a flame like this is put out?",
};
const ABOUT_SUPPRESSION = /apag|supres|extin|mitig|put out|suppress|extinguish/i;
const ABOUT_SUIT = /\beva\b|traje|\bsuit/i;
/** Módulo de la plataforma que corresponde al traje en el backend. */
const SUIT_MODULE = Object.keys(PSI_ENV).find((id) => PSI_ENV[id] === "eva");

/** El mismo hallazgo evaluado en el traje: cifras del backend, para comparar. */
function suitNote(pack: FindingPack, suit: FindingPack, lang: Lang): string {
  const o2 = (suit.environment.o2_fraction * 100).toFixed(0);
  const atm = suit.environment.pressure_atm.toFixed(2).replace(".", lang === "es" ? "," : ".");
  return lang === "es"
    ? `En ${suit.environment.label} (${o2} % de O₂ a ${atm} atm) el índice RPI de este mismo hallazgo es ${suit.finding.rpi} de 100; en ${pack.environment.label} es ${pack.finding.rpi} de 100.`
    : `In ${suit.environment.label} (${o2}% O₂ at ${atm} atm) the RPI index of this same finding is ${suit.finding.rpi} out of 100; in ${pack.environment.label} it is ${pack.finding.rpi} out of 100.`;
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
  /** Modelo de lenguaje que redactó la respuesta ("ollama:qwen2.5:1.5b", "gemini"); vacío si no hubo. */
  by?: string;
  /** Preguntas siguientes sobre el hallazgo que aún no se han hecho (solo en Flamey local). */
  suggestions?: string[];
  /** Tema del hallazgo que se acaba de responder, para no volver a ofrecerlo. */
  topic?: string;
  /** La respuesta es un razonamiento del modelo porque los datos no cubren la pregunta: no es evidencia. */
  extrapolated?: boolean;
}

/**
 * Quién redacta cuando hace falta un modelo de lenguaje:
 *  - "auto": el chat general. Gemini con File Search y, de respaldo, Ollama.
 *  - "local": la sección de Flamey local. Solo Ollama; si falla, la respuesta calculada.
 *  - "fast": sin modelo, como el modo "Rápido" del Flamey de Johnatan.
 */
export type AssistantEngine = "auto" | "local" | "fast";

export interface AnswerOptions {
  engine?: AssistantEngine;
  /** Modelo de Ollama elegido en la interfaz; vacío para el de la configuración. */
  model?: string;
  /** Temas del hallazgo ya respondidos en esta conversación (los lleva la pantalla). */
  covered?: string[];
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

/** Fichas de conocimiento ordenadas por coincidencia con la pregunta (la mejor primero). */
function rankCards(question: string, pool: KnowledgeCard[] = KNOWLEDGE): { card: KnowledgeCard; score: number }[] {
  const tokens = normalize(question).split(" ").filter((w) => w.length > 1 && !STOP.has(w));
  return pool.map((card) => {
    const body = normalize(`${card.text.es} ${card.text.en}`);
    let score = 0;
    for (const tk of tokens) {
      if (card.keys.includes(tk)) score += 3;
      else if (tk.length >= 4 && body.includes(tk)) score += 1;
    }
    return { card, score };
  }).sort((a, b) => b.score - a.score);
}

function searchCards(question: string, pool: KnowledgeCard[] = KNOWLEDGE): { card: KnowledgeCard; score: number } | null {
  const best = rankCards(question, pool)[0];
  return best && best.score >= 4 ? best : null;
}

/**
 * Fichas que acompañan a la pregunta cuando el modelo no tiene buscador de
 * documentos. Son pocas a propósito: un modelo pequeño mezcla los datos de
 * fichas distintas.
 */
const CONTEXT_CARDS = 2;

/** Cifras de un texto, sin las de fórmulas y siglas (CO2, B17) ni las de subíndices. */
function figures(text: string): number[] {
  return (text.replace(/[A-Za-z]+-?\d+/g, " ").match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => Number(x.replace(",", ".")));
}

/**
 * Cifras de la respuesta que no están en los datos entregados al modelo.
 * Un modelo pequeño a veces combina o inventa números: esa respuesta se descarta.
 */
export function inventedFigures(answer: string, data: string): number[] {
  const given = figures(data);
  return figures(answer).filter((n) => !given.some((g) => Math.abs(g - n) < 1e-9));
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
export function investigationCard(inv: Investigation): KnowledgeCard {
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
const NO_EVIDENCE_WORD = "NO_EVIDENCE";

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

/** Respuesta de un modelo de lenguaje, con lo que la respalda. */
interface ModelAnswer {
  text: string;
  /** Títulos de los documentos del almacén consultados (solo Gemini). */
  docs: string[];
  /** Fuentes del catálogo de las fichas que se le dieron como contexto (solo Ollama). */
  cited: string[];
  abstained: boolean;
  /** Modelo que respondió. */
  by: string;
}

const log = (msg: string): void => console.info(`[asistente] ${msg}`);

/** Instrucciones de sistema comunes a cualquier modelo: rol, reglas, idioma y contexto. */
function systemPrompt(lang: Lang, search: string, blocks: string[]): string {
  return [
    ...PERSONA,
    ...RULES,
    search,
    // El propio modelo responde en el idioma de la pregunta: no hay una segunda petición de traducción.
    `Answer in the same language as the user's question, whatever it is. If the language of the question is unclear, answer in ${lang === "es" ? "Spanish" : "English"}.`,
    `If the information is missing, start your answer with the marker ${NO_EVIDENCE} and then say, in the language of the question, that you could not find it in our NASA sources.`,
    "At most 130 words, short clear sentences, no tables, no headings.",
    ...blocks,
  ]
    .filter(Boolean)
    .join("\n");
}

/** El modelo avisó de que no encontró la respuesta. */
const abstains = (text: string): boolean => text.includes(NO_EVIDENCE_WORD) || text.includes(NO_ANSWER.es) || text.includes(NO_ANSWER.en);

/** La marca de abstención con o sin corchetes: los modelos pequeños a veces los omiten. */
const NO_EVIDENCE_MARK = /\[?NO_EVIDENCE\]?/g;

/**
 * Modelo de lenguaje del chat general: Gemini si hay clave y, si no, el del
 * equipo en Ollama. Sin ninguno, el asistente responde solo con sus fichas.
 */
export const assistantModel = (): "ollama" | "gemini" | "none" => (process.env.GEMINI_API_KEY ? "gemini" : ollamaConfig() ? "ollama" : "none");

/**
 * Consulta opcional al modelo de lenguaje, anclada a la ficha encontrada.
 * El orden depende del motor pedido (AssistantEngine).
 */
async function askModel(question: string, card: KnowledgeCard | null, lang: Lang, ctx: ChatContext = {}, more: ModelExtras = {}): Promise<ModelAnswer | null> {
  const finding = more.pack ? [findingBlock(more.pack), ...(more.notes ?? [])].join("\n") : "";
  if (more.engine === "fast") return null;
  if (more.engine === "local") return askLocalModel(question, card, lang, ctx, more);
  const cloud = await askGemini(question, card, lang, ctx, finding, more.history);
  if (cloud && !cloud.abstained) return cloud;
  // Gemini no respondió o se abstuvo: segundo intento con el modelo de Ollama,
  // con un tope de tiempo para que los dos intentos quepan en los 30 s de la ruta.
  const local = await askLocalModel(question, card, lang, ctx, { ...more, timeout: FALLBACK_TIMEOUT_MS });
  return local && !local.abstained ? local : (cloud ?? local);
}

/** Tiempo máximo de cada consulta al modelo en el Analista PSI: caben dos en los 30 s de la ruta. */
const LOCAL_TIMEOUT_MS = 13000;

/** Con qué empieza una respuesta razonada, para que también se oiga al leerla en voz alta. */
const EXTRAPOLATION_NOTE: Record<Lang, string> = {
  es: "No encontré un dato de NASA PSI que responda exactamente eso. Como razonamiento de ingeniería, no como dato medido:",
  en: "I found no NASA PSI data that answers exactly that. As engineering reasoning, not as a measured fact:",
};

/** Rol del modelo cuando razona sin datos: ingeniero aeroespacial de seguridad contra incendios. */
const ENGINEER: Record<Lang, string> = {
  es: [
    "Eres Flamey, ingeniero aeroespacial especialista en seguridad contra incendios en naves, trajes y hábitats espaciales, del equipo Andora Labs. No eres la NASA ni hablas en su nombre.",
    "Los datos de NASA PSI no responden esta pregunta. Razona como ingeniero a partir de principios físicos conocidos: si el material arde o se oxida, cuánto oxígeno y qué presión hay en el ambiente, la gravedad, las fuentes de ignición, cómo conduce el calor y la electricidad, y qué función cumpliría la pieza.",
    "Responde en español, en un máximo de 80 palabras, con frases cortas, sin títulos, sin listas y sin asteriscos. Empieza por la conclusión.",
    "No des cifras. No cites normas, misiones, estudios ni fuentes concretas. Termina diciendo qué habría que ensayar para confirmarlo.",
    "Si la pregunta no tiene que ver con la ingeniería espacial, dilo en una sola frase.",
  ].join("\n"),
  en: [
    "You are Flamey, an aerospace engineer specialised in fire safety for spacecraft, suits and space habitats, from team Andora Labs. You are not NASA and do not speak for NASA.",
    "NASA PSI data does not answer this question. Reason as an engineer from known physical principles: whether the material burns or oxidises, how much oxygen and what pressure the environment has, gravity, ignition sources, how it conducts heat and electricity, and what role the part would play.",
    "Answer in English, in at most 80 words, with short sentences, no headings, no lists and no asterisks. Start with the conclusion.",
    "Give no figures. Do not cite standards, missions, studies or specific sources. End by saying what would have to be tested to confirm it.",
    "If the question has nothing to do with space engineering, say so in a single sentence.",
  ].join("\n"),
};

/**
 * Razonamiento del modelo cuando los datos no cubren la pregunta (solo en el
 * Analista PSI, con un modelo de Ollama elegido). No es evidencia: no puede
 * traer cifras y siempre se entrega marcado como razonamiento.
 * @param related Fichas cercanas a la pregunta, como contexto que puede no aplicar.
 */
async function extrapolate(question: string, lang: Lang, model: string | undefined, related: string[]): Promise<{ text: string; by: string } | null> {
  const base = ollamaConfig();
  // OLLAMA_REASONING=off lo apaga: un modelo pequeño razona mal y conviene poder desactivarlo.
  if (!base || process.env.OLLAMA_REASONING?.trim().toLowerCase() === "off") return null;
  const cfg = { ...base, ...(model ? { model } : {}), timeout: Math.min(base.timeout, LOCAL_TIMEOUT_MS) };
  const context = related.length ? `${lang === "es" ? "Contexto de la plataforma (puede no aplicar)" : "Platform context (may not apply)"}:\n${related.map((r) => `- ${r}`).join("\n")}\n\n` : "";
  const user = `${context}${lang === "es" ? "Pregunta" : "Question"}: ${question}`;
  log(`pregunta="${question.slice(0, 80)}" modelo=ollama:${cfg.model || "automático"} razonamiento sin datos`);
  const text = await askOllama(cfg, ENGINEER[lang], user, log);
  if (!text || abstains(text)) return null;
  // Sin fuente no hay cifra: cualquier número que no venga del contexto descarta el razonamiento.
  const invented = inventedFigures(text, user);
  if (invented.length) {
    log(`el razonamiento trae cifras sin fuente (${invented.join(", ")}): se descarta`);
    return null;
  }
  return { text: `${EXTRAPOLATION_NOTE[lang]} ${text.replace(NO_EVIDENCE_MARK, "").trim()}`, by: `ollama:${(await resolveModel(cfg)) ?? ""}` };
}

/** Temas cuya respuesta sale de las filas del hallazgo; el resto no las muestra como respaldo. */
const BACKED_BY_ROWS: ReadonlySet<string> = new Set(["why", "evidence", "speed", "conditions", "pending"]);

/** Tiempo máximo del modelo de Ollama cuando actúa de respaldo de Gemini. */
const FALLBACK_TIMEOUT_MS = 12000;

/** Lo que acompaña a una consulta al modelo además de la pregunta y la ficha. */
interface ModelExtras {
  /** Hallazgo de PSI fijado. */
  pack?: FindingPack | null;
  /** Datos calculados que se añaden al hallazgo (por ejemplo, su comparación con el traje). */
  notes?: string[];
  /** Turnos anteriores de la conversación. */
  history?: ChatTurn[];
  engine?: AssistantEngine;
  model?: string;
  /** Tope de tiempo (ms) para el modelo de Ollama en esta consulta. */
  timeout?: number;
}

/**
 * Instrucciones para el modelo de Ollama: cortas y en el idioma de la pregunta.
 * Los modelos pequeños (1–3 B) no siguen un prompt largo en inglés, así que
 * reciben las mismas reglas de rigor resumidas, como en el Flamey de Johnatan.
 */
function localSystem(lang: Lang): string {
  const es = lang === "es";
  const format = es
    ? "Responde en español, claro y breve: máximo 70 palabras, frases cortas, sin títulos, sin listas y sin asteriscos. Primero la conclusión, después el dato que la respalda y su límite."
    : "Answer in English, clear and brief: at most 70 words, short sentences, no headings, no lists, no asterisks. Conclusion first, then the supporting fact and its limit.";
  return (
    es
      ? [
          "Eres Flamey, asistente de seguridad contra incendios en naves, estaciones y bases espaciales, del equipo Andora Labs. No eres la NASA ni hablas en su nombre.",
          format,
          "Usa solo los DATOS que recibes. Repite las cifras tal como están; no calcules ni inventes otras.",
          "En gravedad parcial (Luna, Marte) no hay mediciones directas: es una predicción y debes decirlo.",
          `Si los DATOS no responden la pregunta, escribe solo: ${NO_EVIDENCE}`,
        ]
      : [
          "You are Flamey, a fire-safety assistant for spacecraft, stations and space bases, built by team Andora Labs. You are not NASA and do not speak for NASA.",
          format,
          "Use only the DATA you receive. Repeat figures exactly as given; never compute or invent others.",
          "Partial gravity (Moon, Mars) has no direct measurements: it is a prediction and you must say so.",
          `If the DATA does not answer the question, write only: ${NO_EVIDENCE}`,
        ]
  ).join("\n");
}

/**
 * Prevención para la tercera parte de un hallazgo: la primera frase de la
 * ficha de supresión, con su fuente. No se redacta ninguna recomendación propia.
 */
function prevention(lang: Lang): { text: string; sources: string[] } {
  const card = KNOWLEDGE.find((k) => k.id === "suppression");
  const first = card?.text[lang].split(/(?<=\.)\s/)[0] ?? "";
  return { text: first, sources: first ? (card?.sources ?? []) : [] };
}

/** El escenario en pantalla, ya calculado por el motor físico, en una o dos frases. */
function scenarioData(ctx: ChatContext, lang: Lang): string {
  if (ctx.o2 == null || ctx.p == null || ctx.g == null) return "";
  if (ctx.mat && ctx.mat in MATERIALS) return scenarioVerdict(ctx.mat as MaterialId, { ...ctx, g: ctx.g, o2: ctx.o2, p: ctx.p }, lang).text;
  const env = getModule(ctx.module);
  return lang === "es"
    ? `Escenario en pantalla: ${env ? env.name.es : "sin módulo"}, gravedad ${ctx.g} g, oxígeno ${ctx.o2} % a ${ctx.p} kPa.`
    : `Scenario on screen: ${env ? env.name.en : "no module"}, gravity ${ctx.g} g, oxygen ${ctx.o2}% at ${ctx.p} kPa.`;
}

/**
 * Consulta al modelo de Ollama. No tiene buscador de documentos: recibe como
 * datos el hallazgo de PSI, el escenario calculado o las fichas de conocimiento
 * más cercanas a la pregunta, y solo se le pregunta si hay algún dato que darle.
 */
async function askLocalModel(question: string, card: KnowledgeCard | null, lang: Lang, ctx: ChatContext, more: ModelExtras): Promise<ModelAnswer | null> {
  const base = ollamaConfig();
  if (!base) return null;
  const cfg = { ...base, ...(more.model ? { model: more.model } : {}), ...(more.timeout ? { timeout: Math.min(base.timeout, more.timeout) } : {}) };
  const pack = more.pack ?? null;
  // La sección local busca en toda la base de conocimiento; el chat general, en sus fichas.
  const pool = more.engine === "local" ? knowledgeBase(investigationCard) : KNOWLEDGE;
  // Un hallazgo de PSI trae su propia evidencia y una ficha ya elegida basta:
  // con más de un tema, un modelo pequeño mezcla los datos de uno con otro.
  const extra =
    pack || card
      ? []
      : rankCards(question, pool)
          .filter((r) => r.score >= 2)
          .slice(0, CONTEXT_CARDS)
          .map((r) => r.card);
  const cards = [...(card ? [card] : []), ...extra];
  const data = [pack ? findingSummary(pack, lang) : "", ...(more.notes ?? []), scenarioData(ctx, lang), ...cards.map((c) => c.text[lang])].filter(Boolean);
  if (!data.length) return null;
  const user = `${lang === "es" ? "DATOS" : "DATA"}:\n${data.map((d) => (d.startsWith("- ") ? d : `- ${d}`)).join("\n")}\n\n${lang === "es" ? "Pregunta" : "Question"}: ${question}`;
  // Solo los dos últimos mensajes: con más historial, un modelo pequeño se repite.
  const history = (more.history ?? []).slice(-LOCAL_TURNS).map((turn) => ({ role: turn.role === "user" ? ("user" as const) : ("assistant" as const), content: turn.text }));
  log(`pregunta="${question.slice(0, 80)}" modelo=ollama:${cfg.model || "automático"} datos=${pack ? "hallazgo PSI" : cards.map((c) => c.id).join(",") || "escenario"} turnos=${history.length}`);
  const text = await askOllama(cfg, localSystem(lang), user, log, history);
  if (!text) return null;
  // Las cifras pueden venir de los datos o de lo ya dicho en la conversación.
  const invented = inventedFigures(text, [user, ...history.map((turn) => turn.content)].join("\n"));
  if (invented.length) {
    log(`Ollama escribió cifras que no están en los datos (${invented.join(", ")}): se descarta la respuesta`);
    return null;
  }
  // Un hallazgo se explica con sus cifras: una respuesta sin ninguna es relleno del modelo.
  if (pack && !abstains(text) && figures(text).length === 0) {
    log("Ollama explicó el hallazgo sin citar ninguna cifra de los datos: se descarta la respuesta");
    return null;
  }
  return { text: text.replace(NO_EVIDENCE_MARK, "").trim(), docs: [], cited: [...new Set(extra.flatMap((c) => c.sources))], abstained: abstains(text), by: `ollama:${(await resolveModel(cfg)) ?? ""}` };
}

/** Consulta a Gemini con File Search. */
async function askGemini(question: string, card: KnowledgeCard | null, lang: Lang, ctx: ChatContext = {}, finding = "", history: ChatTurn[] = []): Promise<ModelAnswer | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  const store = process.env.FILE_SEARCH_STORE?.trim();
  const scenario = scenarioBlock(ctx);
  const system = systemPrompt(
    lang,
    "Always search the file-search documents before answering. Most are written in English: search with English terms and acronyms even when the question is in Spanish. The project document also holds a bank of questions and answers about the platform.",
    [scenario, finding, card ? `Context:\n${card.text[lang]}` : ""],
  );
  const started = Date.now();
  log(`pregunta="${question.slice(0, 80)}" modelo=${model} almacén=${store ? (STORE_FORMAT.test(store) ? "configurado" : "FORMATO INVÁLIDO (debe ser fileSearchStores/...)") : "SIN CONFIGURAR"} ficha=${card?.id ?? "ninguna"}`);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [...history.slice(-HISTORY_TURNS).map((turn) => ({ role: turn.role === "user" ? "user" : "model", parts: [{ text: turn.text }] })), { role: "user", parts: [{ text: question }] }],
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
    const abstained = !!text && abstains(text);
    log(`respuesta en ${Date.now() - started} ms · fin=${cand?.finishReason ?? "?"} · fuentes=${docs.length}${docs.length ? ` [${docs.map((d) => d.slice(0, 40)).join(" | ")}]` : " (SIN FUENTES del almacén)"} · texto=${text ? `${text.length} caracteres` : "vacío"}${abstained ? " · el modelo se abstuvo" : ""}`);
    return text && grounded ? { text: text.replace(NO_EVIDENCE_MARK, "").trim(), docs, cited: [], abstained, by: "gemini" } : null;
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
export async function answerQuestion(asked: string, hint: Lang, ctx: ChatContext = {}, history: ChatTurn[] = [], options: AnswerOptions = {}): Promise<ChatAnswer> {
  const question = followUp(asked, history);
  const engine = options.engine ?? "auto";
  // En el Analista PSI cada consulta al modelo tiene un tope: puede haber una segunda, de razonamiento.
  const run = { engine, model: options.model, ...(engine === "local" ? { timeout: LOCAL_TIMEOUT_MS } : {}) };

  const pool = run.engine === "auto" ? KNOWLEDGE : knowledgeBase(investigationCard);
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
  if (pack && run.engine !== "auto") {
    // Flamey local: los temas de dato exacto se responden con los campos del
    // backend, haya o no modelo, para que ninguna cifra dependa de su redacción.
    const topicId = detectTopic(question);
    const next = pendingTopics(pack, new Set([...(options.covered ?? []), ...(topicId ? [topicId] : [])]));
    const closing = next[0] ? `\n\n${topicAsk(next[0], lang)}` : "";
    const suggestions = next.slice(0, 3).map((id) => topicAsk(id, lang));
    const rows = pack.evidence.slice(0, 6);
    if (topicId) {
      const answer = topicAnswer(topicId, pack, lang, {
        suit: topicId === "suit" && SUIT_MODULE && pack.environment.key !== "eva" ? await findingPack(pack.finding.key, SUIT_MODULE) : null,
        ladder: topicId === "replace" ? await ladderFor(pack.environment) : null,
        suppression: topicId === "extinguish" ? KNOWLEDGE.find((k) => k.id === "suppression")?.text[lang] : undefined,
      });
      if (answer) return { lang, text: `${answer.text}${closing}`, origin: "psi", sources: cite(["PSI", ...answer.sources]), rows: BACKED_BY_ROWS.has(topicId) ? rows : undefined, suggestions, topic: topicId };
    }
    // Explicación general: el modelo redacta con las cifras del hallazgo y lo que
    // el backend dice del avance de la llama; si falla, quedan las cifras ordenadas.
    const notes = [topicAnswer("speed", pack, lang)?.text ?? ""].filter(Boolean);
    const explained = await askModel(question, null, lang, {}, { pack, notes, history, ...run });
    const used = explained && !explained.abstained ? explained : null;
    // El modelo dice que los datos del hallazgo no responden la pregunta: razona como ingeniero, y se marca así.
    if (explained?.abstained) {
      const reasoned = await extrapolate(question, lang, run.model, [findingSummary(pack, lang)]);
      if (reasoned) return { lang, text: reasoned.text, origin: "none", sources: [], by: reasoned.by, extrapolated: true, suggestions };
    }
    const tip = prevention(lang);
    return {
      lang,
      text: `${used ? used.text : [findingSummary(pack, lang, tip.text), ...notes].join("\n\n")}${closing}`,
      origin: "psi",
      sources: cite(["PSI", ...(used ? [] : tip.sources)]),
      rows,
      by: used?.by,
      suggestions,
    };
  }
  if (pack) {
    // Como en el Flamey de Johnatan: si se pregunta por el traje, se trae el mismo hallazgo evaluado allí.
    const suit = ABOUT_SUIT.test(question) && SUIT_MODULE && pack.environment.key !== "eva" ? await findingPack(pack.finding.key, SUIT_MODULE) : null;
    const notes = suit ? [suitNote(pack, suit, lang)] : [];
    // Una pregunta sobre cómo apagar se responde con la ficha de supresión, que tiene fuente.
    const topic = ABOUT_SUPPRESSION.test(question) ? (KNOWLEDGE.find((k) => k.id === "suppression") ?? null) : null;
    // El escenario del Laboratorio no se mezcla: el hallazgo trae su propio ambiente.
    // Con la ficha de supresión, el modelo recibe solo esa ficha: mezclarla con el hallazgo lo confunde y lo alarga.
    const explained = topic ? await askModel(question, topic, lang, {}, run) : await askModel(question, null, lang, {}, { pack, notes, history, ...run });
    const used = explained && !explained.abstained ? explained : null;
    const tip = prevention(lang);
    // Sin modelo: la ficha de supresión si se preguntó por ella; si no, las cifras del hallazgo.
    const text = used ? used.text : topic ? topic.text[lang] : [findingSummary(pack, lang, tip.text), ...notes].join("\n\n");
    const sources = [...cite(["PSI", ...(topic ? topic.sources : used ? [] : tip.sources)]), ...(used ? used.docs.map(citeDocument) : [])];
    return {
      lang,
      // Flamey cierra ofreciendo el siguiente paso; un "sí" lo retoma.
      text: topic ? text : `${text}\n\n${OFFER[lang]}`,
      origin: "psi",
      sources: sources.filter((x, i) => sources.findIndex((y) => y.id === x.id) === i).slice(0, 5),
      // La ficha de supresión es general: las filas del hallazgo no la respaldan.
      rows: topic ? undefined : pack.evidence.slice(0, 6),
      by: used?.by,
    };
  }
  // Explicación de un escenario probado en la pestaña de materiales: el modelo
  // de lenguaje interpreta las cifras del motor físico; sin él, queda la
  // conclusión calculada.
  if (ctx.explain && ctx.mat && ctx.mat in MATERIALS && ctx.g != null && ctx.o2 != null && ctx.p != null) {
    const verdict = scenarioVerdict(ctx.mat as MaterialId, { ...ctx, g: ctx.g, o2: ctx.o2, p: ctx.p }, lang);
    const explained = await askModel(question, null, lang, ctx, { history, ...run });
    if (explained && !explained.abstained) {
      const sources = [...verdict.sources, ...explained.docs.map(citeDocument)];
      return { ...verdict, lang, by: explained.by, text: explained.text, sources: sources.filter((x, i) => sources.findIndex((y) => y.id === x.id) === i).slice(0, 5) };
    }
    return { ...verdict, lang };
  }
  const analysis = analyse(question, ctx, lang);
  if (analysis) return { ...analysis, lang };
  // La ficha de la investigación nombrada tiene prioridad sobre la búsqueda por palabras.
  const named = findInvestigation(question);
  const found = named ? { card: investigationCard(named) } : searchCards(question, pool);
  // Analista PSI: si la pregunta nombra algo que los datos no tienen, el modelo razona como ingeniero.
  const generated = await askModel(question, found?.card ?? null, lang, ctx, { history, ...run });
  // Si el modelo se abstiene (aunque sea a medias), vale más la ficha verificada que una respuesta parcial.
  if (generated && !generated.abstained) {
    // Se citan los documentos consultados y, si la hubo, las fuentes de la ficha (sin duplicar).
    const sources = [...generated.docs.map(citeDocument), ...cite([...(found?.card.sources ?? []), ...generated.cited])];
    const unique = sources.filter((x, i) => sources.findIndex((y) => y.id === x.id) === i).slice(0, 5);
    return { lang, text: generated.text, origin: "documents", sources: unique, evidence: found?.card.evidence, by: generated.by };
  }
  // Analista PSI: los datos verificados van primero. Solo si el modelo dice que no responden la
  // pregunta, o no hay ninguna ficha, razona como ingeniero; ese texto se marca como razonamiento.
  if (engine === "local" && (generated?.abstained || !found)) {
    const reasoned = await extrapolate(question, lang, run.model, found ? [found.card.text[lang]] : []);
    // Un modelo pequeño también se abstiene donde no debe: la ficha verificada nunca se oculta,
    // va primero y el razonamiento queda debajo, marcado.
    if (reasoned && found) return { lang, text: `${found.card.text[lang]}\n\n${reasoned.text}`, origin: "documents", sources: cite(found.card.sources), evidence: found.card.evidence, by: reasoned.by, extrapolated: true };
    if (reasoned) return { lang, text: reasoned.text, origin: "none", sources: [], by: reasoned.by, extrapolated: true };
  }
  if (found) return { lang, text: found.card.text[lang], origin: "documents", sources: cite(found.card.sources), evidence: found.card.evidence };
  // Sin evidencia: en español o inglés, el texto aprobado; en otro idioma, la frase del propio modelo.
  const own = generated?.abstained && detectLang(question) === null && generated.text ? generated.text : NO_ANSWER[lang];
  return { lang, text: own, origin: "none", sources: [] };
}

/** Número de preguntas preparadas y fichas (para el estado del sistema). */
export const assistantStats = (): { prepared: number; cards: number; model: ReturnType<typeof assistantModel> } => ({ prepared: FAQ.length, cards: KNOWLEDGE.length, model: assistantModel() });
