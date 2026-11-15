import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { answerQuestion, assistantModel, followUp } from "./assistant.service";

const OLLAMA = "http://ollama.test:11434";
const SCENARIO = { explain: true, mat: "pmma", module: "iss", g: 0, o2: 21, p: 101.3, vent: 10 };

/** Simula el servidor de Ollama y registra lo que se le envía. */
function ollama(reply: Response): ReturnType<typeof vi.fn> {
  const mock = vi.fn(async () => reply);
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  vi.stubEnv("OLLAMA_BASE_URL", `${OLLAMA}/`);
  vi.stubEnv("OLLAMA_MODEL", "flamey");
  vi.stubEnv("GEMINI_API_KEY", "");
  vi.stubEnv("API_BASE_URL", "");
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("asistente con el modelo de Ollama", () => {
  it("usa Ollama cuando está configurado", () => {
    expect(assistantModel()).toBe("ollama");
  });

  it("envía el rol, las reglas y el resultado del modelo físico, y devuelve el texto de Ollama", async () => {
    const fetchMock = ollama(Response.json({ message: { role: "assistant", content: "<think>borrador</think>El PMMA supera su frontera." } }));
    const a = await answerQuestion("Explícame este resultado", "es", SCENARIO);
    expect(a.text).toBe("El PMMA supera su frontera.");
    expect(a.origin).toBe("analysis");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${OLLAMA}/api/chat`);
    const sent = JSON.parse(String(init.body)) as { model: string; stream: boolean; messages: { role: string; content: string }[] };
    expect(sent.model).toBe("flamey");
    expect(sent.stream).toBe(false);
    // Instrucciones cortas y en el idioma de la pregunta; las cifras van como datos.
    expect(sent.messages[0]?.content).toContain("Eres Flamey");
    expect(sent.messages[1]?.content).toContain("DATOS:");
    expect(sent.messages[1]?.content).toContain("% O₂");
    expect(sent.messages[1]?.content).toContain("Pregunta: Explícame este resultado");
  });

  it("una pregunta en inglés lleva las instrucciones en inglés", async () => {
    const fetchMock = ollama(Response.json({ message: { content: "PMMA exceeds its boundary." } }));
    const a = await answerQuestion("Explain this result to me", "es", SCENARIO);
    expect(a.lang).toBe("en");
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body)) as { messages: { content: string }[] };
    expect(sent.messages[0]?.content).toContain("You are Flamey");
    expect(sent.messages[1]?.content).toContain("Question: Explain this result to me");
  });

  it("sin OLLAMA_MODEL elige un modelo instalado, con preferencia por qwen2.5", async () => {
    vi.stubEnv("OLLAMA_MODEL", "");
    vi.stubEnv("OLLAMA_BASE_URL", "http://otro.test:11434");
    const mock = vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith("/api/tags") ? Response.json({ models: [{ name: "gemma3:1b" }, { name: "qwen2.5:1.5b" }] }) : Response.json({ message: { content: "Respuesta." } }),
    );
    vi.stubGlobal("fetch", mock);
    await answerQuestion("Explícame este resultado", "es", SCENARIO);
    const chat = mock.mock.calls.find(([u]) => String(u).endsWith("/api/chat")) as unknown as [string, RequestInit];
    expect((JSON.parse(String(chat[1].body)) as { model: string }).model).toBe("qwen2.5:1.5b");
  });

  it("si el modelo se niega a responder, queda la conclusión calculada", async () => {
    ollama(Response.json({ message: { content: "Lo siento, no puedo ayudar con eso." } }));
    const a = await answerQuestion("Explícame este resultado", "es", SCENARIO);
    expect(a.text).toContain("% O₂");
  });

  it("si el modelo escribe una cifra que no estaba en los datos, se descarta su respuesta", async () => {
    ollama(Response.json({ message: { content: "El PMMA puede alcanzar un 87,3 % de oxígeno." } }));
    const a = await answerQuestion("Explícame este resultado", "es", SCENARIO);
    expect(a.text).not.toContain("87,3");
    expect(a.text).toContain("Frontera estimada");
  });

  it("envía al modelo los turnos anteriores de la conversación", async () => {
    const fetchMock = ollama(Response.json({ message: { content: "Sigue por encima de su frontera." } }));
    await answerQuestion("Explícame este resultado", "es", SCENARIO, [
      { role: "user", text: "Hola" },
      { role: "bot", text: "Hola, soy Flamey." },
    ]);
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body)) as { messages: { role: string; content: string }[] };
    expect(sent.messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"]);
    expect(sent.messages[2]?.content).toBe("Hola, soy Flamey.");
  });

  it("un sí retoma la última pregunta que hizo Flamey", () => {
    const history = [{ role: "bot" as const, text: "El riesgo es alto.\n\n¿Quieres saber cómo se apaga una llama así?" }];
    expect(followUp("Sí", history)).toBe("¿Cómo se apaga una llama así?");
    expect(followUp("sí, por favor", history)).toBe("¿Cómo se apaga una llama así?");
    expect(followUp("¿Qué es el RPI?", history)).toBe("¿Qué es el RPI?");
    expect(followUp("Sí", [{ role: "bot", text: "Sin pregunta." }])).toBe("Sí");
  });

  it("una abstención sin corchetes no se muestra como respuesta", async () => {
    ollama(Response.json({ message: { content: "NO_EVIDENCE" } }));
    const a = await answerQuestion("Explícame este resultado", "es", SCENARIO);
    expect(a.text).not.toContain("NO_EVIDENCE");
    expect(a.text).toContain("Frontera estimada");
  });

  it("si Ollama falla, queda la conclusión calculada por el motor físico", async () => {
    ollama(new Response("model not found", { status: 404 }));
    const a = await answerQuestion("Explícame este resultado", "es", SCENARIO);
    expect(a.origin).toBe("analysis");
    expect(a.text).toContain("% O₂");
  });

  it("sin contexto que darle, no se consulta al modelo y el asistente se abstiene", async () => {
    const fetchMock = ollama(Response.json({ message: { content: "invento" } }));
    const a = await answerQuestion("zzqx wvvk plmn", "es");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(a.origin).toBe("none");
  });
});
