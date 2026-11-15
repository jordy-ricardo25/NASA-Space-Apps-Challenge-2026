from app.ingest.registry import match_column, resolve

SCHEMA = resolve("psi_025_bass_2.csv", [])


def test_espacios_dobles_y_finales():
    col = match_column(SCHEMA, "Calibrated  initial O2 % by vol ")
    assert col is not None and col.field == "o2"


def test_espacio_inicial():
    schema = resolve("psi_159_cfi_g_normal.csv", [])
    col = match_column(schema, " XO2 before test")
    assert col is not None and col.field == "o2"


def test_cabecera_desconocida():
    assert match_column(SCHEMA, "columna inventada") is None


def test_prefiere_la_clave_mas_larga_y_co2_va_a_su_campo():
    col = match_column(SCHEMA, "Final CO2 % by vol")
    assert col is not None and col.field == "_co2"
