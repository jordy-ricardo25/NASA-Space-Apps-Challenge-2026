from dataclasses import replace

import pytest

from app.engine import kernel
from app.engine.environments import DILUENT_COEFF, ENVIRONMENTS


class Obs:
    def __init__(self, **kw):
        self.o2_min = kw.get("o2_min", 0.21)
        self.o2_max = kw.get("o2_max", 0.21)
        self.pressure_atm = kw.get("pressure_atm", 1.0)
        self.gravity_g = kw.get("gravity_g", 0.0)
        self.soot_index = kw.get("soot_index", 0.5)
        self.cool_flame = kw.get("cool_flame", False)
        self.quality = kw.get("quality", 0.9)
        self.material = kw.get("material", "PMMA")
        self.geometry = None
        self.flame_mode = kw.get("mode", "opposed")
        self.burn_rate_mm_s = kw.get("burn_rate_mm_s")


def test_orden_de_entornos():
    obs = Obs()
    scores = {k: kernel.score(obs, e).total for k, e in ENVIRONMENTS.items()}
    assert scores["eva"] > scores["iss"]
    assert scores["lunar"] > scores["iss"]


def test_quench_en_atmosfera_pobre():
    env = replace(ENVIRONMENTS["iss"], o2_fraction=0.15)
    assert kernel.burn_rate("PMMA", env, "opposed")["quenched"] is True


def test_conveccion_forzada_baja_el_limite():
    env = ENVIRONMENTS["iss"]
    assert kernel.quench_limit("SIBAL", env, "concurrent") < kernel.quench_limit("SIBAL", env, "opposed")


def test_quench_limite_sube_en_microgravedad():
    assert kernel.quench_limit("PMMA", ENVIRONMENTS["eva"]) > kernel.quench_limit("PMMA", ENVIRONMENTS["mars"])


def test_concurrente_mas_rapido_que_opuesto():
    env = ENVIRONMENTS["iss"]
    assert kernel.burn_rate("SIBAL", env, "concurrent")["rate_mm_s"] > kernel.burn_rate("SIBAL", env, "opposed")["rate_mm_s"]


def test_pesos_suman_uno():
    assert sum(kernel.weights().values()) == pytest.approx(1.0)


def test_bandas():
    assert kernel.band_of(90) == "critical"
    assert kernel.band_of(60) == "high"
    assert kernel.band_of(40) == "moderate"
    assert kernel.band_of(10) == "low"

def test_medicion_cero_baja_el_score():
    sin_dato = Obs()
    medido_cero = Obs(burn_rate_mm_s=0.0)
    assert kernel.score(medido_cero, ENVIRONMENTS["iss"]).total < kernel.score(sin_dato, ENVIRONMENTS["iss"]).total


def test_medicion_alta_sube_el_score():
    sin_dato = Obs()
    medido = Obs(burn_rate_mm_s=2.4)
    assert kernel.score(medido, ENVIRONMENTS["iss"]).total > kernel.score(sin_dato, ENVIRONMENTS["iss"]).total


def test_margen_no_satura_en_eva():
    eva = ENVIRONMENTS["eva"]
    valores = {m: kernel.score(Obs(material=m), eva).factors["o2_margin"]
               for m in ("PMMA", "Kapton", "Teflon", "Methane")}
    assert len(set(round(v) for v in valores.values())) >= 3


def test_menor_limite_gana_sobre_mas_hollin():
    """PMMA (LOI 0.175) supera al Kapton (0.22) pese al menor hollín.

    Se mide en Marte: en EVA el O2 puro satura margen y tasa, y los empata.
    """
    mars = ENVIRONMENTS["mars"]
    assert kernel.score(Obs(material="PMMA"), mars).total > kernel.score(Obs(material="Kapton"), mars).total


def test_polimida_supera_a_teflon():
    """Ambas películas: Kapton tiene menor LOI y más hollín que el PTFE."""
    eva = ENVIRONMENTS["eva"]
    assert kernel.score(Obs(material="Kapton"), eva).total > kernel.score(Obs(material="Teflon"), eva).total


def test_material_key_resuelve_texto_libre():
    from app.ingest.loader import canonical_material

    assert canonical_material("100 micron PMMA film   2 cm wide") == "PMMA"
    assert canonical_material("30% butane") == "Butane"
    assert canonical_material("aleación rara") is None


