import pytest

from app.ingest import normalize as N
from app.ingest.registry import resolve


@pytest.mark.parametrize("raw,expected", [
    ("21; 26.5; 40", [0.21, 0.265, 0.40]),
    ("0.21", [0.21]),
    ("22.2", [0.222]),
    ("~ 21.5", [0.215]),
    ("RAMPED", []),
    ("none", []),
])
def test_fraction(raw, expected):
    assert N.to_fraction(raw, percent_hint=raw in {"21; 26.5; 40", "22.2"}).value == expected


@pytest.mark.parametrize("raw,unit,expected", [
    ("757.7", "mmhg", 0.9970),
    ("1.10", "bar", 1.0856),
    ("14.7", "psia", 1.0003),
    ("1.0", "atm", 1.0),
    ("n/a", "atm", None),
])
def test_pressure(raw, unit, expected):
    value = N.to_pressure_atm(raw, unit).value
    assert value is None if expected is None else value == pytest.approx(expected, abs=1e-4)


def test_range():
    assert N.to_range("21.5 - 21.7").value == (21.5, 21.7)
    assert N.to_range("~ 0").value == (0.0, 0.0)
    assert "range_collapsed" in N.to_range("1-2").flags


def test_bool_sets():
    assert N.to_bool("Extinction", {"extinction"}, {"disruption"}).value is True
    assert N.to_bool("Disruption", {"extinction"}, {"disruption"}).value is False
    assert N.to_bool("", {"extinction"}, {"disruption"}).value is None


def test_number_embedded_unit():
    parsed = N.to_number("1.2 mm/s")
    assert parsed.value == 1.2
    assert "unit_inferred" in parsed.flags


@pytest.mark.parametrize("filename,headers,expected", [
    ("psi_010_flame_design_inverse.csv", ["XO2", "mean Zst"], "psi010.inverse"),
    ("PSI-10_Experimental table_Flame Design_Normal Flame.csv", ["XO2 (init)", "Tad (K)"], "psi010.normal"),
    ("PSI-98_SAFFIRE-I_experimental_table.csv", ["Percent O2", "Burn Time (s)"], "psi098.saffire1"),
    ("psi_159_cfi_g_normal.csv", ["XO2  before test"], "psi159.cfi_norm"),
    ("desconocido.csv", ["Percent O2", "Burn Time (s)"], "psi098.saffire1"),
    ("vacio.csv", ["a", "b"], None),
])
def test_resolve(filename, headers, expected):
    schema = resolve(filename, headers)
    assert (schema.key if schema else None) == expected


def test_inverse_no_colisiona_con_normal():
    inv = resolve("PSI-159_CFI-G_inverse_experimental_table.csv", [])
    norm = resolve("PSI-159_CFI-G_normal_experimental_table.csv", [])
    assert inv.key != norm.key