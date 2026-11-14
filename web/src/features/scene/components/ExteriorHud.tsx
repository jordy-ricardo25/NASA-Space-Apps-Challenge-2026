"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, DoorOpen, FlaskConical, LocateFixed, Maximize, Rotate3d, X, ZoomIn, ZoomOut } from "lucide-react";
import { l } from "@/content/i18n";
import type { ModuleDef } from "@/content/modules";
import { AlertList } from "@/features/alerts/components/AlertList";
import { assess } from "@/features/fire/engine/analysis";
import { MATERIALS } from "@/features/fire/engine/materials";
import { rankInvestigations } from "@/features/investigations/lib/ranking";
import { MarginGauge } from "@/features/laboratory/components/MarginGauge";
import { worldCtl, worldStore } from "@/features/world/controller";
import { Meter, Segmented } from "@/shared/components/Controls";
import { EvidenceBadge, SourceChips } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, toast } from "@/shared/lib/appStore";
import { gravity, num, pressure, pct } from "@/shared/lib/format";
import { useStore } from "@/shared/lib/store";
import { ppO2 } from "@/shared/lib/units";
import { useScenario } from "../hooks/useScenario";
import { DragHint } from "@/shared/components/DragHint";
import styles from "./ExteriorHud.module.scss";

/**
 * Escena de un módulo vista desde fuera: panel de información, parámetros del
 * ambiente, controles de cámara y el panel de detalles (alertas y ranking).
 * La misma estructura sirve para los cuatro módulos.
 */
