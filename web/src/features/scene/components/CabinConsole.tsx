"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CloudFog, Fan, FireExtinguisher, Flame, LocateFixed, Pause, Play, Power, RefreshCw, Wind, ZoomIn, ZoomOut } from "lucide-react";
import { l, type L } from "@/content/i18n";
import type { ModuleDef } from "@/content/modules";
import { AlertList } from "@/features/alerts/components/AlertList";
import { assess, CAUTION_BAND, SMAC_CO, type RiskLevel } from "@/features/fire/engine/analysis";
import { MATERIAL_LIST, MATERIALS } from "@/features/fire/engine/materials";
import { ALARM_OBSC } from "@/features/fire/engine/physics";
import type { ActionKey } from "@/features/fire/engine/sim";
import { fireStore } from "@/features/fire/store";
import { MarginGauge, type GaugeData } from "@/features/laboratory/components/MarginGauge";
import { worldCtl, worldStore } from "@/features/world/controller";
import { Segmented, Slider } from "@/shared/components/Controls";
import { Sparkline } from "@/shared/components/Sparkline";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, toast } from "@/shared/lib/appStore";
import { clock, gravity, num, pressure } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import { ppO2 } from "@/shared/lib/units";
import type { ApiAlert } from "@/shared/types/api";
import { useScenario } from "../hooks/useScenario";
import { FIRE_LABEL, LOG_TEXT } from "../lib/labels";
import styles from "./CabinConsole.module.scss";

const ACTIONS: { key: ActionKey; icon: React.ComponentType<{ size?: number }>; label: L; active: L; hint: L }[] = [
  { key: "vent", icon: Fan, label: l("Cortar ventilación", "Cut ventilation"), active: l("Ventilación cortada", "Ventilation cut"), hint: l("Primer paso del procedimiento: deja a la llama sin aire fresco.", "First step of the procedure: it starves the flame of fresh air.") },
  { key: "power", icon: Power, label: l("Cortar energía", "Cut power"), active: l("Energía cortada", "Power cut"), hint: l("Retira la fuente de calor eléctrica.", "Removes the electrical heat source.") },
  { key: "pfe", icon: FireExtinguisher, label: l("Extintor de CO₂", "CO₂ extinguisher"), active: l("Descargando CO₂", "Discharging CO₂"), hint: l("Desplaza el O₂ y enfría; el chorro induce flujo hacia la llama.", "Displaces O₂ and cools; the jet induces flow onto the flame.") },
  { key: "mist", icon: CloudFog, label: l("Niebla de agua", "Water mist"), active: l("Descargando niebla", "Discharging mist"), hint: l("Enfría la llama sin añadir CO₂ a la cabina.", "Cools the flame without adding CO₂ to the cabin.") },
  { key: "venting", icon: Wind, label: l("Despresurizar", "Depressurise"), active: l("Despresurizando", "Depressurising"), hint: l("Venteo al vacío: solo con la tripulación protegida.", "Vent to vacuum: only with the crew protected.") },
];

/**
 * Consola de la cabina: escenario (material, atmósfera, ventilación, fuente de
 * calor), margen de inflamabilidad, alertas, acciones de respuesta y
 * telemetría. Todo responde al motor físico que corre en el mundo 3D.
 */
