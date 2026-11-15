/**
 * Respuestas por tema sobre un hallazgo de NASA PSI, armadas con los datos del
 * backend del equipo (emberwatch), sin modelo de lenguaje. Es el "motor de
 * datos" del Flamey de Johnatan adaptado a la plataforma: cada tema se reconoce
 * por palabras de la pregunta y se responde con los campos del backend, de modo
 * que las cifras nunca dependen de lo que redacte un modelo.
 *
 * El significado de cada factor del índice RPI sale de su fórmula en el
 * backend (api/app/engine/kernel.py), no de su nombre.
 */
import { l, type L, type Lang } from "@/content/i18n";
import type { FindingPack, LadderStep } from "@/features/psi/server/psi.service";
import { BAND, FACTOR } from "./findingText";

export type TopicId = "why" | "suit" | "replace" | "extinguish" | "evidence" | "speed" | "conditions" | "pending";

interface TopicDef {
  id: TopicId;
  /** Palabras de la pregunta que activan el tema (sin tildes, en minúsculas). */
  match: RegExp;
  /** Pregunta con la que Flamey ofrece el tema; es también el texto del botón. */
  ask: L;
}

/** Temas en el orden en que se revisan: gana el primero que coincide. */
export const TOPICS: TopicDef[] = [
  { id: "suit", match: /\beva\b|\btraje|\bspacesuit|\bsuit\b/, ask: l("¿Y en el traje EVA?", "And in the EVA suit?") },
  { id: "extinguish", match: /\bapag|\bextingu|\bextint|\bsupres|\bsofoc|put out|\bsuppress/, ask: l("¿Cómo se apaga una llama así?", "How is a flame like this put out?") },
  { id: "replace", match: /\breempl|\bsustit|\balternativ|otro material|no arde|\breplace|\bsubstitut|other material|not burn/, ask: l("¿Qué material no arde aquí?", "Which material does not burn here?") },
  { id: "pending", match: /falta por verificar|sin verificar|\bpendiente|\bincertidumbre|\bunverified|\buncertain|remains to/, ask: l("¿Qué falta por verificar?", "What remains unverified?") },
  { id: "evidence", match: /\bconfiab|\bfiable|\bevidenc|\bcorrida|\bcalidad|cuantos datos|cuantas observaciones|\breliab|\bquality|how many observations/, ask: l("¿Es confiable el dato?", "Is the data reliable?") },
  { id: "speed", match: /\bvelocidad|\brapid|\bavanza|\bpropag|\bspeed|\bfast|\bspread/, ask: l("¿Qué tan rápido avanza?", "How fast does it spread?") },
  { id: "conditions", match: /\bcondicion|se probo|como se hizo|\bensay|\bpresion|\bgravedad|\boxigeno|\bcondition|\btested|\bpressure|\bgravity|\boxygen/, ask: l("¿Cómo se probó?", "How was it tested?") },
  { id: "why", match: /por que|\bcausa|\brazon|\bmotivo|\briesgo|\bpeligro|\bfactor|que pesa|\bwhy\b|\bcause|\breason|\brisk|\bdanger/, ask: l("¿Por qué ese riesgo?", "Why that risk?") },
];

/** Orden en que se ofrecen los temas al cerrar una respuesta y en los botones. */
const ASK_ORDER: TopicId[] = ["why", "suit", "speed", "conditions", "evidence", "replace", "extinguish", "pending"];

const plain = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Tema de una pregunta, o `null` si no se reconoce ninguno. */
export function detectTopic(question: string): TopicId | null {
  const q = plain(question);
  return TOPICS.find((topic) => topic.match.test(q))?.id ?? null;
}

