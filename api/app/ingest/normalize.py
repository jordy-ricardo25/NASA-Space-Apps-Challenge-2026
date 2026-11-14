"""Normalizadores. Cada uno devuelve (valor, flags) y nunca lanza por celda sucia."""
from __future__ import annotations

import re
from dataclasses import dataclass

PLACEHOLDERS = {
    "", "-", "--", "?", "n/a", "na", "none", "null", "nan",
    "ramped", "tbd", "unknown", "insignificant",
}

NUM_RE = re.compile(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")
RANGE_RE = re.compile(r"^\s*~?\s*([-+]?\d*\.?\d+)\s*(?:-|–|to)\s*~?\s*([-+]?\d*\.?\d+)\s*$")
MULTI_SEP = re.compile(r"[;,|]")

BAR_TO_ATM = 0.9869232667
MMHG_TO_ATM = 1 / 760.0
PSIA_TO_ATM = 1 / 14.6959
KPA_TO_ATM = 1 / 101.325


@dataclass(frozen=True)
class Parsed:
    value: object
    flags: tuple[str, ...] = ()
    rule: str = ""


def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def is_placeholder(raw: object) -> bool:
    return raw is None or str(raw).strip().lower() in PLACEHOLDERS


def split_multi(raw: object) -> list[str]:
    if raw is None:
        return []
    parts = [p.strip() for p in MULTI_SEP.split(str(raw))]
    return [p for p in parts if p]


def to_number(raw: object) -> Parsed:
    if raw is None:
        return Parsed(None, ("empty",))
    text = str(raw).strip()
    if text.lower() in PLACEHOLDERS:
        return Parsed(None, ("placeholder",), f"placeholder:{text.lower()}")
    cleaned = text.replace("~", " ").replace("approx", " ")
    match = NUM_RE.search(cleaned)
    if not match:
        return Parsed(None, ("unparseable",), f"unparseable:{text[:24]}")
    flags = ["unit_inferred"] if re.search(r"[A-Za-z]", cleaned) else ()
    return Parsed(float(match.group()), flags, "numeric")


def to_fraction(raw: object, percent_hint: bool = False) -> Parsed:
    """Devuelve lista de fracciones. Multi-valor se expande, no se promedia."""
    values: list[float] = []
    flags: list[str] = []
    rules: list[str] = []
    parts = split_multi(raw)
    if len(parts) > 1:
        flags.append("multi_value")
    for part in parts:
        parsed = to_number(part)
        flags.extend(parsed.flags)
        if parsed.value is None:
            continue
        value = float(parsed.value)
        if percent_hint or value > 1.0:
            value /= 100.0
            rules.append("percent→fraction")
        values.append(clamp(value, 0.0, 1.0))
    return Parsed(values, tuple(dict.fromkeys(flags)), "|".join(dict.fromkeys(rules)))


def to_pressure_atm(raw: object, unit: str) -> Parsed:
    parsed = to_number(raw)
    if parsed.value is None:
        return Parsed(None, parsed.flags + ("placeholder_pressure",), parsed.rule)
    value = float(parsed.value)
    factor, rule = {
        "bar": (BAR_TO_ATM, "bar→atm"),
        "mmhg": (MMHG_TO_ATM, "mmhg→atm"),
        "psia": (PSIA_TO_ATM, "psia→atm"),
        "kpa": (KPA_TO_ATM, "kpa→atm"),
        "atm": (1.0, "atm"),
    }.get(unit, (1.0, "unit_assumed_atm"))
    if unit not in {"bar", "mmhg", "psia", "kpa", "atm"}:
        parsed.flags += ("unit_inferred",)
    return Parsed(value * factor, parsed.flags, rule)


def to_range(raw: object) -> Parsed:
    text = str(raw or "").strip()
    match = RANGE_RE.match(text)
    if match:
        lo, hi = float(match.group(1)), float(match.group(2))
        return Parsed((min(lo, hi), max(lo, hi)), ("range_collapsed",), "range:lo-hi")
    parsed = to_number(raw)
    if parsed.value is None:
        return Parsed(None, parsed.flags, parsed.rule)
    return Parsed((parsed.value, parsed.value), parsed.flags, "scalar")


def to_bool(raw: object, true_set: set[str], false_set: set[str]) -> Parsed:
    text = str(raw or "").strip().lower()
    if text in true_set:
        return Parsed(True, (), f"true:{text}")
    if text in false_set:
        return Parsed(False, (), f"false:{text}")
    return Parsed(None, ("placeholder",), "bool_unknown")


COMPLETE_LENGTH_MM = 290.0


def to_length_mm(raw: object) -> Parsed:
    """'Complete' significa quemado de la muestra entera, no un número."""
    text = str(raw or "").strip().lower()
    if text.startswith("complete"):
        return Parsed(COMPLETE_LENGTH_MM, (), "complete→longitud completa")
    parsed = to_number(raw)
    if parsed.value is None:
        return parsed
    if "cm" in text:
        return Parsed(float(parsed.value) * 10.0, parsed.flags, "cm→mm")
    return parsed


def to_cm_mm(raw: object) -> Parsed:
    """La columna declara cm; el campo guarda mm."""
    parsed = to_number(raw)
    if parsed.value is None:
        return parsed
    return Parsed(float(parsed.value) * 10.0, parsed.flags, "columna_cm→mm")


def to_rate_mm_s(raw: object) -> Parsed:
    text = str(raw or "").strip().lower()
    if "acceler" in text or "complete" in text:
        return Parsed(None, ("qualitative",), f"cualitativo:{text[:18]}")
    return to_number(raw)


def to_fuel_mix(raw: object) -> Parsed:
    """Separa fracción de combustible y balance de una celda narrativa."""
    if is_placeholder(raw):
        return Parsed(None, ("placeholder",))
    text = str(raw).strip()
    match = re.search(r"(\d+)\s*%\s*(CH4|C2H4|H2)", text, re.IGNORECASE)
    if match:
        balance = "N2" if "balance n2" in text.lower() else "aire"
        return Parsed(f"{match.group(1)}% {match.group(2).upper()}/{balance}", (), "fuel_mix")
    return Parsed(text[:60], (), "text")


def to_text(raw: object, max_len: int = 120) -> Parsed:
    if is_placeholder(raw):
        return Parsed(None, ("placeholder",))
    return Parsed(str(raw).strip()[:max_len], (), "text")