from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db import SessionLocal  # noqa: E402
from app.engine import kernel  # noqa: E402
from app.engine.environments import ENVIRONMENTS  # noqa: E402
from app.models import Observation  # noqa: E402


def agrupar(rows):
    grupos = {}
    for obs in rows:
        clave = (obs.experiment_key, obs.material, obs.flame_mode)
        grupos.setdefault(clave, []).append(obs)
    return grupos


def main() -> int:
    with SessionLocal() as db:
        rows = db.scalars(select(Observation)).all()
    grupos = agrupar(rows)

    for env_key in ("eva", "lunar", "iss"):
        env = ENVIRONMENTS[env_key]
        salida = []
        for (experimento, material, modo), items in grupos.items():
            puntuados = [kernel.score(o, env, len(items)) for o in items]
            mejor = max(puntuados, key=lambda s: s.total)
            salida.append((mejor.total, experimento, material, modo, len(items), mejor))
        salida.sort(key=lambda x: -x[0])

        print(f"\n===== {env.label} =====")
        for total, experimento, material, modo, n, score in salida[:8]:
            print(f"{total:3}  {experimento:22} {str(material)[:26]:26} {modo:10} n={n}")
            top = sorted(score.factors.items(), key=lambda kv: -kv[1] * kernel.weights()[kv[0]])[:3]
            print("      ", ", ".join(f"{k}={v:.0f}" for k, v in top))
        print(f"   ({len(salida)} hallazgos agrupados)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
