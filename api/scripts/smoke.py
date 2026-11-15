from fastapi.testclient import TestClient

from app.main import app

RUTAS = [
    ("GET", "/health", None, 200),
    ("GET", "/api/meta", None, 200),
    ("POST", "/api/ingest", {}, 200),
    ("GET", "/api/findings?environment=eva&limit=5", None, 200),
    ("GET", "/api/findings?environment=mars&min_rpi=40", None, 200),
    ("GET", "/api/findings?environment=nulo", None, 404),
    ("GET", "/api/matrix", None, 200),
    ("GET", "/api/investigations", None, 200),
    ("GET", "/api/investigations/saffire1/variation", None, 200),
    ("GET", "/api/similarity?minimo=40", None, 200),
    ("GET", "/api/hardware", None, 200),
    ("GET", "/api/gaps", None, 200),
    ("GET", "/api/oxygen-ladder", None, 200),
    ("GET", "/api/measurements", None, 200),
    ("GET", "/api/rules", None, 200),
    ("GET", "/api/facilities", None, 200),
    ("GET", "/api/fm2", None, 200),
    ("GET", "/api/incidents", None, 200),
    ("GET", "/api/incidents/apollo_1/source", None, 200),
    ("GET", "/api/spinoffs", None, 200),
    ("GET", "/api/export?environment=lunar&format=json", None, 200),
    ("GET", "/api/export?environment=lunar&format=md", None, 200),
    ("GET", "/api/export?environment=luna", None, 404),
    ("GET", "/api/provenance/psi_098_saffire_1.csv", None, 200),
    ("GET", "/api/provenance/nada.csv", None, 404),
    ("POST", "/api/lab/simulate", {"material": "Kapton", "o2_fraction": 0.32,
                                   "pressure_atm": 0.56, "gravity_g": 0.165}, 200),
    ("POST", "/api/lab/gravity-band", {"material": "SIBAL", "o2_fraction": 0.32,
                                       "pressure_atm": 0.56, "gravity_g": 0.165}, 200),
    ("POST", "/api/lab/simulate", {"o2_fraction": 2.0}, 422),
]


def main() -> int:
    fallos = 0
    with TestClient(app) as cliente:
        hallazgo = cliente.get("/api/findings?environment=eva&limit=1").json()[0]["key"]
        rutas = RUTAS + [("GET", f"/api/findings/{hallazgo}/context", None, 200)]
        for metodo, ruta, cuerpo, esperado in rutas:
            r = cliente.request(metodo, ruta, json=cuerpo)
            bien = r.status_code == esperado
            fallos += 0 if bien else 1
            print(f"{'ok ' if bien else 'FALLO'} {r.status_code:3} (esperado {esperado}) "
                  f"{metodo:5} {ruta[:56]}")
    total = len(RUTAS) + 1
    print(f"\n{total - fallos}/{total} rutas correctas")
    return 0 if fallos == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