/** Qué mide cada factor del RPI, según su fórmula en el backend. */
const FACTOR_MEANING: Record<string, L> = {
  o2_margin: l("el oxígeno del ambiente supera el mínimo que el material necesita para sostener la llama", "the environment's oxygen exceeds the minimum the material needs to sustain a flame"),
  o2_extrapolation: l("el oxígeno del ambiente está por encima del máximo que se ensayó", "the environment's oxygen is above the highest value tested"),
  pressure_extrapolation: l("la presión del ambiente se aleja de la presión del ensayo", "the environment's pressure is far from the test pressure"),
  gravity_extrapolation: l("la gravedad del ambiente se aleja de la gravedad del ensayo", "the environment's gravity is far from the test gravity"),
  soot_load: l("el material tiende a producir hollín o partículas", "the material tends to produce soot or particles"),
  cool_flame: l("indicador de llama fría; sin un registro directo se estima a partir del hollín", "cool-flame indicator; without a direct record it is estimated from soot"),
  evidence_weakness: l("la fila de origen tenía datos incompletos o inferidos", "the source row had incomplete or inferred data"),
  material_fit: l("esa clase de material está presente en ese ambiente", "that class of material is present in that environment"),
  egress_window: l("la tripulación dispone de poco tiempo para evacuar", "the crew has little time to evacuate"),
  measured_sustain: l("combustión sostenida medida; vale 50 cuando no hay medición", "measured sustained burning; it is 50 when there is no measurement"),
  evidence_density: l("lo respaldan muchas observaciones (el índice sube con más datos)", "it is backed by many observations (the index rises with more data)"),
};

/** Lo que el backend dice sobre el avance de la llama en la fila más representativa. */
export type Burn =
  | { kind: "measured"; rate: number }
  | { kind: "measured-none" }
  | { kind: "projected"; rate: number }
  | { kind: "quenched"; limit: number };

/**
 * Lee del texto del backend si la velocidad de la llama se midió o se proyectó.
 * Las cuatro frases posibles salen de api/app/engine/kernel.py (`narrative`).
 */
export function parseBurn(narrative: string | null | undefined): Burn | null {
  if (!narrative) return null;
  const number = (raw: string | undefined): number => Number((raw ?? "").replace(",", "."));
  if (/Medici[oó]n directa[^.]*no sostuvo propagaci[oó]n/i.test(narrative)) return { kind: "measured-none" };
  const measured = /Medici[oó]n directa[^:]*:\s*([\d.,]+?)\s*mm\/s/i.exec(narrative);
  if (measured) return { kind: "measured", rate: number(measured[1]) };
  const quenched = /Proyecci[oó]n:\s*extinci[oó]n[^\d]*([\d.,]+?)\s*%/i.exec(narrative);
  if (quenched) return { kind: "quenched", limit: number(quenched[1]) };
  const projected = /Proyecci[oó]n:\s*propagaci[oó]n de\s*([\d.,]+?)\s*mm\/s/i.exec(narrative);
  if (projected) return { kind: "projected", rate: number(projected[1]) };
  return null;
}

/** Temas que tienen datos para este hallazgo. */
export function availableTopics(pack: FindingPack): TopicId[] {
  return ASK_ORDER.filter((id) => {
    if (id === "suit") return pack.environment.key !== "eva";
    if (id === "speed") return parseBurn(pack.finding.narrative) !== null;
    if (id === "why") return pack.factors.length > 0;
    return true;
  });
}

/** Temas que aún no se han tocado en la conversación, en el orden en que se ofrecen. */
export function pendingTopics(pack: FindingPack, covered: ReadonlySet<string>): TopicId[] {
  return availableTopics(pack).filter((id) => !covered.has(id));
}

export const topicAsk = (id: TopicId, lang: Lang): string => TOPICS.find((topic) => topic.id === id)?.ask[lang] ?? "";

/** Datos que algunos temas necesitan además del hallazgo. */
export interface TopicExtras {
  /** El mismo hallazgo evaluado en el traje EVA. */
  suit?: FindingPack | null;
  /** Escalón de la escalera de oxígeno del backend para este ambiente. */
  ladder?: LadderStep | null;
  /** Ficha de supresión de la plataforma (con fuente). */
  suppression?: string;
}

