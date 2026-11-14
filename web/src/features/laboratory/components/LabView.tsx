"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Box, FileText, X } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { MODULES, getModule } from "@/content/modules";
import { AlertList } from "@/features/alerts/components/AlertList";
import type { DropletCurve } from "@/features/fire/engine/analysis";
import { MATERIAL_LIST, MATERIALS } from "@/features/fire/engine/materials";
import { Segmented, Slider } from "@/shared/components/Controls";
import { EvidenceBadge, SourceChips } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { appStore } from "@/shared/lib/appStore";
import { gravity, num, pct, pressure } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import { ppO2 } from "@/shared/lib/units";
import type { ApiEnvelope } from "@/shared/types/api";
import { patchQuery } from "@/features/scene/lib/scenario";
import { parseLab, type LabScenario, type LabTab } from "../lib/query";
import type { BoundaryResult } from "../server/laboratory.service";
import { FlammabilityMap } from "./FlammabilityMap";
import { CabinChart, DropletChart, SMOKE_SIGNATURES, SmokeChart, fractionAbove } from "./LabCharts";
import { MarginGauge } from "./MarginGauge";
import { ModelCard } from "./ModelCard";
import styles from "./Lab.module.scss";

const TABS: { id: LabTab; label: L; goal: L }[] = [
  { id: "map", label: l("Mapa de inflamabilidad", "Flammability map"), goal: l("Prevención", "Prevention") },
  { id: "droplet", label: l("Gotas · ley d²", "Droplets · d² law"), goal: l("Supresión", "Suppression") },
  { id: "smoke", label: l("Humo y detección", "Smoke and detection"), goal: l("Detección", "Detection") },
  { id: "cabin", label: l("Cabina · CO", "Cabin · CO"), goal: l("Limpieza", "Clean-up") },
];

const MODE_TEXT: Record<DropletCurve["mode"], L> = {
  burnout: l("Quema hasta consumirse", "Burns to completion"),
  extinction: l("Extinción con diámetro finito", "Extinction at finite diameter"),
  radiative_cool: l("Extinción radiativa → llama fría", "Radiative extinction → cool flame"),
  radiative: l("Extinción radiativa", "Radiative extinction"),
  no_ignition: l("No sostiene la llama", "Does not sustain a flame"),
};

interface Props {
  initialBoundary: ApiEnvelope<BoundaryResult>;
  initialDroplet: ApiEnvelope<DropletCurve | null>;
}

const body = (s: LabScenario): string =>
  JSON.stringify({ mat: s.mat, g: s.g, o2: s.o2, p: s.p, flow: s.flow, co2: s.co2, he: s.he, undefinedAtmosphere: s.undefinedAtmosphere });

/**
 * Laboratorio de datos (objetivo O2): escenario editable en la URL, mapa de
 * inflamabilidad por gravedad, gotas, humo y contaminantes de cabina. Las
 * predicciones llegan de /api/predict con el sobre común de respuesta.
 */
