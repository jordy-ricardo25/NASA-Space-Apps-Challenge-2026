"""Carga el dataset a observaciones normalizadas. Nunca aborta por una fila mala."""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from pathlib import Path

from ..models import IngestRun, Observation, utcnow
from . import normalize as N
from .registry import Col, Schema, match_column, resolve

PENALTIES = {
    "placeholder": 0.10, "placeholder_pressure": 0.15, "unit_inferred": 0.10,
    "range_collapsed": 0.08, "multi_value": 0.05, "unparseable": 0.12,
    "metadata_only": 0.25, "missing_o2": 0.12, "row_truncated": 0.20, "empty": 0.05, "qualitative": 0.05,
}

FLOAT_FIELDS = ("o2_min", "o2_max", "pressure_atm", "burn_rate_mm_s", "burn_time_s",
                "burn_length_mm", "co_ppm", "soot_index", "tad_k", "zst", "gravity_g")
BOOL_FIELDS = ("cool_flame", "hot_ignition", "self_extinguished")
TRUE_SET = {"extinction", "extinguished", "se", "self-ext", "yes", "true"}
FALSE_SET = {"disruption", "ft", "flow term", "no", "false"}


def _hms_span(start: object, end: object) -> float | None:
    def parse(value: object) -> int | None:
        parts = str(value or "").strip().split(":")
        if len(parts) != 3:
            return None
        try:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        except ValueError:
            return None

    first, second = parse(start), parse(end)
    if first is None or second is None or second < first:
        return None
    return float(second - first)


def _sanitize(obs) -> None:
    """Última barrera de tipo: un mapeo flojo no debe tumbar el commit."""
    for field in FLOAT_FIELDS:
        value = getattr(obs, field)
        if value is not None and not isinstance(value, (int, float)):
            number = N.to_number(value).value
            setattr(obs, field, float(number) if number is not None else None)
    for field in BOOL_FIELDS:
        value = getattr(obs, field)
        if value is not None and not isinstance(value, bool):
            setattr(obs, field, N.to_bool(value, TRUE_SET, FALSE_SET).value)


MATERIAL_ALIASES = {
    "methanol": "Methanol", "dodecane": "n-dodecane", "c12h26": "n-dodecane",
    "polyimide": "Kapton", "kapton": "Kapton", "teflon": "Teflon", "ptfe": "Teflon",
    "ethylene": "Ethylene", "c2h4": "Ethylene", "methane": "Methane", "ch4": "Methane",
    "ethane": "Ethane", "propane": "Propane", "butane": "Butane",
    "silicone": "Silicone", "sibal": "SIBAL", "acrylic": "PMMA", "pmma": "PMMA",
    "heptane": "Heptane",
}


def canonical_material(raw: object) -> str | None:
    """Reduce texto libre a una clave de material conocida."""
    if not raw:
        return None
    text = str(raw).lower()
    for alias, nombre in MATERIAL_ALIASES.items():
        if alias in text:
            return nombre
    return None


MODE_MAP = {
    "concurrent": "concurrent", "opposed": "opposed", "quiescent": "quiescent",
    "coflow": "coflow", "inverse": "opposed", "normal": "opposed",
}


@dataclass
class Report:
    files_seen: int = 0
    files_parsed: int = 0
    files_skipped: list[str] = field(default_factory=list)
    rows_read: int = 0
    rows_kept: int = 0
    rows_rejected: int = 0


def _read_rows(path: Path) -> list[list[str]]:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError(f"sin decodificación válida: {path.name}")
    return [r for r in csv.reader(io.StringIO(text)) if any(c.strip() for c in r)]


def _apply(col: Col, raw: str) -> N.Parsed:
    match col.kind:
        case "fraction":
            return N.to_fraction(raw, col.percent_hint)
        case "pressure":
            return N.to_pressure_atm(raw, col.unit or "atm")
        case "range":
            return N.to_range(raw)
        case "range_percent":
            parsed = N.to_range(raw)
            if isinstance(parsed.value, tuple):
                low, high = parsed.value
                return N.Parsed((low / 100.0, high / 100.0), parsed.flags, "percent_range→fraction")
            return parsed
        case "number":
            return N.to_number(raw)
        case "length":
            return N.to_length_mm(raw)
        case "rate":
            return N.to_rate_mm_s(raw)
        case "fuel_mix":
            return N.to_fuel_mix(raw)
        case "bool":
            return N.to_bool(raw, set(col.true_set), set(col.false_set))
        case _:
            return N.to_text(raw)


def _quality(flags: list[str]) -> float:
    score = 1.0
    for flag in set(flags):
        score -= PENALTIES.get(flag, 0.0)
    return max(0.05, round(score, 3))


