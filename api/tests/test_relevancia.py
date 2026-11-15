from fastapi.testclient import TestClient
import pytest

from app.engine.catalog import EXPERIMENT_PROJECT, RELEVANCE
from app.main import app


def test_todo_experimento_tiene_capa():
    assert set(EXPERIMENT_PROJECT) == set(RELEVANCE)


def test_capas_validas():
    assert set(RELEVANCE.values()) <= {"direct", "indirect", "context"}


def test_lo_directo_domina_el_reparto():
    """La mayoria del corpus debe ser evidencia directa, no contexto."""
    valores = list(RELEVANCE.values())
    assert valores.count("direct") > valores.count("indirect")


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:
        yield c


def test_hallazgos_traen_relevancia(cliente):
    datos = cliente.get("/api/findings", params={"limit": 5}).json()
    assert datos
    assert all(f["relevance"] in {"direct", "indirect", "context"} for f in datos)


def test_investigaciones_traen_relevancia(cliente):
    datos = cliente.get("/api/investigations").json()
    assert datos
    assert all(i["relevance"] in {"direct", "indirect", "context"} for i in datos)
