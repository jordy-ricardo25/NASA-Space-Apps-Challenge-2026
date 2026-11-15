"use client";

import { ChevronLeft, ChevronRight, FileCheck2, Layers, ShieldAlert, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { l } from "@/content/i18n";
import { getModule, type ModuleId } from "@/content/modules";
import { BAND, FACTOR, MODE } from "@/features/assistant/lib/findingText";
import type { PsiData, PsiFinding } from "@/features/psi/server/psi.service";
import { useLang } from "@/shared/hooks/useLang";
import { useSize } from "@/shared/hooks/useSize";
import { gravity, num, signed } from "@/shared/lib/format";
import { CARD_HEIGHT, LOCAL_ENVS, PAGE_SIZE } from "../lib/local";
import styles from "./Local.module.scss";

/** Separación entre tarjetas del ranking (px), igual que en la hoja de estilos. */
const GAP = 6;

const BAND_ICON: Record<string, typeof ShieldAlert> = { critical: ShieldAlert, high: ShieldAlert, moderate: TriangleAlert, low: ShieldCheck };

/** Texto corto de un hallazgo para el chat y los títulos. */
export const findingLabel = (f: PsiFinding): string => (f.material ? `${f.experiment} · ${f.material}` : f.experiment);

/**
 * Ambientes del backend: gravedad, oxígeno y presión de cada uno. Elegir uno
 * recalcula el ranking de hallazgos para ese ambiente.
 */
export function EnvList({ data, active, onPick }: { data: Partial<Record<ModuleId, PsiData>>; active: ModuleId; onPick: (id: ModuleId) => void }) {
  const { lang, t } = useLang();
  return (
    <section className={styles.envs} aria-label={t(l("Ambientes habitables", "Habitable environments"))}>
      <h2>{t(l("AMBIENTES HABITABLES", "HABITABLE ENVIRONMENTS"))}</h2>
      <ul>
        {LOCAL_ENVS.map((id) => {
          const env = data[id]?.environment;
          const mod = getModule(id);
          if (!env || !mod) return null;
          return (
            <li key={id}>
              <button type="button" aria-pressed={id === active} onClick={() => onPick(id)}>
                <code>{mod.code}</code>
                <b>{env.label}</b>
                <span>
                  {gravity(env.gravity_g, lang)} · {num(env.o2_fraction * 100, 0, lang)} % O₂ · {num(env.pressure_atm, 2, lang)} atm
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Paso entre páginas del ranking: anterior, posición y siguiente (una sola línea con cualquier número de páginas). */
function PageSteps({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  const { t } = useLang();
  if (pages <= 1) return null;
  return (
    <nav className={styles.steps} aria-label={t(l("Páginas del ranking", "Ranking pages"))}>
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 0} aria-label={t(l("Página anterior", "Previous page"))}>
        <ChevronLeft size={15} aria-hidden="true" />
      </button>
      <span>
        {page + 1} / {pages}
      </span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages - 1} aria-label={t(l("Página siguiente", "Next page"))}>
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </nav>
  );
}

interface RankingProps {
  psi: PsiData;
  /** Los datos vienen del backend en vivo (`true`) o de la copia de respaldo. */
  live: boolean;
  page: number;
  onPage: (page: number) => void;
  activeKey: string | null;
  busy: boolean;
  /** Pide a Flamey que explique el hallazgo. */
  onInterpret: (finding: PsiFinding) => void;
}

/**
 * Ranking de hallazgos de NASA PSI por su índice RPI para el ambiente
 * elegido, con los factores que más puntos aportan. Paginado.
 */
export function LocalRanking({ psi, live, page, onPage, activeKey, busy, onInterpret }: RankingProps) {
  const { lang, t } = useLang();
  // Se muestran las tarjetas que caben en el alto del panel: la lista nunca desplaza la pantalla.
  const list = useSize<HTMLOListElement>({ width: 360, height: PAGE_SIZE * (CARD_HEIGHT + GAP) });
  const size = Math.max(1, Math.min(5, Math.floor((list.height + GAP) / (CARD_HEIGHT + GAP))));
  const pages = Math.max(1, Math.ceil(psi.findings.length / size));
  const current = Math.min(page, pages - 1);
  const shown = psi.findings.slice(current * size, current * size + size);
  return (
    <section className={styles.ranking} aria-label={t(l("Ranking de hallazgos", "Findings ranking"))}>
      <header>
        <h2>
          {t(l("RANKING PSI", "PSI RANKING"))} · {psi.environment?.label}
        </h2>
        <p>
          {psi.findings.length} {t(l("hallazgos ordenados por RPI", "findings ranked by RPI"))} · {num(psi.observations, 0, lang)} {t(l("observaciones", "observations"))}
        </p>
        {!live && <p className={styles.backup}>{t(l("Copia de respaldo: el backend no respondió, sin factores por hallazgo.", "Backup copy: the backend did not respond, no per-finding factors."))}</p>}
      </header>
      <ol ref={list.ref}>
        {shown.map((f, i) => {
          const Icon = BAND_ICON[f.band] ?? TriangleAlert;
          const top = [...(f.factors ?? [])].sort((a, b) => b.contribution - a.contribution).slice(0, 3);
          const max = Math.max(1, ...top.map((x) => x.contribution));
          return (
            <li key={f.key} data-active={f.key === activeKey || undefined}>
              <div className={styles.cardHead}>
                <span className={styles.rank}>
                  #{current * size + i + 1} · RPI {num(f.rpi, 0, lang)}
                </span>
                {f.facility && <span className={styles.facility}>{f.facility}</span>}
                <span className={styles.band} data-band={f.band}>
                  <Icon size={13} aria-hidden="true" />
                  {BAND[f.band]?.[lang] ?? f.band}
                </span>
              </div>
              <h3>
                {f.experiment}
                <span>
                  {f.material ?? t(l("material sin registrar", "material not recorded"))}
                  {f.flame_mode && MODE[f.flame_mode] ? ` · ${MODE[f.flame_mode]?.[lang]}` : ""}
                </span>
              </h3>
              {top.length > 0 && (
                <ul className={styles.factors}>
                  {top.map((x) => (
                    <li key={x.name}>
                      <span>{FACTOR[x.name]?.[lang] ?? x.name}</span>
                      <i style={{ "--fill": `${Math.round((x.contribution / max) * 100)}%` } as React.CSSProperties} />
                      <output>{signed(x.contribution, 1, lang)}</output>
                    </li>
                  ))}
                </ul>
              )}
              <footer>
                <span>
                  <Layers size={13} aria-hidden="true" />
                  {f.observations} {t(l("obs.", "obs."))}
                </span>
                {f.quality != null && (
                  <span>
                    <FileCheck2 size={13} aria-hidden="true" />
                    {t(l("calidad", "quality"))} {num(f.quality * 100, 0, lang)} %
                  </span>
                )}
                <button type="button" onClick={() => onInterpret(f)} disabled={busy}>
                  <Sparkles size={14} aria-hidden="true" />
                  {t(l("Interpretar", "Interpret"))}
                </button>
              </footer>
            </li>
          );
        })}
      </ol>
      <PageSteps page={current} pages={pages} onPage={onPage} />
    </section>
  );
}
