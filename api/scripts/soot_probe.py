from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db import SessionLocal  # noqa: E402
from app.engine import kernel  # noqa: E402
from app.models import Observation  # noqa: E402


def main() -> int:
    with SessionLocal() as db:
        rows = db.scalars(select(Observation).where(Observation.experiment_key == "bass2")).all()
    print(f"filas BASS-II: {len(rows)}")
    for obs in rows[:5]:
        print(f"  soot_index={obs.soot_index}  efectivo={kernel.soot_of(obs):.2f}  "
              f"material={str(obs.material)[:30]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
