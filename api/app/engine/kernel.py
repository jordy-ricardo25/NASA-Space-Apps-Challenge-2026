"""Kernel de riesgo. Determinista, con pesos versionados y rastro por factor."""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from .environments import (
    CLASS_FIT, DEFAULT_CLASS, DEFAULT_LOI, DILUENT_COEFF, MATERIAL_CLASS,
    MATERIAL_LOI, Environment,
)

WEIGHTS_PATH = Path(__file__).with_name("weights.json")


@lru_cache
def weights() -> dict[str, float]:
    return json.loads(WEIGHTS_PATH.read_text(encoding="utf-8"))["factors"]


def clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


FORCED_MODES = {"concurrent", "coflow"}


def diluent_factor(env: Environment) -> float:
    """Coeficiente del diluyente: explícito si viene de una mezcla, si no por nombre."""
    if env.diluent_coeff is not None:
        return env.diluent_coeff
    return DILUENT_COEFF.get(env.diluent, 1.0)


def quench_limit(material: str | None, env: Environment, mode: str = "opposed") -> float:
    """Límite de O2 para sostener llama.

    Sin flujo explícito se mantiene el cálculo por gravedad. Con flujo se añade la
    curva en U: el aire quieto extingue por pérdidas radiativas y el flujo alto
    enfría el frente. El mínimo cae en la meseta de 20-40 cm/s, donde se calibró.
    """
    base = MATERIAL_LOI.get(material or "", DEFAULT_LOI)
    value = base
    if mode in FORCED_MODES:
        value -= 0.008
    else:
        value += 0.010 * math.exp(-env.gravity_g / 0.12)
    if env.flow_cm_s is not None:
        u = max(env.flow_cm_s, 0.0)
        value += 0.055 * math.exp(-u / 3.0)
        value += 0.10 * (max(0.0, u - 40.0) / 80.0) ** 2
    if env.heat_w > 0:
        value -= 0.06 * min(1.0, env.heat_w / 250.0)
    if env.pressure_atm < 0.55:
        value += (0.55 - env.pressure_atm) * 0.055
    value /= diluent_factor(env) ** 0.6
    return clamp(value, 0.09, 0.62)


# Tendencia a hollín por material, usada cuando la tabla no trae índice propio.
MATERIAL_SOOT = {
    "SIBAL": 0.72, "PMMA": 0.55, "Kapton": 0.90, "Teflon": 0.86,
    "C12H26": 0.60, "n-dodecane": 0.60, "Methanol": 0.35, "Heptane": 0.48,
    "Ethylene": 0.85, "C2H4": 0.85, "CH4": 0.40, "Methane": 0.40,
    "Silicone": 0.50, "Ethane": 0.55, "Propane": 0.62, "Butane": 0.66,
}
DEFAULT_SOOT = 0.50


def mat(obs) -> str | None:
    return getattr(obs, "material_key", None) or getattr(obs, "material", None)


def soot_of(obs) -> float:
    """Hollín efectivo: índice medido si está en 0-1, si no el baseline del material."""
    value = getattr(obs, "soot_index", None)
    if value is None or value > 1.0:
        return MATERIAL_SOOT.get(mat(obs) or "", DEFAULT_SOOT)
    return value


def burn_rate(material: str | None, env: Environment, mode: str) -> dict:
    ref = 1.70 if material == "SIBAL" else 0.6
    limit = quench_limit(material, env, mode)
    excess = max(0.0, env.o2_fraction - limit)
    # Techo de 8: la tasa satura en atmósferas muy ricas, no crece sin fin.
    o2_factor = min((excess / 0.06) ** 1.15, 8.0)
    p_factor = math.exp(-(math.log(max(env.pressure_atm, 0.15)) ** 2) / (2 * 0.85 ** 2))
    if env.gravity_g < 0.1:
        g_factor = 1.05 if mode == "concurrent" else 1.20
    elif env.gravity_g < 0.2:
        g_factor = 1.14 if mode == "concurrent" else 0.56
    elif env.gravity_g < 0.5:
        g_factor = 1.08 if mode == "concurrent" else 0.72
    else:
        g_factor = 1.0
    rate = ref * o2_factor * p_factor * g_factor * diluent_factor(env)
    return {"rate_mm_s": round(rate, 4), "limit": round(limit, 4),
            "excess": round(excess, 4), "quenched": excess <= 0}


