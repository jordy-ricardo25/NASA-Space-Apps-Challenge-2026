import pytest

from app.ingest import normalize as N


def test_complete_es_longitud_completa():
    assert N.to_length_mm("Complete").value == N.COMPLETE_LENGTH_MM


def test_centimetros_a_milimetros():
    assert N.to_length_mm("7.6 cm").value == 76.0


def test_cero_no_sostenido():
    assert N.to_length_mm("~ 0").value == 0.0


@pytest.mark.parametrize("raw", ["Acceleratory", "Complete", "n/a"])
def test_tasa_cualitativa(raw):
    assert N.to_rate_mm_s(raw).value is None


def test_tasa_numerica_con_unidad():
    assert N.to_rate_mm_s("1.2 mm/s").value == 1.2


def test_mezcla_de_combustible():
    assert N.to_fuel_mix("40% CH4 (balance N2) including 2 tests").value == "40% CH4/N2"


def test_mezcla_sin_balance():
    assert N.to_fuel_mix("100% CH4").value == "100% CH4/aire"


def test_calidad_penaliza_por_categoria():
    from app.ingest.loader import _quality

    una = _quality(["placeholder"])
    tres = _quality(["placeholder", "placeholder", "placeholder"])
    assert una == tres