export function CabinConsole({ module: m }: { module: ModuleDef }) {
  const { t, lang } = useLang();
  const { scenario: s, set, href } = useScenario(m);
  const snap = useStore(fireStore, (st) => st.snap);
  const paused = useStore(fireStore, (st) => st.paused);
  const speed = useStore(fireStore, (st) => st.speed);
  const hist = useStore(fireStore, (st) => st.hist);
  useStore(fireStore, (st) => st.histTick);
  const units = useStore(appStore, (st) => st.units);
  const tracers = useStore(worldStore, (st) => st.tracers);
  const mat = MATERIALS[s.mat];
  const base = useMemo(() => assess({ mat: s.mat, g: s.g, o2: s.o2, P: s.p, vent: s.vent, undefinedAtmosphere: s.undefinedAtmosphere }), [s]);

  // Margen en vivo: incluye el efecto de los agentes de supresión y del consumo de O₂.
  const gauge: GaugeData = useMemo(() => {
    if (!snap || base.loc == null || !Number.isFinite(snap.loc)) return base;
    const lo = snap.M - (snap.locHi - snap.loc), hi = snap.M + (snap.loc - snap.locLo);
    const level: RiskLevel = lo > 0 ? "high" : hi < 0 && Math.abs(hi) > CAUTION_BAND ? "low" : "caution";
    return { ...base, level, margin: snap.M, marginLo: lo, marginHi: hi, loc: snap.loc, locLo: snap.locLo, locHi: snap.locHi };
  }, [snap, base]);

  const live: ApiAlert[] = [];
  if (snap?.alarm)
    live.push({ id: "DET", level: "high", message: l(`Alarma de humo: ${num(snap.det, 1, "es")} %/ft en el detector`, `Smoke alarm: ${num(snap.det, 1, "en")} %/ft at the detector`), cause: l("El detector de dispersión de luz superó 1 % de obscuración por pie.", "The light-scattering detector exceeded 1% obscuration per foot."), sources: ["B12"] });
  if (snap && snap.cab.CO > SMAC_CO.h24)
    live.push({ id: "SMAC", level: snap.cab.CO > SMAC_CO.h1 ? "high" : "caution", message: l(`CO de cabina ${Math.round(snap.cab.CO)} ppm: supera el límite de ${snap.cab.CO > SMAC_CO.h1 ? "1 h" : "24 h"}`, `Cabin CO ${Math.round(snap.cab.CO)} ppm: above the ${snap.cab.CO > SMAC_CO.h1 ? "1 h" : "24 h"} limit`), cause: l("Límites SMAC para CO: 100 ppm (24 h) y 425 ppm (1 h).", "SMAC limits for CO: 100 ppm (24 h) and 425 ppm (1 h)."), sources: ["SMAC", "B2"] });
  if (snap && ppO2(snap.cab.O2, snap.P) < 16)
    live.push({ id: "HYP", level: "high", message: l(`ppO₂ ${num(ppO2(snap.cab.O2, snap.P), 1, "es")} kPa: atmósfera no respirable`, `ppO₂ ${num(ppO2(snap.cab.O2, snap.P), 1, "en")} kPa: atmosphere not breathable`), cause: l("La despresurización apaga el fuego, pero exige a la tripulación con respiradores.", "Depressurisation puts the fire out but requires the crew on breathing apparatus."), sources: ["SOFIE"] });
  const alerts = [...live, ...base.alerts];

  const heating = snap && snap.fire === "none" && snap.Ts > snap.tig * 0.6;
  const state = FIRE_LABEL[heating ? "heating" : (snap?.fire ?? "none")];
  const canIgnite = !!mat.frontier && snap?.fire !== "burning" && snap?.fire !== "burnout";
  const droplet = mat.form === "droplet";
  const outO2 = s.o2 > 40 || s.o2 < 10;

  const ignite = (): void => {
    if (!worldCtl.ignite()) toast(l("Este ambiente no sostiene la llama de este material", "This environment does not sustain this material's flame"));
  };
  const actionOn = (k: ActionKey): boolean => !!snap && (k === "vent" ? snap.act.ventOff : k === "power" ? snap.act.powerCut : k === "pfe" ? snap.act.pfe > 0 : k === "mist" ? snap.act.mistT > 0 : snap.act.venting);

  return (
    <div className={styles.console} style={{ "--accent": m.accent } as React.CSSProperties}>
      {/* Barra de estado de la cabina */}
      <header className={styles.bar}>
        <Link href={href({ view: null })} className={styles.back} aria-label={t(l("Salir de la cabina", "Leave the cabin"))}>
          <ArrowLeft size={16} />
        </Link>
        <div className={styles.where}>
          <span>
            {m.code} · {t(l("CABINA", "CABIN"))}
          </span>
          <b>{t(m.name)}</b>
        </div>
        <span className={`${styles.state} ${styles[state.tone]}`}>
          <i />
          {t(state.text)}
        </span>
        <div className={styles.transport} role="group" aria-label={t(l("Tiempo del escenario", "Scenario time"))}>
          <button type="button" onClick={() => fireStore.set({ paused: !paused })} aria-label={paused ? t(l("Reanudar", "Resume")) : t(l("Pausar", "Pause"))}>
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          {[1, 5, 20].map((v) => (
            <button key={v} type="button" aria-pressed={speed === v} onClick={() => fireStore.set({ speed: v })}>
              ×{v}
            </button>
          ))}
          <button type="button" onClick={() => worldCtl.resetFire()} aria-label={t(l("Reiniciar escenario", "Restart scenario"))} title={t(l("Reiniciar escenario", "Restart scenario"))}>
            <RefreshCw size={14} />
          </button>
          <time>{clock(snap?.t ?? 0)}</time>
        </div>
        <div className={styles.cam} role="toolbar" aria-label={t(l("Cámara", "Camera"))}>
          <button type="button" onClick={() => worldCtl.zoom(-1)} title={t(l("Alejar", "Zoom out"))}>
            <ZoomOut size={15} />
          </button>
          <button type="button" onClick={() => worldCtl.zoom(1)} title={t(l("Acercar", "Zoom in"))}>
            <ZoomIn size={15} />
          </button>
          <button type="button" onClick={() => worldCtl.resetCamera()} title={t(l("Centrar en la llama", "Centre on the flame"))}>
            <LocateFixed size={15} />
          </button>
          <button type="button" aria-pressed={tracers} onClick={() => worldCtl.toggleTracers()} title={t(l("Mostrar el flujo de aire", "Show airflow"))}>
            <Wind size={15} />
          </button>
        </div>
      </header>

      {/* Escenario */}
      <aside className={styles.left}>
        <h3>{t(l("ESCENARIO", "SCENARIO"))}</h3>
        {m.variants.length > 1 && (
          <Segmented
            label={t(l("Atmósfera", "Atmosphere"))}
            value={s.variant.id}
            options={m.variants.map((v) => ({ value: v.id, label: t(v.name), title: t(v.note) }))}
            onChange={(id) => set({ atm: id === m.variants[0]!.id ? null : id, o2: null, p: null })}
          />
        )}
        <Segmented
          wrap
          label={t(l("Material", "Material"))}
          value={s.mat}
          options={MATERIAL_LIST.map((x) => ({ value: x.id, label: t(x.short), title: t(x.name) }))}
          onChange={(id) => set({ mat: id === m.defaultMaterial ? null : id, vent: null })}
        />
        <p className={styles.matNote}>
          <b>{t(mat.tag)}</b> · {t(mat.note)}
        </p>
        <Slider label={t(l("Oxígeno", "Oxygen"))} display={`${num(s.o2, 1, lang)} %`} value={s.o2} min={12} max={45} step={0.5} onChange={(v) => set({ o2: v === s.variant.o2 ? null : v })} hint={outO2 ? t(l("Fuera del rango ensayado (10–40 %)", "Outside the tested range (10–40%)")) : `ppO₂ ${num(ppO2(s.o2, s.p), 1, lang)} kPa`} warn={outO2} />
        <Slider label={t(l("Presión", "Pressure"))} display={pressure(s.p, units, lang)} value={s.p} min={40} max={101.3} step={0.5} onChange={(v) => set({ p: Math.abs(v - s.variant.P) < 0.26 ? null : v })} />
        <Slider label={t(l("Ventilación", "Ventilation"))} display={`${num(s.vent, 0, lang)} cm/s`} value={s.vent} min={0} max={40} step={1} onChange={(v) => set({ vent: v === (droplet ? 0 : m.vent) ? null : v })} hint={`${t(l("Flujo efectivo", "Effective flow"))} ${num(base.U, 1, lang)} cm/s · ${gravity(s.g, lang)}`} />
        <Slider label={t(l("Sobrecarga eléctrica", "Electrical overload"))} display={`${num(s.heat, 0, lang)} W`} value={s.heat} min={0} max={250} step={5} onChange={(v) => set({ heat: v || null })} hint={snap ? `${t(l("Superficie", "Surface"))} ${num(snap.Ts, 0, lang)} °C · ${t(l("ignición", "ignition"))} ${num(snap.tig, 0, lang)} °C` : undefined} warn={!!heating} />
        {!droplet && mat.frontier && (
          <Segmented
            label={t(l("Propagación", "Flame spread"))}
            value={s.mode}
            options={[
              { value: "concurrent", label: t(l("A favor del flujo", "Concurrent")) },
              { value: "opposed", label: t(l("En contra", "Opposed")) },
            ]}
            onChange={(v) => set({ mode: v === "concurrent" ? null : v })}
          />
        )}
        <button type="button" className={styles.ignite} onClick={ignite} disabled={!canIgnite}>
          <Flame size={16} />
          {mat.frontier ? t(l("ENCENDER MUESTRA", "IGNITE SAMPLE")) : t(l("SIN FRONTERA: SOLO HUMO", "NO BOUNDARY: SMOKE ONLY"))}
        </button>
      </aside>

      {/* Estado: margen, alertas y respuesta */}
      <aside className={styles.right}>
        <section>
          <h3>{t(l("MARGEN DE INFLAMABILIDAD", "FLAMMABILITY MARGIN"))}</h3>
          <MarginGauge data={gauge} dense />
        </section>
        <section className={styles.alertBox}>
          <h3>
            {t(l("ALERTAS", "ALERTS"))} <em>{alerts.length}</em>
          </h3>
          <div className={styles.scroll}>
            <AlertList alerts={alerts} compact />
          </div>
        </section>
        <section>
          <h3>{t(l("RESPUESTA DE LA TRIPULACIÓN", "CREW RESPONSE"))}</h3>
          <div className={styles.actions}>
            {ACTIONS.map((a) => {
              const on = actionOn(a.key);
              const Icon = a.icon;
              return (
                <button key={a.key} type="button" aria-pressed={on} title={t(a.hint)} onClick={() => worldCtl.action(a.key)} className={a.key === "venting" ? styles.wide : undefined}>
                  <Icon size={15} />
                  <span>{on ? t(a.active) : t(a.label)}</span>
                </button>
              );
            })}
          </div>
          <ul className={styles.log} aria-live="polite">
            {(snap?.log ?? []).slice(-3).reverse().map((e, i) => (
              <li key={`${e.t}-${e.key}-${i}`}>
                <time>{clock(e.t)}</time>
                {t(LOG_TEXT[e.key])}
              </li>
            ))}
          </ul>
        </section>
      </aside>

      {/* Comparador: la misma llama en la Tierra */}
      <figure className={styles.inset}>
        <div data-inset="earth" />
        <figcaption>{t(l("Misma llama en la Tierra · 1 g", "Same flame on Earth · 1 g"))}</figcaption>
      </figure>

      {/* Telemetría */}
      <section className={styles.charts} aria-label={t(l("Telemetría", "Telemetry"))}>
        <Sparkline title={t(l("POTENCIA", "FIRE POWER"))} display={`${num(snap?.Q ?? 0, 2, lang)} kW`} t={hist.t} series={[{ values: hist.q, color: "#ff8738", fill: true }]} yMaxFloor={0.5} tone={(snap?.Q ?? 0) > 0.05 ? "warn" : "ok"} />
        <Sparkline
          title={t(l("O₂ LLAMA · FRONTERA", "FLAME O₂ · BOUNDARY"))}
          display={`${num(snap ? snap.O2l * (1 - snap.CO2l / 100) : s.o2, 1, lang)} %`}
          t={hist.t}
          series={[
            { values: hist.o2, color: "#35d8f2" },
            { values: hist.loc, color: "#ff5c6c", dashed: true },
          ]}
          yMin={8}
          yMaxFloor={s.o2 + 3}
        />
        <Sparkline title={t(l("CO CABINA", "CABIN CO"))} display={`${num(snap?.cab.CO ?? 0, 0, lang)} ppm`} t={hist.t} series={[{ values: hist.co, color: "#ffc53d", fill: true }]} yMaxFloor={120} thresholds={[{ y: SMAC_CO.h24, label: "SMAC 24 h", color: "#ff5c6c" }]} tone={(snap?.cab.CO ?? 0) > SMAC_CO.h24 ? "bad" : "ok"} />
        <Sparkline title={t(l("DETECTOR", "DETECTOR"))} display={`${num(snap?.det ?? 0, 2, lang)} %/ft`} t={hist.t} series={[{ values: hist.det, color: "#b68cff", fill: true }]} yMaxFloor={1.3} thresholds={[{ y: ALARM_OBSC, label: t(l("alarma", "alarm")), color: "#ff5c6c" }]} tone={snap?.alarm ? "bad" : "ok"} />
        <div className={styles.kpis}>
          <div>
            <span>{t(l("Frente", "Front"))}</span>
            <b>{droplet ? `D ${num(snap?.D ?? 0, 2, lang)} mm` : `${num((snap?.v ?? 0) * 10, 2, lang)} mm/s`}</b>
          </div>
          <div>
            <span>CO₂</span>
            <b>{num(snap?.cab.CO2 ?? 0, 0, lang)} ppm</b>
          </div>
          <div>
            <span>{t(l("O₂ cabina", "Cabin O₂"))}</span>
            <b>{num(snap?.cab.O2 ?? s.o2, 1, lang)} %</b>
          </div>
          <div>
            <span>{t(l("Cabina", "Cabin"))}</span>
            <b>
              {num(snap?.cab.T ?? 22, 1, lang)} °C · {pressure(snap?.P ?? s.p, units, lang)}
            </b>
          </div>
        </div>
      </section>
    </div>
  );
}
