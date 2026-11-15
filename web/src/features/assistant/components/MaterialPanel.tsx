"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CircleSlash, MessageCircle, Send, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { MODULES, getModule, type ModuleId } from "@/content/modules";
import type { RiskLevel } from "@/features/fire/engine/analysis";
import { MATERIALS } from "@/features/fire/engine/materials";
import { Segmented, Slider } from "@/shared/components/Controls";
import { EvidenceBadge } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import { gravity, num, pressure, signed } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import type { ApiEnvelope } from "@/shared/types/api";
import { MATERIAL_OPTIONS, O2_RANGE, P_RANGE, getMaterialOption, type MaterialOptionId } from "../lib/materialOptions";
import type { MaterialTest } from "../server/materialTest.service";
import styles from "./MaterialPanel.module.scss";

/** Escenario que acompaña a una pregunta al asistente. */
export interface AskContext {
  module?: string;
  mat?: string;
  g?: number;
  o2?: number;
  p?: number;
  vent?: number;
  explain?: boolean;
}

interface MaterialPanelProps {
  /** Ambiente y material de partida: lo que la persona tiene en pantalla. */
  initial: { module: ModuleId; material: MaterialOptionId; o2: number; p: number };
  /** Envía una pregunta al chat con el escenario probado. */
  onAsk: (question: string, context: AskContext) => void;
  busy: boolean;
  /** Oculta el panel sin desmontarlo, para conservar lo elegido al volver de la conversación. */
  hidden?: boolean;
}

const LEVEL: Record<RiskLevel, L> = {
  high: l("Supera su frontera de propagación", "Exceeds its flame-spread boundary"),
  caution: l("Cerca de su frontera: posición incierta", "Close to its boundary: uncertain position"),
  low: l("Por debajo de su frontera", "Below its boundary"),
  none: l("Sin evidencia de una frontera", "No evidence of a boundary"),
};

const LEVEL_ICON = { high: ShieldAlert, caution: TriangleAlert, low: ShieldCheck, none: CircleSlash } as const;

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

/**
 * Pestaña "Materiales" de Flamey: se elige un ambiente y un material, se mueven
 * el oxígeno y la presión, y el resultado cambia al momento. Las cifras salen
 * del motor físico de la plataforma (con su intervalo y su nivel de evidencia)
 * y, aparte, del modelo del backend del equipo. Un material que no está en
 * ninguno de los dos se pregunta por escrito y Flamey responde con las fuentes.
 */
