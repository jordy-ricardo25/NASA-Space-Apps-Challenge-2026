"""Construcción determinista de mensajes para un LLM. Sin red, sin claves."""
from __future__ import annotations

SYSTEM = (
    "Eres analista de seguridad contra incendios en microgravedad. "
    "Interpretas registros de NASA PSI para planificadores de misión. "
    "Reglas: cita siempre archivo y fila; no inventes cifras que no aparezcan en la evidencia; "
    "si falta dato, dilo y marca la extrapolación; distingue medición de proyección; "
    "responde en español, en tres bloques: hallazgo, riesgo operacional, recomendación."
)

ESQUEMA_RESPUESTA = {
    "type": "object",
    "required": ["hallazgo", "riesgo", "recomendacion", "citas"],
    "properties": {
        "hallazgo": {"type": "string"},
        "riesgo": {"type": "string"},
        "recomendacion": {"type": "string"},
        "citas": {"type": "array", "items": {"type": "string"}},
        "confianza": {"type": "string", "enum": ["alta", "media", "baja"]},
    },
}


def construir(finding: dict, environment: dict, evidence: list[dict]) -> list[dict]:
    lineas = [
        f"Entorno: {environment['label']} · O2 {round(environment['o2_fraction'] * 100)} % · "
        f"{environment['pressure_atm']:.2f} atm · {environment['gravity_g']} g · "
        f"diluyente {environment['diluent']} · egreso {environment['egress_s']} s",
        f"Hallazgo: {finding['experiment']} · material {finding['material']} · "
        f"geometría {finding['geometry']} · modo {finding['flame_mode']}",
        f"RPI {finding['rpi']} ({finding['band']})",
        "Factores: " + ", ".join(
            f"{f['name']}={f['value']:.0f} (peso {f['weight']:.2f})" for f in finding["factors"]),
        "Evidencia:",
    ]
    for fila in evidence:
        lineas.append(f"  - {fila['file']} fila {fila['row']} calidad {fila['quality']} "
                      f"banderas {fila['flags']} crudo {fila['raw']}")
    lineas.append("Reglas aplicadas: " + ", ".join(finding["rules"]))
    return [{"role": "system", "content": SYSTEM},
            {"role": "user", "content": "\n".join(lineas)}]