export interface TopicAnswer {
  text: string;
  /** Fuentes del catálogo que respaldan el texto, además de PSI. */
  sources: string[];
}

/**
 * Respuesta de un tema con los datos del backend, en el idioma pedido.
 * @returns `null` si el tema no tiene datos para este hallazgo.
 */
export function topicAnswer(id: TopicId, pack: FindingPack, lang: Lang, extras: TopicExtras = {}): TopicAnswer | null {
  const { finding: f, environment: e } = pack;
  const es = lang === "es";
  const n = (x: number, digits = 0): string => x.toFixed(digits).replace(".", es ? "," : ".");
  const pct = (fraction: number): string => (es ? `${n(fraction * 100)} %` : `${n(fraction * 100)}%`);
  const material = f.material ?? (es ? "la muestra" : "the sample");
  const band = BAND[f.band]?.[lang] ?? f.band;
  const partial = e.gravity_g > 0.02 && e.gravity_g < 0.9;
  const observations = es ? (f.observations === 1 ? "1 observación" : `${f.observations} observaciones`) : f.observations === 1 ? "1 observation" : `${f.observations} observations`;
  // Se compara lo mismo que se muestra (porcentajes enteros), para no decir "32 % supera 32 %".
  const beyondTested = f.o2_max != null && f.o2_max > 0 && Math.round(e.o2_fraction * 100) > Math.round(f.o2_max * 100);

  switch (id) {
    case "why": {
      const top = pack.factors.slice(0, 3);
      if (!top.length) return null;
      const lines = top.map((x) => `- **${FACTOR[x.name]?.[lang] ?? x.name} (+${n(x.contribution, 1)}):** ${FACTOR_MEANING[x.name]?.[lang] ?? x.name}.`);
      const head = es
        ? `El índice RPI de ${f.experiment} en ${e.label} es ${f.rpi} de 100 (${band}). Los tres factores que más puntos aportan:`
        : `The RPI of ${f.experiment} in ${e.label} is ${f.rpi} out of 100 (${band}). The three factors adding the most points:`;
      return { text: [head, ...lines].join("\n"), sources: [] };
    }
    case "suit": {
      const suit = extras.suit;
      if (!suit || e.key === "eva") return null;
      const diff = suit.finding.rpi - f.rpi;
      const verdict =
        Math.abs(diff) <= 2
          ? es ? "La diferencia es de 2 puntos o menos: el índice es prácticamente el mismo." : "The difference is 2 points or less: the index is practically the same."
          : diff > 0
            ? es ? `En el traje el índice es ${diff} puntos más alto.` : `In the suit the index is ${diff} points higher.`
            : es ? `En ${e.label} el índice es ${-diff} puntos más alto que en el traje.` : `In ${e.label} the index is ${-diff} points higher than in the suit.`;
      const where = es
        ? `En ${suit.environment.label} el aire tiene ${pct(suit.environment.o2_fraction)} de O₂ a ${n(suit.environment.pressure_atm, 2)} atm. Para este mismo hallazgo el RPI allí es ${suit.finding.rpi} de 100, y en ${e.label} es ${f.rpi} de 100.`
        : `In ${suit.environment.label} the air has ${pct(suit.environment.o2_fraction)} O₂ at ${n(suit.environment.pressure_atm, 2)} atm. For this same finding the RPI there is ${suit.finding.rpi} out of 100, and in ${e.label} it is ${f.rpi} out of 100.`;
      return { text: `${where} ${verdict}`, sources: [] };
    }
    case "extinguish": {
      const egress =
        e.egress_s == null
          ? ""
          : es
            ? ` En ${e.label} el backend da a la tripulación ${e.egress_s} segundos para evacuar.`
            : ` In ${e.label} the backend gives the crew ${e.egress_s} seconds to evacuate.`;
      if (!extras.suppression) return egress ? { text: egress.trim(), sources: [] } : null;
      return { text: `${extras.suppression}${egress}`, sources: ["B17"] };
    }
    case "replace": {
      const ladder = extras.ladder;
      if (!ladder) return null;
      const step = pct(ladder.o2);
      const where = e.key === "eva" ? (es ? "el traje" : "the suit") : es ? "una cabina" : "a cabin";
      const total = ladder.sustains.length + ladder.quenches.length;
      const text = ladder.quenches.length
        ? es
          ? `Según el modelo del backend, a ${step} de O₂ en ${where} no sostienen la llama: ${ladder.quenches.join(", ")}. Sí la sostienen ${ladder.sustains.length} de los ${total} materiales evaluados.`
          : `According to the backend model, at ${step} O₂ in ${where} these do not sustain a flame: ${ladder.quenches.join(", ")}. ${ladder.sustains.length} of the ${total} materials evaluated do sustain it.`
        : es
          ? `Según el modelo del backend, a ${step} de O₂ en ${where} los ${total} materiales evaluados sostienen la llama: ninguno de ellos es un reemplazo que no arda en ${e.label} (${pct(e.o2_fraction)} de O₂).`
          : `According to the backend model, at ${step} O₂ in ${where} all ${total} materials evaluated sustain a flame: none of them is a replacement that does not burn in ${e.label} (${pct(e.o2_fraction)} O₂).`;
      return { text, sources: [] };
    }
    case "evidence": {
      const quality = f.quality == null ? "" : es ? `, con una calidad media de ${pct(f.quality)}` : `, with a mean quality of ${pct(f.quality)}`;
      const files = f.sources?.length ? (es ? ` Archivos de origen: ${f.sources.slice(0, 3).join(", ")}.` : ` Source files: ${f.sources.slice(0, 3).join(", ")}.`) : "";
      const caution =
        f.observations < 5 || (f.quality != null && f.quality < 0.6)
          ? es ? " Conviene tomarlo con cautela: son pocas observaciones o su calidad es baja." : " Treat it with caution: there are few observations or their quality is low."
          : "";
      const relevance = f.relevance === "direct" ? (es ? " Su relevancia para la seguridad contra incendios es directa." : " Its relevance for fire safety is direct.") : f.relevance === "indirect" ? (es ? " Su relevancia es indirecta: aporta condiciones límite, no es el objeto del ensayo." : " Its relevance is indirect: it provides boundary conditions, it is not the object of the test.") : "";
      const text = es
        ? `De ${f.experiment} con ${material}, NASA PSI guarda ${observations}${quality}.${relevance}${caution}${files}`
        : `For ${f.experiment} with ${material}, NASA PSI holds ${observations}${quality}.${relevance}${caution}${files}`;
      return { text, sources: [] };
    }
    case "speed": {
      const burn = parseBurn(f.narrative);
      if (!burn) return null;
      const perMinute = (rate: number): string => n(rate * 6, 1);
      const text =
        burn.kind === "measured"
          ? es
            ? `El backend registra una medición directa en microgravedad: ${n(burn.rate, 2)} mm/s, unos ${perMinute(burn.rate)} cm por minuto. Es el valor medido en el ensayo: no cambia con el ambiente.`
            : `The backend records a direct microgravity measurement: ${n(burn.rate, 2)} mm/s, about ${perMinute(burn.rate)} cm per minute. It is the value measured in the test: it does not change with the environment.`
          : burn.kind === "measured-none"
            ? es ? "El backend registra una medición directa en microgravedad: la muestra no sostuvo la propagación." : "The backend records a direct microgravity measurement: the sample did not sustain flame spread."
            : burn.kind === "projected"
              ? es
                ? `No hay velocidad medida para este hallazgo. El modelo del backend proyecta para ${e.label} una propagación de ${n(burn.rate, 2)} mm/s, unos ${perMinute(burn.rate)} cm por minuto. Es una proyección, no una medición.`
                : `There is no measured rate for this finding. The backend model projects for ${e.label} a spread of ${n(burn.rate, 2)} mm/s, about ${perMinute(burn.rate)} cm per minute. It is a projection, not a measurement.`
              : es
                ? `El modelo del backend proyecta que en ${e.label} la llama se extingue: el oxígeno queda por debajo del límite de ${n(burn.limit)} % de O₂. Es una proyección, no una medición.`
                : `The backend model projects that in ${e.label} the flame goes out: oxygen is below the ${n(burn.limit)}% O₂ limit. It is a projection, not a measurement.`;
      return { text, sources: [] };
    }
    case "conditions": {
      const tested =
        f.o2_min == null || f.o2_max == null || f.o2_max <= 0
          ? es ? "La base no registra el oxígeno del ensayo" : "The database does not record the test oxygen"
          : es ? `El ensayo cubrió de ${pct(f.o2_min)} a ${pct(f.o2_max)} de O₂` : `The test covered ${pct(f.o2_min)} to ${pct(f.o2_max)} O₂`;
      const pressure = f.pressure_atm == null ? "" : es ? ` a una presión mediana de ${n(f.pressure_atm, 2)} atm` : ` at a median pressure of ${n(f.pressure_atm, 2)} atm`;
      const here = es
        ? ` ${e.label} tiene ${pct(e.o2_fraction)} de O₂ a ${n(e.pressure_atm, 2)} atm y ${n(e.gravity_g, e.gravity_g ? 3 : 0)} g.`
        : ` ${e.label} has ${pct(e.o2_fraction)} O₂ at ${n(e.pressure_atm, 2)} atm and ${n(e.gravity_g, e.gravity_g ? 3 : 0)} g.`;
      const beyond =
        beyondTested
          ? es ? " El ambiente supera el máximo de oxígeno ensayado: lo que se diga de él es una estimación." : " The environment exceeds the highest oxygen tested: anything said about it is an estimate."
          : "";
      return { text: `${tested}${pressure}.${here}${beyond}`, sources: [] };
    }
    case "pending": {
      const items: string[] = [];
      if (partial) items.push(es ? "PSI no tiene datos directos en gravedad parcial: para este ambiente todo es una proyección" : "PSI has no direct partial-gravity data: for this environment everything is a projection");
      if (beyondTested && f.o2_max != null) items.push(es ? `el ambiente (${pct(e.o2_fraction)} de O₂) supera el máximo ensayado (${pct(f.o2_max)})` : `the environment (${pct(e.o2_fraction)} O₂) exceeds the highest value tested (${pct(f.o2_max)})`);
      if (f.o2_max == null || f.o2_max <= 0) items.push(es ? "la base no registra el oxígeno del ensayo" : "the database does not record the test oxygen");
      const burn = parseBurn(f.narrative);
      if (burn && (burn.kind === "projected" || burn.kind === "quenched")) items.push(es ? "la velocidad de la llama es una proyección del modelo, no una medición" : "the flame speed is a model projection, not a measurement");
      if (f.relevance === "indirect") items.push(es ? "el experimento es de relevancia indirecta: no ensayó este escenario" : "the experiment is of indirect relevance: it did not test this scenario");
      if (f.observations < 5) items.push(es ? (f.observations === 1 ? "solo hay 1 observación" : `solo hay ${observations}`) : f.observations === 1 ? "there is only 1 observation" : `there are only ${observations}`);
      if (!items.length) return { text: es ? "Con los datos del backend no queda ningún punto pendiente señalado para este hallazgo en este ambiente." : "With the backend data, no pending point is flagged for this finding in this environment.", sources: [] };
      return { text: `${es ? "Queda por verificar:" : "Still to be verified:"}\n${items.map((item) => `- ${item.charAt(0).toUpperCase()}${item.slice(1)}.`).join("\n")}`, sources: [] };
    }
  }
}
