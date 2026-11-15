/**
 * Mitos y hechos del fuego sin gravedad, de la guía oficial de NASA
 * "A Researcher's Guide to: Combustion Science" (NP-2015-10-034-JSC).
 *
 * El backend del equipo sirve estas mismas reglas en `GET /api/rules`; esta
 * copia tipada y bilingüe es la que usa la plataforma cuando el backend no
 * está disponible y la que aporta la versión en inglés de cada regla.
 */
import { l, type L } from "./i18n";

export interface Myth {
  /** Identificador compartido con el backend (`RULE-0n-…`). */
  id: string;
  myth: L;
  fact: L;
  /** Clave en el catálogo de fuentes. */
  sources: string[];
}

export const MYTHS: Myth[] = [
  {
    id: "RULE-01-QUIESCENT-FLAME",
    myth: l("Un fuego estable no puede existir sin gravedad ni ventilación.", "A steady fire cannot exist without gravity or ventilation."),
    fact: l(
      "En microgravedad, una llama de vela puede arder por difusión durante más de 45 minutos, casi invisible a simple vista, y las bolas de llama premezcladas (SOFBALL) arden más de 40 minutos con cerca de 1 W.",
      "In microgravity a candle flame can burn by diffusion for more than 45 minutes, almost invisible to the eye, and premixed flame balls (SOFBALL) burn for over 40 minutes at about 1 W.",
    ),
    sources: ["GUIDE15"],
  },
  {
    id: "RULE-02-LOW-FLOW-PEAK-HAZARD",
    myth: l("Apagar la ventilación extingue el fuego de inmediato, y los ensayos terrestres son conservadores.", "Switching ventilation off puts the fire out at once, and Earth tests are conservative."),
    fact: l(
      "Hay una zona de flujo bajo, cerca de 10 cm/s —típica de la ventilación de una nave—, donde la inflamabilidad es máxima y los materiales arden con menos oxígeno que en la Tierra. Por eso el Test 1 de NASA-STD-6001 podría no ser conservador.",
      "There is a low-flow zone, near 10 cm/s —typical of spacecraft ventilation—, where flammability peaks and materials burn with less oxygen than on Earth. That is why NASA-STD-6001 Test 1 may not be conservative.",
    ),
    sources: ["GUIDE15", "B9"],
  },
  {
    id: "RULE-03-UPSTREAM-SPREAD",
    myth: l("El fuego se propaga en la dirección del flujo de aire.", "Fire spreads in the direction of the airflow."),
    fact: l(
      "En microgravedad y con flujos lentos, las llamas sobre combustibles delgados avanzan preferentemente contra la corriente, hacia el oxígeno fresco: al revés que en la Tierra.",
      "In microgravity with slow flows, flames over thin fuels spread preferentially upstream, towards fresh oxygen: the opposite of Earth.",
    ),
    sources: ["GUIDE15"],
  },
  {
    id: "RULE-04-EXTINGUISHER-ENTRAINMENT",
    myth: l("Un chorro local de gas inerte siempre apaga la llama.", "A local jet of inert gas always puts the flame out."),
    fact: l(
      "BASS mostró que un chorro local de nitrógeno puede arrastrar oxígeno del ambiente hacia la llama y fortalecerla en microgravedad.",
      "BASS showed that a local nitrogen jet can entrain ambient oxygen into the flame and strengthen it in microgravity.",
    ),
    sources: ["GUIDE15"],
  },
  {
    id: "RULE-05-COOL-FLAME-REIGNITION",
    myth: l("Si la llama visible se apaga, el incendio terminó.", "If the visible flame goes out, the fire is over."),
    fact: l(
      "En gotas de combustible líquido (FLEX), tras extinguirse la llama caliente por radiación puede persistir una llama fría, invisible y de baja temperatura, que sigue vaporizando combustible y puede reencenderse.",
      "In liquid fuel droplets (FLEX), after the hot flame is extinguished by radiation a cool flame —invisible and low-temperature— can persist, keep vaporising fuel and reignite.",
    ),
    sources: ["GUIDE15", "FLEX15"],
  },
];
