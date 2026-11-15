import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FindingPack } from "@/features/psi/server/psi.service";
import { findingBlock, findingSummary } from "../lib/findingText";
import { answerQuestion } from "./assistant.service";

const BACKEND = "https://backend.test";
const KEY = "bass2::PMMA::opposed";

/** Respuesta de `GET /api/findings/{clave}/context` con el contrato del backend. */
const CONTEXT = {
  finding: {
    key: KEY,
    experiment: "BASS-II",
    facility: "MSG",
    material: "PMMA",
    geometry: "rod",
    flame_mode: "opposed",
    o2_min: 0.17,
    o2_max: 0.21,
    pressure_atm: 1,
    observations: 129,
    quality: 0.95,
    rpi: 62,
    band: "high",
    relevance: "direct",
    factors: [
      { name: "soot_load", value: 20, weight: 0.1, contribution: 2 },
      { name: "o2_margin", value: 60, weight: 0.16, contribution: 9.6 },
      { name: "gravity_extrapolation", value: 70, weight: 0.13, contribution: 9.1 },
      { name: "material_fit", value: 68, weight: 0.11, contribution: 7.48 },
    ],
    narrative: "texto del backend",
    sources: ["psi_025_bass_2.csv"],
    rules: [],
  },
  environment: { key: "lunar", label: "Base lunar", gravity_g: 0.165, o2_fraction: 0.32, pressure_atm: 0.558, diluent: "O2/N2", egress_s: 300, caption: "", material_fit: 0.8 },
  evidence: [{ file: "psi_025_bass_2.csv", row: 7, quality: 0.9, flags: [], raw: { o2: "0.19" } }],
  messages: [
    { role: "system", content: "reglas" },
    { role: "user", content: "Evidencia: psi_025_bass_2.csv fila 7" },
  ],
  response_schema: {},
  provider: "sin clave",
};

const json = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

/** Simula el backend: contexto del hallazgo y metadatos; el resto falla. */
function backend(context: unknown | null): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/context")) return context ? json(context) : new Response("no", { status: 404 });
    return new Response("no", { status: 503 });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", BACKEND);
  vi.stubEnv("GEMINI_API_KEY", "");
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("asistente con un hallazgo de PSI fijado", () => {
  it("responde con las cifras del backend, en el idioma de la pregunta", async () => {
    const fetchMock = backend(CONTEXT);
    vi.stubGlobal("fetch", fetchMock);
    const a = await answerQuestion("Explícame el hallazgo BASS-II · PMMA y qué significa en este ambiente.", "es", { finding: { key: KEY, env: "base" } });
    expect(a.origin).toBe("psi");
    expect(a.lang).toBe("es");
    expect(a.text).toContain("BASS-II (MSG), PMMA, contra el flujo");
    expect(a.text).toContain("129 observaciones");
    expect(a.text).toContain("62 de 100 (alto)");
    expect(a.text).toContain("psi_025_bass_2.csv, fila 7");
    // El módulo "base" se pide al backend como ambiente "lunar", con la clave codificada.
    expect(vi.mocked(fetchMock).mock.calls.some(([u]) => String(u) === `${BACKEND}/api/findings/${encodeURIComponent(KEY)}/context?environment=lunar`)).toBe(true);
    // El texto del backend que se contradice con sus propios campos no se repite.
    expect(a.text).not.toContain("texto del backend");
    expect(a.sources.map((s) => s.id)).toEqual(["PSI"]);
  });

  it("ordena los factores por lo que aportan al índice", async () => {
    vi.stubGlobal("fetch", backend(CONTEXT));
    const a = await answerQuestion("Explain this finding and what it means in this environment.", "en", { finding: { key: KEY, env: "base" } });
    expect(a.lang).toBe("en");
    const order = ["oxygen margin", "gravity different", "material fit"].map((x) => a.text.indexOf(x));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    expect(a.text).not.toContain("soot load");
    expect(a.text).toContain("projection, not a measurement");
  });

  it("si el hallazgo no existe sigue por el camino general", async () => {
    vi.stubGlobal("fetch", backend(null));
    const a = await answerQuestion("zzqx vvkk", "es", { finding: { key: "no::existe::nunca", env: "base" } });
    expect(a.origin).toBe("none");
  });

  it("las preguntas sin hallazgo no cambian", async () => {
    const fetchMock = backend(CONTEXT);
    vi.stubGlobal("fetch", fetchMock);
    const a = await answerQuestion("zzqx vvkk", "es", {});
    expect(a.origin).toBe("none");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("texto de un hallazgo", () => {
  const pack: FindingPack = {
    live: false,
    environment: { key: "iss", label: "ISS", gravity_g: 0, o2_fraction: 0.21, pressure_atm: 1 },
    finding: { key: "k", experiment: "SPICE", facility: "MSG", material: null, flame_mode: "concurrent", o2_min: null, o2_max: null, observations: 469, rpi: 30, band: "low", relevance: "direct", sources: ["psi_001_spice.csv"] },
    factors: [],
    evidence: [],
    brief: null,
    kernel: "1.7.0",
  };

  it("con la copia de respaldo lo dice y no inventa factores", () => {
    const text = findingSummary(pack, "es");
    expect(text).toContain("material sin registrar");
    expect(text).toContain("copia de respaldo");
    expect(text).toContain("psi_001_spice.csv");
    expect(text).not.toContain("Lo que más puntos aporta");
    expect(text).not.toContain("gravedad parcial");
  });

  it("el contexto para el modelo declara que el RPI no es de NASA", () => {
    const block = findingBlock(pack);
    expect(block).toContain("not a NASA figure");
    expect(block).toContain("The backend is not reachable");
    expect(block).not.toContain("partial gravity");
  });
});
