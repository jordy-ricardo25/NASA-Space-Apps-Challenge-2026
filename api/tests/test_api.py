import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:
        yield c


def test_health(cliente):
    assert cliente.get("/health").json()["status"] == "ok"


def test_meta_expone_pesos_que_suman_uno(cliente):
    datos = cliente.get("/api/meta").json()
    assert len(datos["environments"]) == 5
    assert sum(datos["weights"].values()) == pytest.approx(1.0)


def test_findings_ordenados(cliente):
    filas = cliente.get("/api/findings", params={"environment": "eva"}).json()
    assert filas and filas[0]["rpi"] >= filas[-1]["rpi"]
    assert len(filas[0]["factors"]) == 11


def test_findings_entorno_inexistente(cliente):
    assert cliente.get("/api/findings", params={"environment": "nulo"}).status_code == 404


def test_findings_filtro_min_rpi(cliente):
    filas = cliente.get("/api/findings", params={"environment": "eva", "min_rpi": 60}).json()
    assert all(f["rpi"] >= 60 for f in filas)


def test_matrix_cinco_entornos(cliente):
    datos = cliente.get("/api/matrix").json()
    assert set(datos["environment_means"]) == {"iss", "lunar", "rover", "eva", "mars"}


def test_lab_curva_completa(cliente):
    r = cliente.post("/api/lab/simulate", json={"material": "SIBAL", "o2_fraction": 1.0,
                                                "pressure_atm": 0.29, "gravity_g": 0.0})
    assert r.status_code == 200
    assert len(r.json()["curve"]) == 46


def test_lab_rechaza_fuera_de_rango(cliente):
    assert cliente.post("/api/lab/simulate", json={"o2_fraction": 2.0}).status_code == 422


def test_provenance(cliente):
    r = cliente.get("/api/provenance/psi_098_saffire_1.csv")
    assert r.status_code == 200 and r.json()["observations"] > 0


def test_provenance_inexistente(cliente):
    assert cliente.get("/api/provenance/nada.csv").status_code == 404


def test_ingest_reproducible(cliente):
    r = cliente.post("/api/ingest").json()
    assert r["files_parsed"] == 20 and r["rows_kept"] > 1900
