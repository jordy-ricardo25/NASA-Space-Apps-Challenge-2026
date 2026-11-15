from collections import Counter
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.db import SessionLocal  # noqa: E402
from app.models import Observation  # noqa: E402


def main() -> int:
    with SessionLocal() as db:
        rows = db.scalars(select(Observation)).all()
    per = Counter(r.source_file for r in rows)
    flags = Counter(f for r in rows for f in (r.flags or []))
    print(f"{'archivo':46} {'filas':>6} {'calidad':>8} {'sin O2':>7} {'sin tasa':>9}")
    for name in sorted(per):
        sub = [r for r in rows if r.source_file == name]
        quality = sum(r.quality for r in sub) / len(sub)
        print(f"{name[:46]:46} {len(sub):6} {quality:8.2f} "
              f"{sum(1 for r in sub if r.o2_max is None):7} "
              f"{sum(1 for r in sub if r.burn_rate_mm_s is None):9}")
    print("\nbanderas:", dict(flags.most_common()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
