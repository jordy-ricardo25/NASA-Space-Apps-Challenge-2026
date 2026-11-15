/**
 * Cliente de Ollama (solo servidor): el modelo de lenguaje del equipo.
 *
 * Se activa con `OLLAMA_BASE_URL`. Usa la API nativa de Ollama (`POST /api/chat`),
 * sin dependencias, con los mismos ajustes que el Flamey de Johnatan
 * (github.com/JohnatanGuacho/flameynasa): modelos pequeños, respuesta corta,
 * el modelo se queda cargado 15 minutos y una negativa del modelo se descarta.
 * Si el servidor no responde a tiempo, devuelve `null` y el asistente sigue
 * con el siguiente proveedor o con sus fichas verificadas.
 */

/** Comienzos con los que un modelo pequeño se niega a responder en vez de usar los datos. */
const REFUSAL = /^(lo siento|disculpa|no puedo proporcionar|no puedo ayudar|como modelo|i'?m sorry|i cannot|i can'?t)/i;

/** Tiempo que se recuerda el modelo elegido de la lista de Ollama. */
const MODEL_TTL_MS = 60000;
let picked: { url: string; model: string; at: number } | null = null;

/** Tiempo máximo por defecto: la ruta del chat permite 30 s. */
const DEFAULT_TIMEOUT_MS = 25000;

export interface OllamaConfig {
  /** Dirección del servidor, sin barra final (por ejemplo http://localhost:11434). */
  url: string;
  /** Nombre del modelo; vacío para elegirlo de los instalados en Ollama. */
  model: string;
  /** Clave opcional, para un Ollama publicado detrás de un proxy con Bearer. */
  key?: string;
  timeout: number;
  /** Ventana de contexto pedida al modelo (tokens). */
  context: number;
  /** Tope de la respuesta (tokens). */
  predict: number;
}

/** Configuración de Ollama leída del entorno, o `null` si no está activado. */
export function ollamaConfig(): OllamaConfig | null {
  const url = process.env.OLLAMA_BASE_URL?.trim().replace(/\/+$/, "");
  if (!url) return null;
  const number = (raw: string | undefined, fallback: number): number => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    url,
    model: process.env.OLLAMA_MODEL?.trim() ?? "",
    key: process.env.OLLAMA_API_KEY?.trim() || undefined,
    timeout: number(process.env.OLLAMA_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    context: number(process.env.OLLAMA_NUM_CTX, 2048),
    predict: number(process.env.OLLAMA_NUM_PREDICT, 260),
  };
}

const auth = (cfg: OllamaConfig): Record<string, string> => (cfg.key ? { Authorization: `Bearer ${cfg.key}` } : {});

/** Orden de preferencia entre los modelos instalados (el del Flamey de Johnatan). */
const prefer = (names: string[]): string | undefined =>
  // Los modelos "coder" están hechos para programar, no para conversar.
  names.find((m) => m.includes("qwen2.5") && !m.includes("coder")) ?? names.find((m) => m.includes("1.5b") || m.includes("2b")) ?? names.find((m) => m.includes("1b")) ?? names[0];

/** Modelos instalados en Ollama; lista vacía si no responde. */
export async function listModels(cfg: OllamaConfig): Promise<string[]> {
  try {
    const res = await fetch(`${cfg.url}/api/tags`, { headers: auth(cfg), signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: { name?: string }[] };
    return (data.models ?? []).flatMap((m) => m.name ?? []);
  } catch {
    return [];
  }
}

/**
 * Modelo que se usa: el de `OLLAMA_MODEL` o, si está vacío, uno de los
 * instalados, con la misma preferencia que el Flamey de Johnatan
 * (qwen2.5, luego los de 1,5–2 B, luego los de 1 B, luego el primero).
 */
export async function resolveModel(cfg: OllamaConfig): Promise<string | null> {
  if (cfg.model) return cfg.model;
  if (picked && picked.url === cfg.url && Date.now() - picked.at < MODEL_TTL_MS) return picked.model;
  const model = prefer(await listModels(cfg));
  if (!model) return null;
  picked = { url: cfg.url, model, at: Date.now() };
  return model;
}

/**
 * Pregunta al modelo de Ollama con unas instrucciones de sistema.
 * Devuelve el texto de la respuesta o `null` si falló.
 */
export async function askOllama(
  cfg: OllamaConfig,
  system: string,
  question: string,
  log: (msg: string) => void,
  /** Turnos anteriores de la conversación, del más antiguo al más reciente. */
  history: { role: "user" | "assistant"; content: string }[] = [],
): Promise<string | null> {
  const started = Date.now();
  const model = await resolveModel(cfg);
  if (!model) {
    log("ERROR de Ollama: no responde o no tiene modelos instalados (ollama list)");
    return null;
  }
  try {
    const res = await fetch(`${cfg.url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth(cfg) },
      body: JSON.stringify({
        model,
        stream: false,
        keep_alive: "15m",
        messages: [
          { role: "system", content: system },
          ...history,
          { role: "user", content: question },
        ],
        // Sin azar: el modelo redacta cifras ya calculadas, no las crea.
        // La penalización por repetición evita que un modelo pequeño repita frases (ajustes de flameynasa).
        options: { temperature: 0, num_ctx: cfg.context, num_predict: cfg.predict, repeat_penalty: 1.2, repeat_last_n: 256 },
      }),
      signal: AbortSignal.timeout(cfg.timeout),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 400);
      log(`ERROR de Ollama: HTTP ${res.status} en ${Date.now() - started} ms — ${detail}`);
      return null;
    }
    const data = (await res.json()) as { message?: { content?: string }; done_reason?: string };
    // Los modelos con razonamiento pueden dejar su borrador entre <think>: no se muestra.
    const raw = (data.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    // Si el tope de tokens cortó la respuesta, se recorta a la última frase completa.
    const cut = data.done_reason === "length" ? raw.search(/[.!?](?=[^.!?]*$)/) : -1;
    const text = cut > 0 ? raw.slice(0, cut + 1) : raw;
    const refused = REFUSAL.test(text);
    log(`Ollama (${model}) respondió en ${Date.now() - started} ms · texto=${text ? `${text.length} caracteres` : "vacío"}${refused ? " · se negó: se descarta" : ""}`);
    return text && !refused ? text : null;
  } catch (e) {
    log(`ERROR al llamar a Ollama tras ${Date.now() - started} ms: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
    return null;
  }
}