def ingest_file(db, path: Path, run: IngestRun, report: Report) -> None:
    report.files_seen += 1
    try:
        rows = _read_rows(path)
    except ValueError as exc:
        report.files_skipped.append(f"{path.name}: {exc}")
        return
    if len(rows) < 2:
        report.files_skipped.append(f"{path.name}: sin filas")
        return

    header, body = rows[0], rows[1:]
    schema = resolve(path.name, header)
    if schema is None:
        report.files_skipped.append(f"{path.name}: esquema no reconocido")
        return

    report.files_parsed += 1
    mapping: dict[int, Col] = {}
    for idx, name in enumerate(header):
        col = match_column(schema, name)
        if col:
            mapping[idx] = col

    for row_no, row in enumerate(body, start=2):
        report.rows_read += 1
        if len(row) < len(header) - 2:
            row = row + [""] * (len(header) - len(row))

        values: dict[str, object] = {}
        flags: list[str] = []
        rules: list[str] = []

        for idx, col in mapping.items():
            if idx >= len(row):
                continue
            parsed = _apply(col, row[idx])
            flags.extend(parsed.flags)
            if parsed.rule:
                rules.append(f"{col.field}:{parsed.rule}")
            if parsed.value is None:
                continue
            if col.kind == "fraction":
                seq = parsed.value
                values[col.field] = seq
            elif col.kind in {"range", "range_percent"}:
                lo, hi = parsed.value
                values["o2_min"] = lo
                values["o2_max"] = hi
            elif col.field == "flame_mode":
                values["flame_mode"] = MODE_MAP.get(str(parsed.value).lower(), "unknown")
            else:
                values[col.field] = parsed.value

        o2 = values.get("o2")
        variants: list[float | None] = o2 if isinstance(o2, list) else [None]
        if not variants:
            variants = [None]
            flags.append("missing_o2")
        if len(variants) > 8:
            variants = variants[:8]
            flags.append("multi_value")

        base_o2_min = values.get("o2_min")
        base_o2_max = values.get("o2_max")

        for expand_index, o2_value in enumerate(variants):
            obs_flags_extra: list[str] = []
            o2_min = base_o2_min if base_o2_min is not None else o2_value
            if o2_min is None:
                o2_min = schema.defaults.get("o2_min")
            o2_max = base_o2_max if base_o2_max is not None else o2_value
            if o2_max is None:
                o2_max = schema.defaults.get("o2_max")
            obs_flags = list(flags) + obs_flags_extra
            if not mapping:
                obs_flags.append("metadata_only")

            burn_rate = values.get("burn_rate_mm_s") or values.get("_rate_1g")
            if isinstance(burn_rate, str):
                burn_rate = N.to_number(burn_rate).value
            length = values.get("burn_length_mm")
            time_s = values.get("burn_time_s")
            if length == 0:
                burn_rate = 0.0
                obs_flags_extra = ["no_sustained_burn"]
            elif burn_rate is None and length and time_s:
                burn_rate = float(length) * 10.0 / float(time_s)
                rules.append("burn_rate:derived length/time")

            derived_time = values.get("burn_time_s")
            if derived_time is None:
                derived_time = _hms_span(values.get("_ignition"), values.get("_flame_off"))
                if derived_time is not None:
                    rules.append("burn_time_s:derived hms span")

            obs = Observation(
                run_id=run.id,
                source_file=path.name,
                source_row=row_no,
                expand_index=expand_index,
                experiment_key=schema.experiment_key,
                experiment_label=schema.experiment_label,
                facility=schema.facility,
                schema_key=schema.key,
                material=values.get("material") or schema.defaults.get("material"),
                material_key=canonical_material(
                    values.get("material") or schema.defaults.get("material")),
                geometry=values.get("geometry"),
                flame_mode=values.get("flame_mode") or schema.defaults.get("flame_mode", "unknown"),
                gravity_g=schema.defaults.get("gravity_g"),
                o2_min=o2_min, o2_max=o2_max,
                pressure_atm=values.get("pressure") or schema.defaults.get("pressure_atm"),
                burn_rate_mm_s=burn_rate,
                burn_time_s=derived_time,
                burn_length_mm=length,
                co_ppm=values.get("co_ppm"),
                soot_index=values.get("soot_index"),
                tad_k=values.get("tad_k"),
                zst=values.get("zst"),
                cool_flame=values.get("cool_flame"),
                hot_ignition=values.get("hot_ignition"),
                self_extinguished=values.get("self_extinguished"),
                quality=_quality(obs_flags),
                flags=list(dict.fromkeys(obs_flags)),
                rules_applied=rules,
                raw={header[i]: row[i] for i in range(min(len(header), len(row)))},
            )
            _sanitize(obs)
            db.add(obs)
            report.rows_kept += 1

        if not mapping:
            report.rows_rejected += 0  # se conserva como metadato


def ingest_dataset(db, dataset_dir: Path) -> Report:
    report = Report()
    run = IngestRun(kernel_version="")
    db.add(run)
    db.flush()

    files = sorted(p for p in dataset_dir.rglob("*.csv") if p.is_file())
    for path in files:
        ingest_file(db, path, run, report)

    run.finished_at = utcnow()
    run.files_seen = report.files_seen
    run.files_parsed = report.files_parsed
    run.rows_read = report.rows_read
    run.rows_kept = report.rows_kept
    run.rows_rejected = report.rows_rejected
    db.commit()
    return report