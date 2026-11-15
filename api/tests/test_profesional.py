import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:
        yield c


def test_mediciones_cubren_todos_los_experimentos(cliente):
    datos = cliente.get("/api/measurements").json()
    assert len(datos["experiments"]) == 20
    assert datos["missing_variables"]


def test_paginacion_con_cabecera(cliente):
    r = cliente.get("/api/findings", params={"environment": "eva", "limit": 5, "offset": 0})
    assert len(r.json()) == 5
    assert int(r.headers["X-Total-Count"]) > 5


def test_paginacion_desplaza(cliente):
    a = cliente.get("/api/findings", params={"environment": "eva", "limit": 3}).json()
    b = cliente.get("/api/findings", params={"environment": "eva", "limit": 3, "offset": 3}).json()
    assert a[0]["key"] != b[0]["key"]


def test_contexto_trae_mensajes_y_esquema(cliente):
    clave = cliente.get("/api/findings", params={"environment": "eva", "limit": 1}).json()[0]["key"]
    datos = cliente.get(f"/api/findings/{clave}/context").json()
    assert datos["messages"][0]["role"] == "system"
    assert "citas" in datos["response_schema"]["required"]
    assert datos["evidence"]


def test_contexto_inexistente(cliente):
    assert cliente.get("/api/findings/nada/context").status_code == 404


def test_cabecera_de_peticion(cliente):
    assert len(cliente.get("/health").headers["X-Request-Id"]) == 8
