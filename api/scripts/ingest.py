"""python -m scripts.ingest  — reconstruye la base desde dataset_clean/."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings          # noqa: E402
from app.db import SessionLocal, engine  # noqa: E402
from app.ingest.loader import ingest_dataset  # noqa: E402
from app.models import Base              # noqa: E402


def main() -> int:
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        report = ingest_dataset(db, settings().dataset_dir)
    print(f"archivos vistos      {report.files_seen}")
    print(f"archivos parseados   {report.files_parsed}")
    print(f"filas leídas         {report.rows_read}")
    print(f"observaciones        {report.rows_kept}")
    for skipped in report.files_skipped:
        print(f"  omitido: {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())