/**
 * Verificación del motor físico contra valores publicados (documento maestro
 * §5.1, §8, §9, §12.4 y §19.3). Si una de estas pruebas falla, la física dejó
 * de reproducir la literatura.
 */
import { describe, expect, it } from "vitest";
import { kpaToPsi, o2EnrichmentPct, ppO2, psiToKpa } from "@/shared/lib/units";
import { MATERIALS, type FrontierModel } from "./materials";
import { buoyFlow, dropletK, effFlow, frontier, heatRelease, massMeanDiameter, richardson, spreadRate, surfEq } from "./physics";
import { assess, dropletCurve } from "./analysis";
import { ignite, makeState, step, type SimConfig } from "./sim";

const loc = (id: keyof typeof MATERIALS, g: number, vent: number, P = 101.3): number =>
  frontier(MATERIALS[id].frontier!, { g, U: effFlow(vent, g), P }).loc;

describe("unidades (§12.6)", () => {
  it("convierte psi ↔ kPa", () => {
    expect(psiToKpa(14.7)).toBeCloseTo(101.35, 1);
    expect(kpaToPsi(56.5)).toBeCloseTo(8.2, 1);
  });
  it("calcula ppO₂ del guion de la demo: 0,34 × 56,5 = 19,21 kPa", () => {
    expect(ppO2(34, 56.5)).toBeCloseTo(19.21, 2);
    expect(o2EnrichmentPct(34)).toBeCloseTo(63, 0);
    expect(o2EnrichmentPct(30)).toBeCloseTo(44, 0);
  });
});

describe("flotabilidad (Takahashi 2026a)", () => {
  it("reproduce los flujos equivalentes 15,3 / 19,3 / 25,2 / 35 cm/s", () => {
    expect(buoyFlow(1 / 12)).toBeCloseTo(15.3, 0);
    expect(buoyFlow(1 / 6)).toBeCloseTo(19.3, 0);
    expect(buoyFlow(3 / 8)).toBeCloseTo(25.2, 0);
    expect(buoyFlow(1)).toBe(35);
  });
  it("Richardson ≈ 82 en la Tierra con 20 cm/s", () => {
    expect(richardson(1, 20)).toBeCloseTo(82, 0);
    expect(richardson(1, 0)).toBeNull();
  });
});

describe("propagación sobre sólidos (Saffire-1, Ferkul 2017)", () => {
  const m = MATERIALS.sibal;
  const M = 21.7 - loc("sibal", 1e-6, 20);
  it("1,8 mm/s a favor del flujo y 1,3 mm/s en contra a 20 cm/s", () => {
    const base = { U: 20, g: 1e-6, o2: 21.7, P: 101.3, M };
    expect(spreadRate(m, { ...base, mode: "concurrent" }) * 10).toBeCloseTo(1.8, 1);
    expect(spreadRate(m, { ...base, mode: "opposed" }) * 10).toBeCloseTo(1.3, 1);
  });
  it("libera ≈1,5 kW (medido 1,2 ± 0,3 kW)", () => {
    const v = spreadRate(m, { U: 20, g: 1e-6, o2: 21.7, P: 101.3, M, mode: "concurrent" });
    expect(heatRelease(m, v, 10, 21.7, M)).toBeGreaterThan(1.1);
    expect(heatRelease(m, v, 10, 21.7, M)).toBeLessThan(1.6);
  });
  it("PMMA de dos caras alcanza ≈3,1 kW en la atmósfera de Saffire VI-3", () => {
    const q = heatRelease(MATERIALS.pmma, 0.04, 18, 30.3, 10);
    expect(q).toBeGreaterThan(2.7);
    expect(q).toBeLessThan(3.5);
  });
});

describe("límites de inflamabilidad", () => {
  it("Nomex no propaga en la atmósfera de la ISS y sí en la de exploración", () => {
    expect(loc("nomex", 1e-6, 20)).toBeGreaterThan(22.1);
    expect(loc("nomex", 0.165, 10, 56.5)).toBeLessThan(34);
  });
  it("Nomex: LOC ≈24 % a 100 kPa y ≈35 % a 40 kPa en 1 g (Thomsen 2017)", () => {
    expect(loc("nomex", 1, 10, 100)).toBeCloseTo(24, 0);
    expect(loc("nomex", 1, 10, 40)).toBeCloseTo(35, 0);
  });
  it("PMMA: 3–4 puntos entre 1 g y µg a 10 cm/s (Liveretou 2026)", () => {
    const d = loc("pmma", 1, 10) - loc("pmma", 1e-6, 10);
    expect(d).toBeGreaterThan(3);
    expect(d).toBeLessThan(4);
  });
  it("PMMA: frontera cerca de gravedad lunar dentro de 13,2–15,2 % a 57,6 kPa (Olson 2024)", () => {
    const v = loc("pmma", 0.165, 0, 57.6);
    expect(v).toBeGreaterThan(13.2);
    expect(v).toBeLessThan(15.6);
  });
  it("la Luna es peor que la Tierra y que el aire quieto en µg (zona Ricitos de Oro)", () => {
    const moon = loc("pmma", 0.165, 0);
    expect(moon).toBeLessThan(loc("pmma", 1, 0));
    expect(moon).toBeLessThan(loc("pmma", 1e-6, 0));
  });
  it("papel en base lunar (0,165 g, 56,5 kPa): ≈18,6 % (Takahashi 2026a)", () => {
    expect(loc("sibal", 0.165, 0, 56.5)).toBeCloseTo(18.6, 0);
  });
  it("curva en U: el aire quieto y el flujo alto suben el límite", () => {
    expect(loc("pmma", 1e-6, 0.5)).toBeGreaterThan(loc("pmma", 1e-6, 10));
    expect(loc("pmma", 1e-6, 35)).toBeGreaterThan(loc("pmma", 1e-6, 10));
  });
});

