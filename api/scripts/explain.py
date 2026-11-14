from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db import SessionLocal  # noqa: E402
from app.engine import kernel  # noqa: E402
from app.engine.environments import ENVIRONMENTS  # noqa: E402
from app.models import Observation  # noqa: E402

CLAVES = sys.argv[1:] or ["saffire1", "saffire3", "bass2"]


def main() -> int:
    with SessionLocal() as db:
        rows = db.scalars(select(Observation)).all()
    for clave in CLAVES:
        grupo = [o for o in rows if o.experiment_key == clave]
        if not grupo:
            print(f"{clave}: sin filas")
            continue
        env = ENVIRONMENTS["eva"]
        score = kernel.score(grupo[0], env, len(grupo))
        orden = sorted(score.factors.items(), key=lambda kv: -kv[1] * kernel.weights()[kv[0]])
        print(f"\n{clave}  n={len(grupo)}  material={grupo[0].material}  rpi={score.total}")
        for nombre, valor in orden:
            print(f"   {nombre:26} {valor:6.1f} x {kernel.weights()[nombre]:.2f} = {valor * kernel.weights()[nombre]:5.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
