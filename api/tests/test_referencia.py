import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:
        yield c


def test_reglas_del_guide(cliente):
    datos = cliente.get("/api/rules").json()
    assert datos["count"] >= 5
    assert all(r["hecho"] for r in datos["rules"])


def test_instalaciones_con_masa_y_volumen(cliente):
    datos = cliente.get("/api/facilities").json()
    assert datos["facilities"]
    assert all(f["masa_kg"] for f in datos["facilities"])


def test_fm2_trae_condiciones_lunares(cliente):
    payload = cliente.get("/api/fm2").json()["payload"]
    assert "test_conditions" in payload
    assert payload["status"].startswith("Planned")


def test_fuente_de_incidente(cliente):
    datos = cliente.get("/api/incidents/apollo_1/source").json()
    assert datos["lines"] > 10 and datos["excerpt"]


def test_filas_sin_o2_se_conservan():
    from app.ingest.loader import _quality

    assert _quality(["missing_o2"]) > 0.5