describe("supresión por diluyentes (Ruff 2004)", () => {
  const flat: FrontierModel = { ...MATERIALS.pmma.frontier!, locMin: 13, quenchA: 0, gravityRise: 0 };
  const critical = (agent: "co2" | "he"): number => {
    for (let x = 0; x < 60; x += 0.05) {
      const r = frontier(flat, { g: 1e-6, U: 10, P: 101.3, [agent]: x });
      const o2 = 21 * (1 - x / 100);
      if (o2 <= r.loc) return x / o2;
    }
    return NaN;
  };
  it("relación crítica agente/O₂: CO₂ ≈ 1,12 y He ≈ 2,1", () => {
    expect(critical("co2")).toBeCloseTo(1.12, 1);
    expect(critical("he")).toBeCloseTo(2.1, 1);
  });
});

describe("gotas (FLEX, PSI-69 ensayo 30CAL03)", () => {
  it("metanol: K ≈ 0,478 mm²/s y 6,34 s hasta la extinción a 0,81 mm", () => {
    expect(dropletK(MATERIALS.methanol.droplet!, 21, 101.3, 0)).toBeCloseTo(0.478, 3);
    const c = dropletCurve("methanol", { o2: 21, P: 101.3, vent: 0, g: 1e-6 })!;
    expect(c.mode).toBe("extinction");
    expect(c.tEnd).toBeCloseTo(6.34, 1);
    expect(c.dEnd).toBeCloseTo(0.81, 2);
  });
  it("heptano grande en aire quieto: extinción radiativa y llama fría", () => {
    const c = dropletCurve("heptane", { o2: 21, P: 101.3, vent: 0, g: 1e-6 })!;
    expect(c.mode).toBe("radiative_cool");
    expect(c.cool.length).toBeGreaterThan(0);
  });
});

describe("ignición y humo", () => {
  it("un punto caliente se enfría menos sin flotabilidad (§5.3)", () => {
    expect(surfEq(60, effFlow(0, 1e-6), 101.3)).toBeGreaterThan(1.8 * surfEq(60, effFlow(0, 1), 101.3) - 22);
  });
  it("lognormal: Dg = 1,0 µm y σg = 2,0 → D₁.₅ = 2,06 µm (Urban 2008)", () => {
    expect(massMeanDiameter(1000, 2)).toBeCloseTo(2.06, 2);
  });
});

describe("interpretación (§13.7)", () => {
  it("guion de la demo: PMMA en base lunar dispara ALR-03 y ALR-04 con evidencia D", () => {
    const a = assess({ mat: "pmma", g: 0.165, o2: 34, P: 56.5, vent: 10 });
    const ids = a.alerts.map((x) => x.id);
    expect(ids).toContain("ALR-03");
    expect(ids).toContain("ALR-04");
    expect(a.evidence).toBe("D");
    expect(a.level).toBe("high");
  });
  it("un material sin frontera nunca es riesgo bajo", () => {
    const a = assess({ mat: "wire", g: 1e-6, o2: 21, P: 101.3, vent: 15 });
    expect(a.level).toBe("none");
    expect(a.evidence).toBe("NONE");
    expect(a.margin).toBeNull();
  });
  it("fuera de dominio dispara ALR-09", () => {
    const a = assess({ mat: "sibal", g: 1e-6, o2: 60, P: 101.3, vent: 15 });
    expect(a.alerts.map((x) => x.id)).toContain("ALR-09");
  });
});

describe("escenario temporal", () => {
  const cfg: SimConfig = { g: 1e-6, o2: 21.7, P: 101.3, vent: 20, mat: "sibal", mode: "concurrent", heater: 0, volume: 16.7, exchange: 0, auto: false };
  it("Saffire: el fuego crece con la ventilación y la cabina acumula CO₂ y CO", () => {
    const S = makeState(cfg);
    step(S, 0.1);
    expect(ignite(S)).toBe(true);
    for (let i = 0; i < 1300; i++) step(S, 0.1);
    expect(S.fire).toBe("burning");
    expect(S.v * 10).toBeGreaterThan(1.5);
    expect(S.Q).toBeGreaterThan(1.0);
    expect(S.cab.CO2).toBeGreaterThan(3500);
    expect(S.cab.CO).toBeGreaterThan(5);
  });
  it("cortar la ventilación en µg apaga la tela; en la Luna la flotabilidad la mantiene", () => {
    const run = (g: number): string => {
      const S = makeState({ ...cfg, g, o2: 21 });
      step(S, 0.1);
      ignite(S);
      for (let i = 0; i < 200; i++) step(S, 0.1);
      S.act.ventOff = true;
      for (let i = 0; i < 1500; i++) step(S, 0.1);
      return S.fire;
    };
    expect(run(1e-6)).toBe("out");
    expect(["burning", "burnout"]).toContain(run(0.165));
  });
});