export function ExteriorHud({ module: m }: { module: ModuleDef }) {
  const { t, lang } = useLang();
  const { scenario: s, set, go, href } = useScenario(m);
  const units = useStore(appStore, (st) => st.units);
  const rotating = useStore(worldStore, (st) => st.rotating);
  const [component, setComponent] = useState(0);
  const a = useMemo(() => assess({ mat: s.mat, g: s.g, o2: s.o2, P: s.p, vent: s.vent, undefinedAtmosphere: s.undefinedAtmosphere }), [s]);
  const ranked = useMemo(() => rankInvestigations({ o2: s.o2, p: s.p, g: s.g }).slice(0, 4), [s.o2, s.p, s.g]);
  const mat = MATERIALS[s.mat];
  const labHref = `/laboratorio?env=${m.id}&atm=${s.variant.id}&mat=${s.mat}&o2=${s.o2}&p=${s.p}&flow=${s.vent}`;
  const details = s.panel === "details";

  return (
    <div className={styles.hud} style={{ "--accent": m.accent } as React.CSSProperties}>
      <header className={styles.crumb}>
        <Link href="/" className={styles.back} aria-label={t(l("Volver al centro de mando", "Back to the command centre"))}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span>
            {t(l("Módulos", "Modules"))} › {m.code}
          </span>
          <h1>{t(m.name)}</h1>
          <DragHint />
        </div>
      </header>

      <aside className={styles.info}>
        <div className={styles.head}>
          <span className={styles.code}>ID: {m.code}</span>
          <h2>{t(m.label)}</h2>
          <span className={styles.kind}>{t(m.kind)}</span>
        </div>
        <p className={styles.desc}>{t(m.description)}</p>

        <div>
          <h3>{t(l("ESPECIALIDADES", "SPECIALTIES"))}</h3>
          <ul className={styles.specs}>
            {m.specialties.map((sp) => (
              <li key={sp.es}>
                <Check size={13} />
                {t(sp)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>{t(l("COMPONENTES", "COMPONENTS"))}</h3>
          <div className={styles.comps}>
            {m.components.map((c, i) => (
              <button key={c.name.es} type="button" aria-pressed={i === component} onClick={() => setComponent(i)}>
                {t(c.name)}
              </button>
            ))}
          </div>
          <p className={styles.compInfo}>{t(m.components[component]!.info)}</p>
        </div>

        <div className={styles.cta}>
          <button type="button" className={styles.primary} onClick={() => go({ view: "cabina", panel: null })}>
            <DoorOpen size={16} />
            {t(l("ENTRAR A LA CABINA", "ENTER THE CABIN"))}
          </button>
          <Link href={href({ panel: details ? null : "details" })} className={styles.secondary} scroll={false}>
            {t(l("VER DETALLES", "VIEW DETAILS"))}
            <ArrowRight size={14} />
          </Link>
        </div>
      </aside>

      <section className={styles.telemetry} aria-label={t(l("Parámetros del ambiente", "Environment parameters"))}>
        <div className={styles.telHead}>
          <h3>{t(l("ATMÓSFERA DE CABINA", "CABIN ATMOSPHERE"))}</h3>
          <EvidenceBadge level={a.evidence} />
        </div>
        {m.variants.length > 1 && (
          <Segmented
            value={s.variant.id}
            options={m.variants.map((v) => ({ value: v.id, label: t(v.name), title: t(v.note) }))}
            onChange={(id) => {
              set({ atm: id === m.variants[0]!.id ? null : id, o2: null, p: null });
              const v = m.variants.find((x) => x.id === id);
              if (v) toast(l(`Atmósfera: ${v.name.es}`, `Atmosphere: ${v.name.en}`));
            }}
          />
        )}
        <div className={styles.meters}>
          <Meter label={t(l("Oxígeno", "Oxygen"))} display={`${num(s.o2, 1, lang)} %`} fraction={s.o2 / 40} color="var(--color-accent)" />
          <Meter label={t(l("Presión", "Pressure"))} display={pressure(s.p, units, lang)} fraction={s.p / 101.3} color="var(--color-info)" />
          <Meter label="ppO₂" display={`${num(ppO2(s.o2, s.p), 1, lang)} kPa`} fraction={ppO2(s.o2, s.p) / 21.2} color="var(--color-success)" />
          <Meter label={t(l("Gravedad", "Gravity"))} display={gravity(s.g, lang)} fraction={Math.cbrt(s.g)} color="var(--color-warm)" />
        </div>
        <p className={styles.telNote}>
          {s.undefinedAtmosphere
            ? t(l("Atmósfera marciana sin definir en las fuentes: se muestra una hipótesis.", "Martian atmosphere undefined in the sources: a hypothesis is shown."))
            : t(m.evidence)}
        </p>
      </section>

      <div className={styles.controls} role="toolbar" aria-label={t(l("Controles de cámara", "Camera controls"))}>
        <button type="button" aria-pressed={rotating} onClick={() => worldCtl.toggleRotate()} title={t(l("Giro automático", "Auto-rotate"))}>
          <Rotate3d size={17} />
        </button>
        <button type="button" onClick={() => worldCtl.zoom(-1)} title={t(l("Alejar", "Zoom out"))}>
          <ZoomOut size={17} />
        </button>
        <button type="button" onClick={() => worldCtl.zoom(1)} title={t(l("Acercar", "Zoom in"))}>
          <ZoomIn size={17} />
        </button>
        <button type="button" onClick={() => worldCtl.resetCamera()} title={t(l("Centrar", "Centre"))}>
          <LocateFixed size={17} />
        </button>
        <button
          type="button"
          onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen().catch(() => undefined))}
          title={t(l("Pantalla completa", "Full screen"))}
        >
          <Maximize size={17} />
        </button>
      </div>

      {details && (
        <section className={styles.details} aria-label={t(l("Detalles del ambiente", "Environment details"))}>
          <header>
            <div>
              <span>{t(l("ANÁLISIS DEL AMBIENTE", "ENVIRONMENT ANALYSIS"))}</span>
              <h2>
                {t(mat.short)} · {t(s.variant.name)}
              </h2>
            </div>
            <Link href={href({ panel: null })} scroll={false} aria-label={t(l("Cerrar", "Close"))}>
              <X size={18} />
            </Link>
          </header>
          <div className={styles.detailGrid}>
            <div className={styles.col}>
              <h3>{t(l("MARGEN DE INFLAMABILIDAD", "FLAMMABILITY MARGIN"))}</h3>
              <MarginGauge data={a} />
              <h3>{t(l("INVESTIGACIONES MÁS RELEVANTES", "MOST RELEVANT INVESTIGATIONS"))}</h3>
              <ol className={styles.rank}>
                {ranked.map((r, i) => (
                  <li key={r.inv.id}>
                    <i>{i + 1}</i>
                    <div>
                      <b>{r.inv.name}</b>
                      <span>{t(r.inv.platform)}</span>
                    </div>
                    <em style={{ "--value": pct(r.score) } as React.CSSProperties}>{Math.round(r.score * 100)}</em>
                  </li>
                ))}
              </ol>
              <div className={styles.detailLinks}>
                <Link href={labHref} className={styles.primary}>
                  <FlaskConical size={15} />
                  {t(l("ABRIR EN EL LABORATORIO", "OPEN IN THE LABORATORY"))}
                </Link>
                <SourceChips ids={s.variant.sources} />
              </div>
            </div>
            <div className={styles.col}>
              <h3>{t(l("ALERTAS DE ANÁLISIS", "ANALYSIS ALERTS"))}</h3>
              <div className={styles.alerts}>
                <AlertList alerts={a.alerts} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
