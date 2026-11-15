from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings  # noqa: E402
from app.ingest.loader import _read_rows  # noqa: E402
from app.ingest.registry import match_column, norm_header, resolve  # noqa: E402


def main() -> int:
    for path in sorted(settings().dataset_dir.rglob("*.csv")):
        rows = _read_rows(path)
        if not rows:
            continue
        header = rows[0]
        targets = [h for h in header if "o2" in norm_header(h) or "oxygen" in norm_header(h)]
        if not targets:
            continue
        schema = resolve(path.name, header)
        print(f"{path.name} -> esquema: {schema.key if schema else 'NINGUNO'}")
        for h in targets:
            col = match_column(schema, h) if schema else None
            print(f"    {h!r:46} -> {f'{col.field}:{col.kind}' if col else 'SIN MAPEO'}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
