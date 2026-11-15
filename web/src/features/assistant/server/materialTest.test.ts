import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MATERIALS } from "@/features/fire/engine/materials";
import { MATERIAL_OPTIONS } from "../lib/materialOptions";
import { answerQuestion } from "./assistant.service";
import { testMaterial } from "./materialTest.service";

const BACKEND = "https://backend.test";

/** Simula `POST /api/lab/simulate`; `null` deja el backend sin responder. */
function backend(reply: unknown | null): typeof fetch {
  return vi.fn(async () => (reply ? new Response(JSON.stringify(reply), { status: 200 }) : new Response("no", { status: 503 }))) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", BACKEND);
  vi.stubEnv("GEMINI_API_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("prueba de un material", () => {
  it("junta el motor físico y el modelo del backend sin mezclarlos", async () => {
    const fetchMock = backend({ limit: 0.1735, excess: 0.1265, quenched: false, rate_mm_s: 0.7203, curve: [] });
    vi.stubGlobal("fetch", fetchMock);
    const r = await testMaterial({ module: "base", material: "pmma", o2: 34, p: 56.5, lang: "es" });
    expect(r.kind).toBe("prediction");
    expect(r.value.scenario).toEqual({ module: "base", g: 0.165, o2: 34, p: 56.5, vent: 10 });
    expect(r.value.engine?.loc).toBeGreaterThan(0);
    expect(r.value.engine?.text).toContain("PMMA");
    expect(r.evidence_level).toBe(r.value.engine?.evidence);
    expect(r.interval).toEqual([r.value.engine?.marginLo, r.value.engine?.marginHi]);
    expect(r.value.backend).toEqual({ limit: 17.4, quenched: false, rate: 0.7203 });
    expect(r.value.backendState).toBe("ok");
    // Unidades del backend: fracción de O₂ y atmósferas.
    const [url, init] = vi.mocked(fetchMock).mock.calls[0]!;
    const sent = JSON.parse(String((init as RequestInit).body)) as Record<string, unknown>;
    expect(String(url)).toBe(`${BACKEND}/api/lab/simulate`);
    expect(sent.material).toBe("PMMA");
    expect(sent.o2_fraction).toBeCloseTo(0.34);
    expect(sent.pressure_atm).toBeCloseTo(56.5 / 101.325);
    expect(sent.gravity_g).toBe(0.165);
  });

  it("sin backend la prueba sigue con el motor físico", async () => {
    vi.stubGlobal("fetch", backend(null));
    const r = await testMaterial({ module: "rover", material: "sibal", o2: 30, p: 70.3, lang: "en" });
    expect(r.value.engine).not.toBeNull();
    expect(r.value.backend).toBeNull();
    expect(r.value.backendState).toBe("unavailable");
  });

  it("un material que el backend no tiene no se le pide", async () => {
    const fetchMock = backend({ limit: 0.2, excess: 0, quenched: true, rate_mm_s: 0 });
    vi.stubGlobal("fetch", fetchMock);
    const r = await testMaterial({ module: "estacion", material: "nomex", o2: 21, p: 101.3, lang: "es" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(r.value.backendState).toBe("unknown_material");
    expect(r.value.engine).not.toBeNull();
  });

  it("un material fuera del motor físico queda sin evidencia aunque el backend dé una cifra", async () => {
    vi.stubGlobal("fetch", backend({ limit: 0.24, excess: 0.76, quenched: false, rate_mm_s: 2.1 }));
    const r = await testMaterial({ module: "traje", material: "teflon", o2: 100, p: 29.6, lang: "es" });
    expect(r.value.engine).toBeNull();
    expect(r.evidence_level).toBe("NONE");
    expect(r.interval).toBeUndefined();
    expect(r.value.backend?.limit).toBeCloseTo(24);
  });

  it("un material sin frontera publicada no recibe ni frontera ni margen", async () => {
    vi.stubGlobal("fetch", backend(null));
    const none = MATERIAL_OPTIONS.filter((m) => m.engine && !MATERIALS[m.engine].frontier);
    expect(none.length).toBeGreaterThan(0);
    for (const m of none) {
      const r = await testMaterial({ module: "base", material: m.id, o2: 34, p: 56.5, lang: "es" });
      expect(r.value.engine?.loc).toBeNull();
      expect(r.value.engine?.level).toBe("none");
      expect(r.interval).toBeUndefined();
    }
  });

  it("la conclusión es la misma que da el chat para ese escenario", async () => {
    vi.stubGlobal("fetch", backend(null));
    const r = await testMaterial({ module: "base", material: "pmma", o2: 34, p: 56.5, lang: "es" });
    const chat = await answerQuestion("¿Arde PMMA en base lunar?", "es", { module: "base", mat: "pmma", g: 0.165, o2: 34, p: 56.5, vent: 10 });
    expect(chat.origin).toBe("analysis");
    expect(chat.text).toBe(r.value.engine?.text);
  });
});

describe("explicación del escenario probado", () => {
  it("sin modelo de lenguaje responde la conclusión calculada", async () => {
    vi.stubGlobal("fetch", backend(null));
    const a = await answerQuestion("Explícame el resultado de PMMA en base lunar con 34 % O₂, 56,5 kPa.", "es", { module: "base", mat: "pmma", g: 0.165, o2: 34, p: 56.5, vent: 10, explain: true });
    expect(a.origin).toBe("analysis");
    expect(a.text).toContain("PMMA");
    expect(a.evidence).toBeDefined();
  });

  it("sin la marca de explicación la misma pregunta no fuerza el cálculo", async () => {
    vi.stubGlobal("fetch", backend(null));
    const a = await answerQuestion("zzqx vvkk", "es", { module: "base", mat: "pmma", g: 0.165, o2: 34, p: 56.5, vent: 10 });
    expect(a.origin).toBe("none");
  });
});
