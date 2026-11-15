"use client";

import { useEffect, useState } from "react";
import { Database, TriangleAlert } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { MODULES } from "@/content/modules";
import { Segmented } from "@/shared/components/Controls";
import { Pager } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import { gravity, num } from "@/shared/lib/format";
import type { ApiEnvelope } from "@/shared/types/api";
import type { PsiData } from "../server/psi.service";
import styles from "./Psi.module.scss";

const BAND: Record<string, L> = { critical: l("Crítico", "Critical"), high: l("Alto", "High"), moderate: l("Moderado", "Moderate"), low: l("Bajo", "Low") };
const RELEVANCE: Record<string, L> = { direct: l("Directa", "Direct"), indirect: l("Indirecta", "Indirect") };
const MODE: Record<string, L> = { opposed: l("Contra el flujo", "Opposed flow"), concurrent: l("A favor del flujo", "Concurrent flow") };
const CLASS: Record<string, L> = {
  textil: l("Textil", "Textile"),
  pelicula: l("Película", "Film"),
  termoplastico: l("Termoplástico", "Thermoplastic"),
  elastomero: l("Elastómero", "Elastomer"),
  solido: l("Sólido", "Solid"),
  liquido: l("Líquido", "Liquid"),
  gas: l("Gas", "Gas"),
};
const PER_PAGE = 7;

interface PsiPanelProps {
  /** Módulo activo (`?env=` de la Guía). */
  envId: string;
  onEnv: (id: string) => void;
  page: number;
  onPage: (page: number) => void;
}

/**
 * Datos de NASA PSI procesados por el backend del equipo: ranking de
 * hallazgos para el ambiente elegido, con su índice RPI, y a la derecha las
 * observaciones por clase de material y las brechas que el corpus declara.
 */
export function PsiPanel({ envId, onEnv, page, onPage }: PsiPanelProps) {
  const { t, lang } = useLang();
  const [state, setState] = useState<{ env: string; data: ApiEnvelope<PsiData> | null; failed: boolean }>({ env: "", data: null, failed: false });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/psi?env=${encodeURIComponent(envId)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ApiEnvelope<PsiData>>) : Promise.reject(new Error("psi"))))
      .then((data) => setState({ env: envId, data, failed: false }))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setState({ env: envId, data: null, failed: true });
      });
    return () => ctrl.abort();
  }, [envId]);

  const loading = state.env !== envId;
  const value = state.data?.value;
  const pages = value ? Math.ceil(value.findings.length / PER_PAGE) : 0;
  const current = Math.min(page, Math.max(0, pages - 1));
  const rows = value?.findings.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE) ?? [];
  const most = Math.max(1, ...(value?.coverage.map((c) => c.observations) ?? [1]));
  const pctO2 = (x: number | null | undefined): string => (x == null ? "∅" : num(x * 100, 1, lang));

  return (
    <div className={styles.psi}>
      <div className={styles.toolbar}>
        <Segmented label={t(l("Ambiente", "Environment"))} value={envId} options={MODULES.map((m) => ({ value: m.id, label: t(m.label) }))} onChange={onEnv} />
        {value?.environment && (
          <p className={styles.env}>
            <Database size={14} aria-hidden="true" />
            <span>
              {t(l("Calculado para", "Computed for"))} <b>{value.environment.label}</b>: {gravity(value.environment.gravity_g, lang)} · {num(value.environment.o2_fraction * 100, 0, lang)} % O₂ · {num(value.environment.pressure_atm, 2, lang)} atm ·{" "}
              {num(value.observations, 0, lang)} {t(l("observaciones", "observations"))} · {state.data?.model_version}
            </span>
          </p>
        )}
        <Pager page={current} pages={pages} onPage={onPage} />
      </div>

      {state.failed && !loading ? (
        <p className={styles.error} role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          {t(l("No se pudieron cargar los datos de PSI. Vuelve a intentarlo en un momento.", "PSI data could not be loaded. Try again in a moment."))}
        </p>
      ) : (
        <div className={styles.layout} aria-busy={loading}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{t(l("Experimento y material", "Experiment and material"))}</th>
                <th>{t(l("O₂ ensayado", "O₂ tested"))}</th>
                <th>{t(l("Observ.", "Obs."))}</th>
                <th>{t(l("Relevancia", "Relevance"))}</th>
                <th title={t(l("Índice de 0 a 100 que calcula el backend para este ambiente", "Index from 0 to 100 computed by the backend for this environment"))}>RPI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f, i) => (
                <tr key={f.key}>
                  <td>{current * PER_PAGE + i + 1}</td>
                  <td>
                    <b>{f.experiment}</b>
                    <span>
                      {f.material ?? t(l("Material sin registrar", "Material not recorded"))}
                      {f.flame_mode ? ` · ${t(MODE[f.flame_mode] ?? l(f.flame_mode, f.flame_mode))}` : ""}
                      {f.facility ? ` · ${f.facility}` : ""}
                    </span>
                  </td>
                  <td>
                    {f.o2_min == null && f.o2_max == null ? `∅ ${t(l("sin registrar", "not recorded"))}` : `${pctO2(f.o2_min)}–${pctO2(f.o2_max)} %`}
                  </td>
                  <td>{num(f.observations, 0, lang)}</td>
                  <td>{t(RELEVANCE[f.relevance] ?? l(f.relevance, f.relevance))}</td>
                  <td>
                    <span className={styles.rpi} data-band={f.band} style={{ "--w": `${Math.min(100, Math.max(0, f.rpi))}%` } as React.CSSProperties}>
                      <i />
                      <output>{f.rpi}</output>
                      <em>{t(BAND[f.band] ?? l(f.band, f.band))}</em>
                    </span>
                  </td>
                </tr>
              ))}
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6}>{t(l("Cargando datos de PSI…", "Loading PSI data…"))}</td>
                </tr>
              )}
            </tbody>
          </table>

          <aside className={styles.side}>
            <section>
              <h3>{t(l("Observaciones por clase de material", "Observations by material class"))}</h3>
              <ul className={styles.bars}>
                {value?.coverage.map((c) => (
                  <li key={c.material_class} style={{ "--w": `${(c.observations / most) * 100}%` } as React.CSSProperties}>
                    <span>{t(CLASS[c.material_class] ?? l(c.material_class, c.material_class))}</span>
                    <i />
                    <output>{num(c.observations, 0, lang)}</output>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{t(l("Brechas que declara el corpus", "Gaps declared by the corpus"))}</h3>
              <ul className={styles.gaps}>
                {value?.declared.map((g) => (
                  <li key={g.area} lang="es">
                    <b>{g.area}</b>
                    <span>{g.bound}</span>
                    <p>{g.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