@dataclass
class Score:
    total: int
    band: str
    factors: dict[str, float] = field(default_factory=dict)
    burn: dict = field(default_factory=dict)


BANDS = ((75, "critical"), (56, "high"), (36, "moderate"), (0, "low"))


def band_of(total: int) -> str:
    for threshold, name in BANDS:
        if total >= threshold:
            return name
    return "low"


def compressive(distance: float, scale: float = 1.1) -> float:
    """Rendimientos decrecientes: un salto grande no vale linealmente más."""
    return clamp(100 * (1 - math.exp(-scale * max(distance, 0.0))))


def score(obs, env: Environment, group_size: int = 1) -> Score:
    """obs: Observation (o cualquier objeto con los mismos atributos)."""
    w = weights()
    o2_ceiling = obs.o2_max if obs.o2_max is not None else 0.21
    pressure = obs.pressure_atm if obs.pressure_atm is not None else 1.0
    gravity = obs.gravity_g if obs.gravity_g is not None else 0.0
    measured = getattr(obs, "burn_rate_mm_s", None)

    limit = quench_limit(obs.material, env, obs.flame_mode)
    margen_relativo = (env.o2_fraction - limit) / max(limit, 0.05)

    if measured is None:
        sustain = 50.0
    elif measured <= 0:
        sustain = 0.0
    else:
        sustain = clamp(20 + measured * 30)

    factors = {
        "o2_margin": clamp(100 * margen_relativo / 3.5),
        "o2_extrapolation": clamp(max(0.0, env.o2_fraction - o2_ceiling) / 0.30 * 100),
        "pressure_extrapolation": compressive(abs(math.log(env.pressure_atm / max(pressure, 0.01))), 0.9),
        "gravity_extrapolation": compressive(abs(math.log10((env.gravity_g + 0.01) / (gravity + 0.01)))),
        "soot_load": clamp(soot_of(obs) * 100),
        "cool_flame": clamp(100.0 if obs.cool_flame else soot_of(obs) * 30),
        "evidence_weakness": clamp((1.0 - (obs.quality or 0.5)) * 100),
        "material_fit": clamp(env.material_fit * CLASS_FIT[env.key].get(
            MATERIAL_CLASS.get(mat(obs) or "", DEFAULT_CLASS), 0.80) * 100),
        "egress_window": clamp(110 - env.egress_s * 0.16),
        "measured_sustain": sustain,
        "evidence_density": clamp(100 * min(1.0, (group_size / 25) ** 0.5)),
    }
    total = round(sum(factors[k] * w[k] for k in w))
    burn = burn_rate(obs.material, env, obs.flame_mode)
    if measured is not None:
        burn["rate_mm_s"] = round(float(measured), 4)
        burn["measured"] = True
        burn["quenched"] = measured <= 0
    return Score(total=int(clamp(total)), band=band_of(total), factors=factors, burn=burn)


def narrate(obs, env: Environment, result: Score) -> str:
    burn = result.burn
    parts = [
        f"{obs.material or 'material sin clasificar'} ({obs.geometry or 'geometría no declarada'}) "
        f"ensayado a {round((obs.o2_min or 0) * 100)}-{round((obs.o2_max or 0) * 100)} % O2 "
        f"y {obs.pressure_atm or 1.0:.2f} atm."
    ]
    delta = round((env.o2_fraction - (obs.o2_max or 0.21)) * 100)
    parts.append(
        f"En {env.label} la fracción efectiva es {round(env.o2_fraction * 100)} % "
        f"({delta:+d} puntos sobre el techo ensayado) a {env.pressure_atm:.2f} atm."
    )
    if burn.get("measured"):
        if burn["rate_mm_s"] <= 0:
            parts.append("Medición directa en µg: la muestra no sostuvo propagación.")
        else:
            parts.append(f"Medición directa en µg: {burn['rate_mm_s']:.2f} mm/s.")
    elif burn["quenched"]:
        parts.append(f"Proyección: extinción, por debajo del límite de {round(burn['limit'] * 100)} % O2.")
    else:
        parts.append(f"Proyección: propagación de {burn['rate_mm_s']:.2f} mm/s.")
    if (obs.soot_index or 0) > 0.8:
        parts.append("Carga de partículas alta: el detector óptico satura antes del umbral térmico.")
    if obs.cool_flame:
        parts.append("Llama fría confirmada: la extinción aparente no descarta reignición.")
    return " ".join(parts)