export function LabView({ initialBoundary, initialDroplet }: Props) {
  const { t, lang } = useLang();
  const sp = useSearchParams();
  const query = sp.toString();
  const s = useMemo(() => parseLab(new URLSearchParams(query)), [query]);
  const units = useStore(appStore, (st) => st.units);
  const [boundary, setBoundary] = useState(initialBoundary);
  const [droplet, setDroplet] = useState(initialDroplet);
  const [card, setCard] = useState(false);
  const first = useRef(true);
  const m = getModule(s.env)!;
  const mat = MATERIALS[s.mat];
  const payload = body(s);

  const set = useCallback((patch: Record<string, string | number | null>) => {
    window.history.replaceState(null, "", window.location.pathname + patchQuery(window.location.search.slice(1), patch));
  }, []);

  // Cada cambio del escenario pide una nueva predicción al backend (/api).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      const post = (url: string): Promise<unknown> =>
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, signal: ctrl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("api"))));
      post("/api/predict/solid-boundary")
        .then((data) => setBoundary(data as ApiEnvelope<BoundaryResult>))
        .catch(() => undefined);
      if (s.tab === "droplet")
        post("/api/predict/droplet-k")
          .then((data) => setDroplet(data as ApiEnvelope<DropletCurve | null>))
          .catch(() => undefined);
    }, 140);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [payload, s.tab]);

  const a = boundary.value.assessment;
  const activePanel = s.g < 0.02 ? "micro" : s.g < 0.9 ? "moon" : "earth";
  const curve = droplet.value;
  const materials = MATERIAL_LIST.filter((x) => (s.tab === "droplet" ? !!x.droplet : !x.droplet));
  const sceneHref = `/modulos/${m.id}?view=cabina&atm=${s.atm}&mat=${s.mat}&o2=${s.o2}&p=${s.p}&vent=${s.flow}`;

  return (
    <div className={styles.lab}>
      <aside className={styles.left}>
        <header>
          <span>{t(l("LABORATORIO · OBJETIVO 2", "LABORATORY · GOAL 2"))}</span>
          <h1>{t(l("Datos y modelos", "Data and models"))}</h1>
        </header>
        <Segmented wrap label={t(l("Ambiente", "Environment"))} value={s.env} options={MODULES.map((x) => ({ value: x.id, label: t(x.label) }))} onChange={(id) => set({ env: id, atm: null, o2: null, p: null, flow: null })} />
        {m.variants.length > 1 && (
          <Segmented label={t(l("Atmósfera", "Atmosphere"))} value={s.atm} options={m.variants.map((v) => ({ value: v.id, label: t(v.name), title: t(v.note) }))} onChange={(id) => set({ atm: id, o2: null, p: null })} />
        )}
        {(s.tab === "map" || s.tab === "droplet") && (
          <Segmented wrap label={t(l("Material", "Material"))} value={s.mat} options={materials.map((x) => ({ value: x.id, label: t(x.short), title: t(x.name) }))} onChange={(id) => set({ mat: id })} />
        )}
        <Slider label={t(l("Oxígeno", "Oxygen"))} display={`${num(s.o2, 1, lang)} %`} value={s.o2} min={12} max={45} step={0.5} onChange={(v) => set({ o2: v })} hint={`ppO₂ ${num(ppO2(s.o2, s.p), 1, lang)} kPa · ${gravity(s.g, lang)}`} warn={s.o2 > 40} />
        <Slider label={t(l("Presión", "Pressure"))} display={pressure(s.p, units, lang)} value={s.p} min={40} max={101.3} step={0.5} onChange={(v) => set({ p: v })} />
        <Slider label={t(l("Ventilación", "Ventilation"))} display={`${num(s.flow, 0, lang)} cm/s`} value={s.flow} min={0} max={40} step={1} onChange={(v) => set({ flow: v })} />
        {(s.tab === "map" || s.tab === "droplet") && (
          <>
            <Slider label={t(l("CO₂ añadido", "Added CO₂"))} display={`${num(s.co2, 0, lang)} %`} value={s.co2} min={0} max={40} step={1} onChange={(v) => set({ co2: v || null })} />
            <Slider label={t(l("Helio añadido", "Added helium"))} display={`${num(s.he, 0, lang)} %`} value={s.he} min={0} max={40} step={1} onChange={(v) => set({ he: v || null })} />
          </>
        )}
        <Link href={sceneHref} className={styles.toScene}>
          <Box size={15} />
          {t(l("VER EN LA CABINA 3D", "SEE IT IN THE 3D CABIN"))}
        </Link>
      </aside>

      <section className={styles.main}>
        <nav className={styles.tabs} aria-label={t(l("Análisis", "Analyses"))}>
          {TABS.map((tab) => (
            <button key={tab.id} type="button" aria-pressed={s.tab === tab.id} onClick={() => set({ tab: tab.id === "map" ? null : tab.id, mat: null })}>
              <em>{t(tab.goal)}</em>
              {t(tab.label)}
            </button>
          ))}
        </nav>

        {s.tab === "map" && (
          <div className={styles.body}>
            <p className={styles.lede}>
              {t(l("Frontera de propagación de ", "Flame-spread boundary of "))}
              <b>{t(mat.name)}</b>
              {t(l(" a ", " at "))}
              {pressure(s.p, units, lang)}. {t(l("Pulsa sobre un mapa para mover tu cabina.", "Click on a map to move your cabin."))}
            </p>
            <div className={styles.maps}>
              {boundary.value.panels.map((p) => (
                <FlammabilityMap key={p.id} panel={p} flow={s.flow} o2={s.o2} active={p.id === activePanel} featured={p.id === activePanel} onPick={(flow, o2) => set({ flow, o2 })} />
              ))}
            </div>
            <ul className={styles.legend}>
              <li className={styles.lgLine}>{t(l("Frontera (50 %)", "Boundary (50%)"))}</li>
              <li className={styles.lgBand}>{t(l("Intervalo", "Interval"))}</li>
              <li className={styles.lgPred}>{t(l("Predicción sin validación directa", "Prediction, no direct validation"))}</li>
              <li className={styles.lgSpread}>{t(l("Ensayo: propaga", "Test: spreads"))}</li>
              <li className={styles.lgNo}>{t(l("Ensayo: no propaga", "Test: no spread"))}</li>
              <li className={styles.lgLimit}>{t(l("Límite publicado", "Published limit"))}</li>
              <li className={styles.lgCabin}>{t(l("Tu cabina", "Your cabin"))}</li>
            </ul>
          </div>
        )}

        {s.tab === "droplet" && (
          <div className={styles.body}>
            <p className={styles.lede}>
              <b>{t(mat.name)}</b> · D₀ = {num(mat.droplet?.d0 ?? 0, 2, lang)} mm. {t(l("La ley d²: el cuadrado del diámetro baja en línea recta, D²(t) = D₀² − K·t.", "The d² law: the squared diameter falls linearly, D²(t) = D₀² − K·t."))}
            </p>
            <div className={styles.split}>
              <div className={styles.plot}>{curve && <DropletChart curve={curve} />}</div>
              <dl className={styles.facts}>
                <div>
                  <dt>K</dt>
                  <dd>{num(curve?.K ?? 0, 3, lang)} mm²/s</dd>
                </div>
                <div>
                  <dt>{t(l("Llama visible", "Visible flame"))}</dt>
                  <dd>{num(curve?.tEnd ?? 0, 2, lang)} s</dd>
                </div>
                <div>
                  <dt>{t(l("Modo de terminación", "Termination mode"))}</dt>
                  <dd className={styles.mode}>{curve ? t(MODE_TEXT[curve.mode]) : "—"}</dd>
                </div>
                <div>
                  <dt>{t(l("Evidencia", "Evidence"))}</dt>
                  <dd>
                    <EvidenceBadge level={droplet.evidence_level ?? "NONE"} />
                  </dd>
                </div>
                <p>{t(mat.note)}</p>
                <SourceChips ids={droplet.sources.map((x) => x.id)} />
              </dl>
            </div>
          </div>
        )}

        {s.tab === "smoke" && (
          <div className={styles.body}>
            <p className={styles.lede}>{t(l("El detector de la ISS ve bien el humo grueso, pero falla con frecuencia con el humo fino de Teflon y Kapton, materiales muy usados en electrónica.", "The ISS detector sees coarse smoke well but frequently misses fine Teflon and Kapton smoke, materials widely used in electronics."))}</p>
            <div className={styles.split}>
              <div className={styles.plot}>
                <SmokeChart />
              </div>
              <div className={styles.facts}>
                <h3>{t(l("PARTÍCULAS VISIBLES PARA EL DETECTOR", "PARTICLES VISIBLE TO THE DETECTOR"))}</h3>
                <ul className={styles.bars}>
                  {SMOKE_SIGNATURES.map((sm) => {
                    const f = fractionAbove(0.6, sm.dg, sm.sg);
                    return (
                      <li key={sm.id} style={{ "--c": sm.color, "--value": pct(Math.max(0.02, f)) } as React.CSSProperties}>
                        <span>{typeof sm.name === "string" ? sm.name : t(sm.name)}</span>
                        <i />
                        <b>{num(f * 100, f < 0.1 ? 1 : 0, lang)} %</b>
                      </li>
                    );
                  })}
                </ul>
                <p>{t(l("Curvas representativas del rango medido por SAME-2 (100–600 nm). En gravedad parcial, una corriente de 5 cm/s dispersa en minutos la capa de humo del techo.", "Curves representative of the range measured by SAME-2 (100–600 nm). In partial gravity a 5 cm/s current disperses the ceiling smoke layer within minutes."))}</p>
                <SourceChips ids={["B11", "B13", "B12", "B14"]} />
              </div>
            </div>
          </div>
        )}

        {s.tab === "cabin" && (
          <div className={styles.body}>
            <p className={styles.lede}>
              {t(l("CO medido en Saffire (volumen libre 16,7 m³) y el mismo fuego en ", "CO measured in Saffire (16.7 m³ free volume) and the same fire in "))}
              <b>
                {t(m.name).toLowerCase()} ({num(m.volume, m.volume % 1 ? 1 : 0, lang)} m³, {pressure(s.p, units, lang)})
              </b>
              .
            </p>
            <div className={styles.split}>
              <div className={styles.plot}>
                <CabinChart volume={m.volume} pressure={s.p} />
              </div>
              <div className={styles.facts}>
                <ul className={styles.keys}>
                  <li className={styles.kMeasured}>{t(l("Medido en Saffire IV–VI", "Measured in Saffire IV–VI"))}</li>
                  <li className={styles.kDerived}>{t(l("Mismos moles de CO en tu cabina (derivado)", "Same moles of CO in your cabin (derived)"))}</li>
                </ul>
                <p>{t(l("Fuegos de solo 1,5–3,2 kW bastan para superar el límite de exposición de 24 h. Un filtro de partículas no retira CO, y recircular sin filtrar no elimina nada.", "Fires of only 1.5–3.2 kW are enough to exceed the 24 h exposure limit. A particle filter does not remove CO, and recirculating without filtering removes nothing."))}</p>
                <p>{t(l("El modelo de cabina bien mezclada sirve para balances, no para ubicar detectores ni picos locales.", "The well-mixed cabin model is for balances, not for locating detectors or local peaks."))}</p>
                <SourceChips ids={["B2", "SMAC"]} />
              </div>
            </div>
          </div>
        )}
      </section>

      <aside className={styles.right}>
        <h3>{t(l("MARGEN DE INFLAMABILIDAD", "FLAMMABILITY MARGIN"))}</h3>
        <MarginGauge data={a} />
        <dl className={styles.derived}>
          <div>
            <dt>{t(l("Flujo efectivo", "Effective flow"))}</dt>
            <dd>{num(a.U, 1, lang)} cm/s</dd>
          </div>
          <div>
            <dt>{t(l("P(propaga)", "P(spread)"))}</dt>
            <dd>{a.pSpread == null ? "∅" : `${num(a.pSpread * 100, 0, lang)} %`}</dd>
          </div>
          <div>
            <dt>Richardson</dt>
            <dd>{a.Ri == null ? "—" : a.Ri < 0.01 ? "< 0,01" : num(a.Ri, a.Ri < 10 ? 1 : 0, lang)}</dd>
          </div>
        </dl>
        <h3>
          {t(l("ALERTAS", "ALERTS"))} <em>{a.alerts.length}</em>
        </h3>
        <div className={styles.scroll}>
          <AlertList alerts={a.alerts} compact />
        </div>
        <button type="button" className={styles.cardBtn} onClick={() => setCard(true)}>
          <FileText size={14} />
          {t(l("FICHA DEL MODELO", "MODEL CARD"))}
          <code>{boundary.model_version}</code>
        </button>
      </aside>

      {card && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={t(l("Ficha del modelo", "Model card"))}>
          <div className={styles.modal}>
            <button type="button" className={styles.close} onClick={() => setCard(false)} aria-label={t(l("Cerrar", "Close"))}>
              <X size={18} />
            </button>
            <ModelCard />
          </div>
        </div>
      )}
    </div>
  );
}