def test_etileno_supera_a_propano_en_iss():
    """En ISS el margen no satura y el hollín del etileno decide."""
    iss = ENVIRONMENTS["iss"]
    assert kernel.score(Obs(material="Ethylene"), iss).total > kernel.score(Obs(material="Propane"), iss).total


def test_densidad_de_evidencia_sube_el_score():
    obs = Obs()
    assert kernel.score(obs, ENVIRONMENTS["iss"], 200).total > kernel.score(obs, ENVIRONMENTS["iss"], 1).total


def test_extrapolacion_de_gravedad_no_satura():
    lunar = ENVIRONMENTS["lunar"]
    assert kernel.score(Obs(gravity_g=0.0), lunar).factors["gravity_extrapolation"] < 100


def test_textil_supera_a_gas_en_eva():
    """En un traje, la tela que lo compone pesa más que un gas de laboratorio."""
    eva = ENVIRONMENTS["eva"]
    assert kernel.score(Obs(material="SIBAL"), eva).total > kernel.score(Obs(material="Butane"), eva).total


def test_gas_supera_a_liquido_en_cabina():
    """Un gas de fuga pesa más que un líquido contenido."""
    iss = ENVIRONMENTS["iss"]
    assert kernel.score(Obs(material="Ethylene"), iss).factors["material_fit"] > \
        kernel.score(Obs(material="Heptane"), iss).factors["material_fit"]


def test_flujo_extremo_sube_el_limite():
    """Aire quieto extingue por radiación; el flujo alto enfría el frente."""
    iss = ENVIRONMENTS["iss"]
    minimo = kernel.quench_limit("SIBAL", replace(iss, flow_cm_s=8.0))
    assert kernel.quench_limit("SIBAL", replace(iss, flow_cm_s=0.0)) > minimo
    assert kernel.quench_limit("SIBAL", replace(iss, flow_cm_s=90.0)) > minimo


def test_calentamiento_baja_el_limite():
    iss = ENVIRONMENTS["iss"]
    assert kernel.quench_limit("Nomex", replace(iss, heat_w=250.0)) < kernel.quench_limit("Nomex", iss)


def test_diluyente_explicito_sube_el_limite():
    """El CO2 encarece la atmósfera: sube el O2 necesario. El coeficiente entra dividiendo."""
    iss = ENVIRONMENTS["iss"]
    co2 = DILUENT_COEFF["CO2"]
    assert co2 < 1.0
    assert kernel.quench_limit("SIBAL", replace(iss, diluent_coeff=co2)) > kernel.quench_limit("SIBAL", iss)


def test_flujo_de_referencia_no_desplaza_el_limite():
    """A 20 cm/s, el flujo de Saffire, el límite calibrado no se mueve."""
    iss = ENVIRONMENTS["iss"]
    assert abs(kernel.quench_limit("SIBAL", replace(iss, flow_cm_s=20.0))
               - kernel.quench_limit("SIBAL", iss)) < 0.002


def test_gravedad_sin_escalon():
    """El paso de 0.099 a 0.1 g no puede saltar el limite."""
    iss = ENVIRONMENTS["iss"]
    a = kernel.quench_limit("SIBAL", replace(iss, gravity_g=0.099))
    b = kernel.quench_limit("SIBAL", replace(iss, gravity_g=0.1))
    assert abs(a - b) < 0.005


def test_saffire_uno_se_reproduce():
    """Saffire-1: SIBAL a 21.7 % y 20 cm/s concurrente, 1.8 mm/s medidos."""
    iss = ENVIRONMENTS["iss"]
    r = kernel.burn_rate("SIBAL", replace(iss, o2_fraction=0.217, flow_cm_s=20.0), "concurrent")
    assert not r["quenched"]
    assert 1.4 < r["rate_mm_s"] < 2.2
    o = kernel.burn_rate("SIBAL", replace(iss, o2_fraction=0.217, flow_cm_s=20.0), "opposed")
    assert not o["quenched"]
    assert 0.9 < o["rate_mm_s"] < 1.5


def test_tasa_satura_en_oxigeno_rico():
    """En O2 puro la tasa no puede crecer sin limite."""
    eva = ENVIRONMENTS["eva"]
    rico = kernel.burn_rate("SIBAL", eva, "concurrent")["rate_mm_s"]
    assert rico < 20.0
    medio = kernel.burn_rate("SIBAL", replace(eva, o2_fraction=0.52), "concurrent")["rate_mm_s"]
    assert abs(rico - medio) < 1.0
