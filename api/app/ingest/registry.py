"""Registro de esquemas. Empareja por nombre de archivo y, si falla, por firma de cabeceras."""
from __future__ import annotations

import re
from dataclasses import dataclass, field

KIND = str  # number | fraction | pressure | range | bool | text

TRUE_EXT = {"extinction", "extinguished", "se", "self-ext", "yes"}
FALSE_EXT = {"disruption", "ft", "flow term", "no"}


@dataclass(frozen=True)
class Col:
    field: str
    kind: KIND
    unit: str | None = None
    percent_hint: bool = False
    true_set: frozenset[str] = frozenset()
    false_set: frozenset[str] = frozenset()


@dataclass(frozen=True)
class Schema:
    key: str
    experiment_key: str
    experiment_label: str
    facility: str
    patterns: tuple[re.Pattern, ...]
    columns: dict[str, Col]
    defaults: dict = field(default_factory=dict)


def _p(*pats: str) -> tuple[re.Pattern, ...]:
    return tuple(re.compile(p, re.IGNORECASE) for p in pats)


SCHEMAS: tuple[Schema, ...] = (
    Schema(
        "psi010.inverse", "flame_design_inverse", "Flame design (inversa)", "CIR",
        _p(r"psi[-_ ]?0*10.*inverse", r"flame design.*inverse"),
        {
            "xo2": Col("o2", "fraction"),
            "xc2h4 initial": Col("geometry", "text"),
            "pmean (atm)": Col("pressure", "pressure", "atm"),
            "tad (k)": Col("tad_k", "number"),
            "mean zst": Col("zst", "number"),
            "test": Col("test_id", "text"),
            "flame type": Col("flame_mode", "text"),
        },
        {"flame_mode": "opposed", "material": "C2H4", "gravity_g": 0.0},
    ),
    Schema(
        "psi010.normal", "flame_design_normal", "Flame design (normal)", "CIR",
        _p(r"psi[-_ ]?0*10.*normal", r"flame design.*normal"),
        {
            "xo2 (init)": Col("o2", "fraction"),
            "xo2": Col("o2", "fraction"),
            "fuel": Col("material", "text"),
            "pmean (atm)": Col("pressure", "pressure", "atm"),
            "tad (k)": Col("tad_k", "number"),
            "mean zst": Col("zst", "number"),
        },
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
    Schema(
        "psi020.bre", "acme_bre", "ACME BRE", "CIR-ACME",
        _p(r"psi[-_ ]?0*20", r"acme bre"),
        {
            "oxygen conc (percent)": Col("o2", "fraction", percent_hint=True),
            "fuel bottle": Col("material", "text"),
            "burner size (mm)": Col("geometry", "text"),
        },
        {"flame_mode": "quiescent"},
    ),
    Schema(
        "psi021.cld", "acme_cld", "ACME CLD", "CIR-ACME",
        _p(r"psi[-_ ]?0*21", r"cld flame"),
        {"fuel bottle": Col("material", "text"), "fuel conc. range": Col("o2", "range_percent")},
        {"flame_mode": "coflow"},
    ),
    Schema(
        "psi022.efield", "acme_efield", "ACME E-field", "CIR-ACME",
        _p(r"psi[-_ ]?0*22", r"e-?field"),
        {"fuel bottle": Col("material", "text"), "fuel conc": Col("o2", "fraction", percent_hint=True)},
        {"flame_mode": "quiescent"},
    ),
    Schema(
        "psi023.sflame", "acme_sflame", "ACME S-flame", "CIR-ACME",
        _p(r"psi[-_ ]?0*23", r"s-?flame"),
        {"atmosphere": Col("o2", "range_percent"), "fuel bottle": Col("material", "text")},
        {"flame_mode": "quiescent"},
    ),
    Schema(
        "psi025.bass2", "bass2", "BASS-II", "MSG",
        _p(r"psi[-_ ]?0*25", r"bass-?ii"),
        {
            "calibrated  initial o2 % by vol": Col("o2", "fraction", percent_hint=True),
            "fuel sample material": Col("material", "text"),
            "initial co (ppm)": Col("co_ppm", "number"),
            "final co (ppm)": Col("co_ppm", "number"),
            "initial co2 % by vol": Col("_co2", "number"),
            "final co2 % by vol": Col("_co2", "number"),
        },
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
    Schema(
        "psi026.bass1", "bass1", "BASS", "MSG",
        _p(r"psi[-_ ]?0*26", r"bass(?!-?ii)"),
        {"fuel sample material": Col("material", "text"), "as run test #": Col("test_id", "text")},
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
    Schema(
        "psi039.cfi", "cfi", "CFI", "MSG",
        _p(r"psi[-_ ]?0*39", r"cfi(?![-_ ]?g)"),
        {
            "oxygen": Col("o2", "fraction"),
            "pressure": Col("pressure", "pressure", "atm"),
            "fuel": Col("material", "text"),
            "fiber": Col("geometry", "text"),
        },
        {"flame_mode": "quiescent", "gravity_g": 0.0},
    ),
    Schema(
        "psi068.flex2", "flex2", "FLEX-2", "CIR",
        _p(r"psi[-_ ]?0*68", r"flex-?2"),
        {
            "oxygen mole fraction": Col("o2", "fraction"),
            "ambient pressure (atm)": Col("pressure", "pressure", "atm"),
            "ambient gas mixture": Col("geometry", "text"),
            "sample (fuel type)": Col("material", "text"),
        },
        {"flame_mode": "concurrent", "gravity_g": 0.0},
    ),
    Schema(
        "psi069.flex1", "flex1", "FLEX", "CIR",
        _p(r"psi[-_ ]?0*69", r"flex(?!-?2)"),
        {
            "ambient pressure; mmhg": Col("pressure", "pressure", "mmhg"),
            "o initial ambient composition; mole fraction": Col("o2", "fraction"),
            "fuel": Col("material", "text"),
            "burning rate; mm": Col("burn_rate_mm_s", "number"),
            "burn time; s": Col("burn_time_s", "number"),
            "test end": Col("self_extinguished", "bool", true_set=frozenset(TRUE_EXT), false_set=frozenset(FALSE_EXT)),
        },
        {"flame_mode": "concurrent", "gravity_g": 0.0},
    ),
    Schema(
        "psi098.saffire1", "saffire1", "SAFFIRE-I", "CIR",
        _p(r"psi[-_ ]?0*98", r"saffire-?i(?!i)"),
        {
            "percent o2": Col("o2", "range_percent"),
            "material": Col("material", "text"),
            "sample thickness (cm)": Col("geometry", "text"),
            "burn time (s)": Col("burn_time_s", "number"),
            "sample length (cm)": Col("burn_length_mm", "cm"),
            "flow direction": Col("flame_mode", "text"),
            "air flow (cm/s)": Col("_air_flow", "number"),
        },
        {"gravity_g": 0.0},
    ),
    Schema(
        "psi099.saffire2", "saffire2", "SAFFIRE-II", "CIR",
        _p(r"psi[-_ ]?0*99", r"saffire-?2"),
        {
            "material": Col("material", "text"),
            "sample thickness": Col("geometry", "text"),
            "percent o2": Col("o2", "range_percent"),
            "1-g spread rate": Col("_rate_1g", "rate"),
            "u-g burn length": Col("burn_length_mm", "length"),
            "1-g burn length": Col("_length_1g", "length"),
            "flow direction": Col("flame_mode", "text"),
        },
        {"gravity_g": 0.0},
    ),
    Schema(
        "psi100.saffire3", "saffire3", "SAFFIRE-III", "CIR",
        _p(r"psi[-_ ]?0*100", r"saffire-?3"),
        {
            "material": Col("material", "text"),
            "sample thickness": Col("geometry", "text"),
            "air flow": Col("_air_flow", "number"),
            "direction": Col("flame_mode", "text"),
        },
        {"gravity_g": 0.0, "o2_min": 0.215, "o2_max": 0.215, "pressure_atm": 1.0},
    ),
    Schema(
        "psi101.samer", "samer", "SAME-R", "MSG",
        _p(r"psi[-_ ]?0*101", r"same-?r"),
        {
            "sample type": Col("material", "text"),
            "rt/r0": Col("soot_index", "number"),
            "net aging time (sec)": Col("burn_time_s", "number"),
            "inlet velocity (cm/s)": Col("geometry", "text"),
        },
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
    Schema(
        "psi102.same", "same", "SAME", "MSG",
        _p(r"psi[-_ ]?0*102", r"same(?!-?r)"),
        {
            "sample material": Col("material", "text"),
            "weight loss rate (mg/min)": Col("burn_rate_mm_s", "number"),
            "air flow (cm/s)": Col("geometry", "text"),
            "aging duration (minutes)": Col("burn_time_s", "number"),
        },
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
    Schema(
        "psi106.slice", "slice", "SLICE", "MSG",
        _p(r"psi[-_ ]?0*106", r"slice"),
        {"fuel type": Col("geometry", "fuel_mix")},
        {"flame_mode": "concurrent", "gravity_g": 0.0, "o2_min": 0.21, "o2_max": 0.21,
         "pressure_atm": 1.0, "material": "CH4"},
    ),
    Schema(
        "psi107.spice", "spice", "SPICE", "MSG",
        _p(r"psi[-_ ]?0*107", r"spice"),
        {
            "fuel": Col("material", "text"),
            "fuel rate (sccm)": Col("_fuel_sccm", "number"),
            "fuel rate (mg/s)": Col("_fuel_rate", "number"),
            "hc fuel rate (mg/s)": Col("_hc_fuel_rate", "number"),
            "nozzle (mm)": Col("geometry", "text"),
            "air rate (cm/s)": Col("_air_flow", "number"),
            "_ignition": Col("_ignition", "text"),
            "_flame_off": Col("_flame_off", "text"),
        },
        {"flame_mode": "concurrent", "gravity_g": 0.0},
    ),
    Schema(
        "psi159.cfi_inv", "cfi_g_inverse", "ACME CFI-G (inversa)", "CIR-ACME",
        _p(r"psi[-_ ]?0*159.*inv", r"cfi-g.*inv"),
        {
            "xo2": Col("o2", "fraction"),
            "approx p (bar)": Col("pressure", "pressure", "bar"),
            "fuel": Col("material", "text"),
            "hc burnrate (mg/s)": Col("burn_rate_mm_s", "number"),
            "burn time (sec)": Col("burn_time_s", "number"),
            "tad (k)": Col("tad_k", "number"),
            "zst": Col("zst", "number"),
            "hot ignition": Col("hot_ignition", "bool", frozenset({"yes"}), frozenset({"no"})),
            "self -ext or flow term": Col("self_extinguished", "bool", frozenset(TRUE_EXT), frozenset(FALSE_EXT)),
        },
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
    Schema(
        "psi159.cfi_norm", "cfi_g_normal", "ACME CFI-G (normal)", "CIR-ACME",
        _p(r"psi[-_ ]?0*159(?!.*inv)", r"cfi-g(?!.*inv)"),
        {
            "xo2  before test": Col("o2", "fraction"),
            "approx p (bar)": Col("pressure", "pressure", "bar"),
            "fuel": Col("material", "text"),
            "mhc (mg/s)": Col("burn_rate_mm_s", "number"),
            "burn time (sec)": Col("burn_time_s", "number"),
            "tad (k)": Col("tad_k", "number"),
            "zst": Col("zst", "number"),
            "cool flame?": Col("cool_flame", "bool", frozenset({"yes"}), frozenset({"no"})),
            "hot ignition": Col("hot_ignition", "bool", frozenset({"yes"}), frozenset({"no"})),
            "self-ext or flow term": Col("self_extinguished", "bool", frozenset(TRUE_EXT), frozenset(FALSE_EXT)),
        },
        {"flame_mode": "opposed", "gravity_g": 0.0},
    ),
)


def norm_header(raw: str) -> str:
    text = raw.replace("?", "u").replace("µ", "u").strip().lower()
    return re.sub(r"\s+", " ", text)


def resolve(filename: str, headers: list[str]) -> Schema | None:
    for schema in SCHEMAS:
        if any(p.search(filename) for p in schema.patterns):
            return schema
    normalised = {norm_header(h) for h in headers}
    best, best_score = None, 0
    for schema in SCHEMAS:
        score = len(set(schema.columns) & normalised)
        if score > best_score:
            best, best_score = schema, score
    return best if best_score >= 2 else None


def match_column(schema: Schema, header: str) -> Col | None:
    """Empareja normalizando AMBOS lados: las claves traen dobles espacios."""
    key = norm_header(header)
    exact = [c for n, c in schema.columns.items() if norm_header(n) == key]
    if exact:
        return exact[0]
    partial = [(norm_header(n), c) for n, c in schema.columns.items()
               if norm_header(n) in key or key in norm_header(n)]
    if not partial:
        return None
    return max(partial, key=lambda par: len(par[0]))[1]
