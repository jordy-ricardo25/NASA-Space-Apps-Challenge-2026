import json
from pathlib import Path

from app.config import settings


def test_version_coincide_con_pesos():
    pesos = json.loads((Path(__file__).parent.parent / "app" / "engine" / "weights.json").read_text())
    assert settings().kernel_version == pesos["version"]
