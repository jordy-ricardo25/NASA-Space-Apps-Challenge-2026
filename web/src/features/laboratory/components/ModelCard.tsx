"use client";

import { l, type L } from "@/content/i18n";
import { SourceChips } from "@/shared/components/EvidenceBadge";
import { useLang } from "@/shared/hooks/useLang";
import styles from "./Lab.module.scss";

const CHECKS: { item: L; ref: string; model: string; src: string }[] = [
  { item: l("Flujo equivalente a la flotabilidad (1/6 g)", "Buoyancy-equivalent flow (1/6 g)"), ref: "19.3 cm/s", model: "19.3 cm/s", src: "B5" },
  { item: l("Propagación SIBAL a favor, 20 cm/s", "SIBAL concurrent spread, 20 cm/s"), ref: "1.8 mm/s", model: "1.8 mm/s", src: "B10" },
  { item: l("Propagación SIBAL en contra, 20 cm/s", "SIBAL opposed spread, 20 cm/s"), ref: "1.3 mm/s", model: "1.3 mm/s", src: "B10" },
  { item: l("Potencia de la tela de Saffire-1", "Saffire-1 fabric heat release"), ref: "1.2 ± 0.3 kW", model: "1.5 kW", src: "B10" },
  { item: l("PMMA dos caras, Saffire VI-3", "Two-sided PMMA, Saffire VI-3"), ref: "3.08 kW", model: "3.1 kW", src: "B2" },
  { item: l("PMMA: diferencia 1 g − µg a 10 cm/s", "PMMA: 1 g − µg gap at 10 cm/s"), ref: "3–4 pts", model: "3.6 pts", src: "LIV26" },
  { item: l("PMMA cerca de g lunar, 57,6 kPa", "PMMA near lunar g, 57.6 kPa"), ref: "13.2–15.2 %", model: "15.2 %", src: "OLSON24" },
  { item: l("Papel en base lunar, 56,5 kPa", "Paper at lunar base, 56.5 kPa"), ref: "18.6 %", model: "18.8 %", src: "B5" },
  { item: l("Nomex: LOC a 100 y 40 kPa (1 g)", "Nomex: LOC at 100 and 40 kPa (1 g)"), ref: "24 / 35 %", model: "24.1 / 35.2 %", src: "B19" },
  { item: l("Relación crítica CO₂/O₂ y He/O₂", "Critical CO₂/O₂ and He/O₂ ratio"), ref: "1.12 / 2.1", model: "1.12 / 2.1", src: "B17" },
  { item: l("Gota de metanol 30CAL03 (K, duración)", "Methanol droplet 30CAL03 (K, duration)"), ref: "0.48 mm²/s · 6.34 s", model: "0.478 · 6.34 s", src: "PSI69" },
];

/**
 * Ficha del modelo: qué predice, con qué datos se calibró, cómo se verificó,
 * en qué rango es válido y qué no puede responder.
 */
export function ModelCard() {
  const { t } = useLang();
  return (
    <article className={styles.card}>
      <header>
        <span>{t(l("FICHA DEL MODELO · fif-physics-1.0", "MODEL CARD · fif-physics-1.0"))}</span>
        <h2>{t(l("Frontera de inflamabilidad y crecimiento del fuego", "Flammability boundary and fire growth"))}</h2>
      </header>
      <div className={styles.cardGrid}>
        <section>
          <h3>{t(l("QUÉ PREDICE", "WHAT IT PREDICTS"))}</h3>
          <p>{t(l("El oxígeno mínimo con el que un material propaga la llama, el margen del ambiente frente a esa frontera, la velocidad del frente, la potencia del fuego y la acumulación de CO y CO₂ en la cabina.", "The minimum oxygen at which a material spreads flame, the environment's margin against that boundary, the front speed, the fire's heat release and the build-up of CO and CO₂ in the cabin."))}</p>
          <h3>{t(l("CÓMO ESTÁ CONSTRUIDO", "HOW IT IS BUILT"))}</h3>
          <p>{t(l("Modelo físico de orden reducido: curva en U frente al flujo, flotabilidad g^(1/3), efecto de la presión y de los diluyentes, ley d² para gotas y cabina bien mezclada. Interpretable y calibrado con ensayos publicados; no usa aprendizaje profundo.", "Reduced-order physical model: U-curve versus flow, g^(1/3) buoyancy, pressure and diluent effects, d² law for droplets and a well-mixed cabin. Interpretable and calibrated to published tests; no deep learning."))}</p>
          <h3>{t(l("DOMINIO VÁLIDO", "VALID DOMAIN"))}</h3>
          <p>{t(l("O₂ 10–40 % · presión 20–152 kPa · flujo 0–55 cm/s · gravedad 0–1 g. Fuera de ese rango se dispara la alerta de dominio.", "O₂ 10–40% · pressure 20–152 kPa · flow 0–55 cm/s · gravity 0–1 g. Outside that range the domain alert fires."))}</p>
          <h3>{t(l("QUÉ NO PUEDE RESPONDER", "WHAT IT CANNOT ANSWER"))}</h3>
          <p>{t(l("No valida un material para vuelo ni sustituye a NASA-STD-6001. En gravedad parcial entrega una predicción sin validación directa (evidencia D) hasta que FM2 mida en la Luna. No da dosis de agente para una cabina ni ubica detectores.", "It does not qualify a material for flight or replace NASA-STD-6001. In partial gravity it gives a prediction with no direct validation (evidence D) until FM2 measures on the Moon. It gives no agent dose for a cabin and does not place detectors."))}</p>
        </section>
        <section>
          <h3>{t(l("VERIFICACIÓN CONTRA VALORES PUBLICADOS", "VERIFICATION AGAINST PUBLISHED VALUES"))}</h3>
          <table>
            <thead>
              <tr>
                <th>{t(l("Comprobación", "Check"))}</th>
                <th>{t(l("Publicado", "Published"))}</th>
                <th>{t(l("Modelo", "Model"))}</th>
              </tr>
            </thead>
            <tbody>
              {CHECKS.map((c) => (
                <tr key={c.item.en}>
                  <td>{t(c.item)}</td>
                  <td>{c.ref}</td>
                  <td>{c.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.cardNote}>{t(l("Estas comprobaciones corren como pruebas automáticas del repositorio (24 pruebas).", "These checks run as the repository's automated tests (24 tests)."))}</p>
          <SourceChips ids={["B5", "B10", "B2", "LIV26", "OLSON24", "B19", "B17", "PSI69"]} max={8} />
        </section>
      </div>
    </article>
  );
}