export function MaterialPanel({ initial, onAsk, busy, hidden = false }: MaterialPanelProps) {
  const { t, lang } = useLang();
  const units = useStore(appStore, (s) => s.units);
  const [moduleId, setModuleId] = useState<ModuleId>(initial.module);
  const [materialId, setMaterialId] = useState<MaterialOptionId>(initial.material);
  const [o2, setO2] = useState(clamp(initial.o2, O2_RANGE.min, O2_RANGE.max));
  const [p, setP] = useState(clamp(initial.p, P_RANGE.min, P_RANGE.max));
  const [other, setOther] = useState("");
  const [result, setResult] = useState<{ key: string; data: ApiEnvelope<MaterialTest> | null }>({ key: "", data: null });

  const env = getModule(moduleId)!;
  const variant = env.variants[0]!;
  const option = getMaterialOption(materialId)!;
  const key = `${moduleId}|${materialId}|${o2}|${p}|${lang}`;

  // El cálculo se pide con una pausa corta, para no lanzar una petición por cada paso del control.
  useEffect(() => {
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      fetch("/api/asistente/material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: moduleId, material: materialId, o2, p, lang }),
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? (r.json() as Promise<ApiEnvelope<MaterialTest>>) : Promise.reject(new Error("material"))))
        .then((data) => setResult({ key, data }))
        .catch((e: unknown) => {
          if (!(e instanceof DOMException && e.name === "AbortError")) setResult({ key, data: null });
        });
    }, 220);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [key, moduleId, materialId, o2, p, lang]);

  const pickModule = (id: string): void => {
    const next = getModule(id);
    if (!next) return;
    const v = next.variants[0]!;
    setModuleId(next.id);
    setO2(clamp(v.o2, O2_RANGE.min, O2_RANGE.max));
    setP(clamp(v.P, P_RANGE.min, P_RANGE.max));
  };

  const loading = result.key !== key;
  const failed = !loading && !result.data;
  const value = result.data?.value;
  const engine = value?.engine ?? null;
  const backend = value?.backend ?? null;
  // Sin frontera con fuente, el estado es "sin evidencia", aunque el backend dé una cifra.
  const level: RiskLevel = engine?.level ?? "none";
  const Icon = LEVEL_ICON[level];
  const place = t(env.name).toLowerCase();
  const conditions = `${num(o2, 0, lang)} % O₂, ${pressure(p, units, lang)}`;
  const scenario: AskContext = { module: moduleId, g: variant.g, o2, p, vent: env.vent };

  const explain = (): void => {
    const name = t(option.label);
    if (option.engine) {
      onAsk(lang === "es" ? `Explícame el resultado de ${name} en ${place} con ${conditions}.` : `Explain the result for ${name} in the ${place} at ${conditions}.`, { ...scenario, mat: option.engine, explain: true });
    } else {
      onAsk(lang === "es" ? `¿Qué dicen las fuentes sobre ${name} en ${place} con ${conditions}?` : `What do the sources say about ${name} in the ${place} at ${conditions}?`, scenario);
    }
  };

  const askOther = (): void => {
    const name = other.trim();
    if (!name) return;
    onAsk(lang === "es" ? `¿Qué dicen las fuentes sobre el material ${name} en ${place} con ${conditions}?` : `What do the sources say about the material ${name} in the ${place} at ${conditions}?`, scenario);
    setOther("");
  };

  return (
    <div className={styles.panel} hidden={hidden} role="tabpanel">
      <Segmented label={`1 · ${t(l("Ambiente", "Environment"))}`} value={moduleId} options={MODULES.map((m) => ({ value: m.id, label: t(m.label) }))} onChange={pickModule} />
      <p className={styles.env}>
        {gravity(variant.g, lang)} · {t(l("ventilación", "ventilation"))} {num(env.vent, 0, lang)} cm/s
        {variant.undefinedAtmosphere ? ` · ${t(l("atmósfera hipotética: las fuentes no la definen", "hypothetical atmosphere: the sources do not define it"))}` : ""}
      </p>

      <Segmented label={`2 · ${t(l("Material", "Material"))}`} value={materialId} options={MATERIAL_OPTIONS.map((m) => ({ value: m.id, label: t(m.label), title: m.engine ? t(MATERIALS[m.engine].name) : undefined }))} onChange={setMaterialId} />
      <form
        className={styles.other}
        onSubmit={(e) => {
          e.preventDefault();
          askOther();
        }}
      >
        <input value={other} onChange={(e) => setOther(e.target.value)} maxLength={60} placeholder={t(l("Otro material: velcro, espuma, nylon…", "Another material: velcro, foam, nylon…"))} aria-label={t(l("Otro material", "Another material"))} />
        <button type="submit" disabled={busy || !other.trim()} aria-label={t(l("Preguntar a Flamey por ese material", "Ask Flamey about that material"))} title={t(l("Flamey responde con las fuentes, sin cifras propias", "Flamey answers from the sources, with no figures of its own"))}>
          <Send size={14} aria-hidden="true" />
        </button>
      </form>

      <div className={styles.sliders}>
        <span className={styles.step}>3 · {t(l("Atmósfera", "Atmosphere"))}</span>
        <Slider label={t(l("Oxígeno", "Oxygen"))} display={`${num(o2, 0, lang)} % O₂`} value={o2} min={O2_RANGE.min} max={O2_RANGE.max} step={1} onChange={setO2} />
        <Slider label={t(l("Presión total", "Total pressure"))} display={pressure(p, units, lang)} value={p} min={P_RANGE.min} max={P_RANGE.max} step={0.5} onChange={setP} />
      </div>

      <section className={styles.result} data-level={level} aria-live="polite" aria-busy={loading}>
        {failed ? (
          <p className={styles.fail}>
            <TriangleAlert size={16} aria-hidden="true" />
            {t(l("No se pudo calcular. Vuelve a intentarlo en un momento.", "It could not be computed. Try again in a moment."))}
          </p>
        ) : (
          <>
            <header>
              <Icon size={22} aria-hidden="true" />
              <div>
                <h3>{t(LEVEL[level])}</h3>
                <span>
                  {t(option.label)} · {t(env.name)}
                </span>
              </div>
              <EvidenceBadge level={engine?.evidence ?? "NONE"} compact />
            </header>

            {engine ? (
              <>
                {engine.loc != null && engine.marginLo != null && engine.marginHi != null && (
                  <dl className={styles.figures}>
                    <div>
                      <dt>{t(l("Frontera", "Boundary"))}</dt>
                      <dd>{num(engine.loc, 1, lang)} % O₂</dd>
                    </div>
                    <div>
                      <dt>{t(l("Margen", "Margin"))}</dt>
                      <dd>
                        {signed(engine.marginLo, 1, lang)} {t(l("a", "to"))} {signed(engine.marginHi, 1, lang)}
                      </dd>
                    </div>
                  </dl>
                )}
                <p>{engine.text}</p>
                {engine.outOfDomain.length > 0 && (
                  <p className={styles.note}>
                    {t(l("Fuera del rango ensayado", "Outside the tested range"))}: {engine.outOfDomain.join("; ")}.
                  </p>
                )}
              </>
            ) : (
              value && <p>{t(l("Este material no está en el catálogo del motor físico: no hay una frontera con fuente publicada, así que no se le asigna un nivel de riesgo.", "This material is not in the physics engine catalogue: there is no boundary with a published source, so it gets no risk level."))}</p>
            )}

            {backend ? (
              <p className={styles.backend}>
                <b>{t(l("Modelo del backend (emberwatch)", "Backend model (emberwatch)"))}:</b> {t(l("límite", "limit"))} {num(backend.limit, 1, lang)} % O₂ ·{" "}
                {backend.quenched ? t(l("la llama se apaga", "the flame quenches")) : `${t(l("propaga a", "spreads at"))} ${num(backend.rate, 2, lang)} mm/s`}
              </p>
            ) : (
              value && (
                <p className={styles.backend}>
                  <b>{t(l("Modelo del backend (emberwatch)", "Backend model (emberwatch)"))}:</b>{" "}
                  {value.backendState === "unknown_material" ? t(l("no tiene este material.", "does not have this material.")) : t(l("no respondió ahora.", "did not respond just now."))}
                </p>
              )
            )}
          </>
        )}
      </section>

      <div className={styles.actions}>
        <button type="button" onClick={explain} disabled={busy || loading || failed}>
          <MessageCircle size={14} aria-hidden="true" />
          {t(l("Que Flamey lo explique", "Have Flamey explain it"))}
        </button>
        {option.engine && (
          <Link href={`/laboratorio?env=${moduleId}&mat=${option.engine}&o2=${o2}&p=${p}${MATERIALS[option.engine].droplet ? "&tab=droplet" : ""}`}>
            {t(l("Abrir en el Laboratorio", "Open in the Laboratory"))}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
