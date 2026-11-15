from __future__ import annotations

from dataclasses import replace
from statistics import median

import json
import math
from pathlib import Path
import time

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..dto import (
    ContextOut, FacilitiesOut, FindingOut, Fm2Out,
    GapsOut, GravityBandIn, GravityBandOut, HardwareNodeOut,
    IncidentOut, IncidentSourceOut, IngestOut, InvestigationOut,
    LabIn, LabOut, MatrixOut, MeasurementsOut,
    MetaOut, OxygenLadderOut, ProvenanceOut, RulesOut,
    SimilarityPair, SpinoffOut, VariationColumn, VariationOut,
)
from ..engine import kernel
from ..engine.environments import DILUENT_COEFF, ENVIRONMENTS, MATERIAL_LOI
from ..ingest.loader import ingest_dataset
from ..models import Observation

router = APIRouter(prefix="/api")

_CACHE: dict[str, tuple[float, list]] = {}
_TTL = 30.0


def _build_cached(db: Session, clave: str) -> list:
    ahora = time.monotonic()
    guardado = _CACHE.get(clave)
    if guardado and ahora - guardado[0] < _TTL:
        return guardado[1]
    construido = _build(db, clave)
    _CACHE[clave] = (ahora, construido)
    return construido


def _env(key: str):
    if key not in ENVIRONMENTS:
        raise HTTPException(404, f"entorno desconocido: {key}")
    return ENVIRONMENTS[key]


def _build(db: Session, env_key: str) -> list[FindingOut]:
    from ..engine.catalog import RELEVANCE

    env = _env(env_key)
    rows = db.scalars(select(Observation)).all()
    grupos: dict[tuple, list[Observation]] = {}
    for obs in rows:
        grupos.setdefault((obs.experiment_key, obs.material_key, obs.flame_mode), []).append(obs)

    salida: list[FindingOut] = []
    for (experimento, material, modo), items in grupos.items():
        scored = [(o, kernel.score(o, env, len(items))) for o in items]
        rep, resultado = max(scored, key=lambda par: par[1].total)
        w = kernel.weights()
        salida.append(FindingOut(
            key=f"{experimento}::{material or 'na'}::{modo}",
            experiment=rep.experiment_label, facility=rep.facility,
            material=material, geometry=rep.geometry, flame_mode=modo,
            o2_min=min((o.o2_min for o in items if o.o2_min is not None), default=None),
            o2_max=max((o.o2_max for o in items if o.o2_max is not None), default=None),
            pressure_atm=median([o.pressure_atm for o in items if o.pressure_atm is not None])
            if any(o.pressure_atm for o in items) else None,
            observations=len(items),
            quality=round(sum(o.quality for o in items) / len(items), 3),
            rpi=resultado.total, band=resultado.band,
            relevance=RELEVANCE.get(experimento, "context"),
            factors=[{"name": k, "value": round(v, 1), "weight": w[k],
                      "contribution": round(v * w[k], 2)}
                     for k, v in resultado.factors.items()],
            narrative=kernel.narrate(rep, env, resultado),
            sources=sorted({o.source_file for o in items}),
            rules=sorted({r for o in items for r in (o.rules_applied or [])}),
        ))
    return sorted(salida, key=lambda f: f.rpi, reverse=True)


@router.get("/meta", response_model=MetaOut, tags=["metadatos"], summary="Entornos, pesos y materiales")
def meta():
    return {
        "kernel_version": settings().kernel_version,
        "environments": {k: v.__dict__ for k, v in ENVIRONMENTS.items()},
        "weights": kernel.weights(),
        "materials": MATERIAL_LOI,
        "diluents": DILUENT_COEFF,
        "bands": {"critical": 75, "high": 56, "moderate": 36, "low": 0},
    }


@router.post("/ingest", response_model=IngestOut, tags=["metadatos"], summary="Reconstruir la base desde DATASET_DIR")
def ingest(db: Session = Depends(get_db)):
    _CACHE.clear()
    report = ingest_dataset(db, settings().dataset_dir)
    return IngestOut(
        files_seen=report.files_seen, files_parsed=report.files_parsed,
        rows_read=report.rows_read, rows_kept=report.rows_kept,
        rows_rejected=report.rows_rejected, skipped=report.files_skipped,
    )


@router.get("/findings", response_model=list[FindingOut], tags=["hallazgos"], summary="Ranking por entorno")
def findings(response: Response, environment: str = Query("eva"), min_rpi: int = 0,
             material: str | None = None, limit: int = Query(50, ge=1, le=500),
             offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    resultado = _build(db, environment)
    if min_rpi:
        resultado = [f for f in resultado if f.rpi >= min_rpi]
    if material:
        resultado = [f for f in resultado if (f.material or "").lower() == material.lower()]
    response.headers["X-Total-Count"] = str(len(resultado))
    return resultado[offset:offset + limit]


@router.get("/matrix", response_model=MatrixOut, tags=["hallazgos"], summary="Matriz hallazgo x entorno")
def matrix(db: Session = Depends(get_db)):
    tabla = []
    medias = {}
    for clave in ENVIRONMENTS:
        construidos = _build_cached(db, clave)
        medias[clave] = round(sum(f.rpi for f in construidos) / len(construidos), 1) if construidos else 0.0
        for f in construidos:
            tabla.append({"key": f.key, "experiment": f.experiment,
                          "environment": clave, "rpi": f.rpi, "band": f.band,
                          "relevance": f.relevance})
    return MatrixOut(findings=tabla, environment_means=medias)


@router.get("/provenance/{source_file}", response_model=ProvenanceOut, tags=["procedencia"], summary="Fila cruda, banderas y calidad")
def provenance(source_file: str, db: Session = Depends(get_db)):
    filas = db.scalars(select(Observation).where(Observation.source_file == source_file)).all()
    if not filas:
        raise HTTPException(404, "archivo sin observaciones")
    return {
        "source_file": source_file,
        "observations": len(filas),
        "rows": [{"row": r.source_row, "flags": r.flags, "rules": r.rules_applied,
                  "quality": r.quality, "raw": r.raw} for r in filas[:200]],
    }


def _coef_mezcla(body: LabIn) -> float | None:
    """Coeficiente ponderado si llegan CO2 o He; None si la mezcla es la nominal."""
    extra = body.co2_pct + body.he_pct
    if extra <= 0:
        return None
    resto = max(0.0, 100.0 - extra)
    return (DILUENT_COEFF.get("CO2", 1.0) * body.co2_pct
            + DILUENT_COEFF.get("He", 1.0) * body.he_pct
            + DILUENT_COEFF.get("N2", 1.0) * resto) / 100.0


@router.post("/lab/simulate", response_model=LabOut, tags=["laboratorio"], summary="Contrafactual de atmosfera")
def simulate(body: LabIn):
    env = replace(ENVIRONMENTS["eva"], o2_fraction=body.o2_fraction,
                  pressure_atm=body.pressure_atm, gravity_g=body.gravity_g,
                  diluent=body.diluent, flow_cm_s=body.flow_cm_s,
                  heat_w=body.ignition_w, diluent_coeff=_coef_mezcla(body))
    resultado = kernel.burn_rate(body.material, env, body.mode)
    curva = [[round(o, 3),
              kernel.burn_rate(body.material, replace(env, o2_fraction=o), body.mode)["rate_mm_s"]]
             for o in [0.10 + i * 0.02 for i in range(46)]]
    return LabOut(limit=resultado["limit"], excess=resultado["excess"],
                  quenched=resultado["quenched"], rate_mm_s=resultado["rate_mm_s"], curve=curva)

INCIDENTS = [
    {"slug": "apollo_1", "name": "Apollo 1", "year": 1967, "environment": "eva",
     "atmosphere": "16.7 psia O2 puro", "timeline": "17 s de ignición a pérdida de tripulación",
     "verdict": "confirmado",
     "evidence": ["psi_159_cfi_g_inverse.csv", "psi_026_bass_1.csv", "psi_102_same.csv"],
     "summary": "Atmósfera de O2 puro a presión casi terrestre. El corpus cubre hasta 85 % O2 "
                "y predice propagación concurrente rápida sobre velcro y espuma."},
    {"slug": "apollo_13", "name": "Apollo 13", "year": 1970, "environment": "iss",
     "atmosphere": "tanque criogénico de O2", "timeline": "fallo de integridad del sistema de O2",
     "verdict": "parcial",
     "evidence": ["psi_068_flex_2.csv", "psi_159_cfi_g_normal.csv"],
     "summary": "No es propagación de llama sino integridad del oxidante. Brecha de ingesta: "
                "falta evidencia sobre recipientes de O2 a presión."},
    {"slug": "mir_1997", "name": "Mir, módulo Kvant-1", "year": 1997, "environment": "iss",
     "atmosphere": "14.7 psia, generador de O2", "timeline": "unos 14 min hasta extinción",
     "verdict": "confirmado",
     "evidence": ["psi_098_saffire_1.csv", "psi_100_saffire_3.csv", "psi_025_bass_2.csv"],
     "summary": "Fuego sostenido en flujo concurrente: el corpus predice combustión prolongada "
                "y dificultad de extinción en microgravedad con convección forzada."},
]

SPINOFFS = [
    {"name": "Detectores de humo de baja falsa alarma",
     "source": "brunswick_fire_detector.txt",
     "benefit": "Umbral de obscurecimiento calibrado contra la deriva de hollín envejecido de SAME-R."},
    {"name": "Textiles ignífugos PBI / Nomex",
     "source": "project_fires_1982.txt",
     "benefit": "Límites de O2 y flujo heredados de BASS para tejidos de intervención."},
    {"name": "Tanques de respiración de fibra compuesta",
     "source": "scott_air_pak.txt",
     "benefit": "Márgenes de presión del corpus FLEX aplicados a recipientes ligeros."},
]


@router.get("/incidents", response_model=list[IncidentOut], tags=["incidentes"], summary="Revalidacion historica")
def incidents(db: Session = Depends(get_db)):
    salida = []
    for inc in INCIDENTS:
        filas = db.scalars(
            select(Observation).where(Observation.source_file.in_(inc["evidence"]))
        ).all()
        env = ENVIRONMENTS[inc["environment"]]
        media = (round(sum(kernel.score(o, env, len(filas)).total for o in filas) / len(filas), 1)
                 if filas else None)
        salida.append({**inc, "linked_observations": len(filas), "mean_rpi": media})
    return salida


@router.get("/spinoffs", response_model=list[SpinoffOut], tags=["beneficio terrestre"], summary="Aplicaciones en Tierra")
def spinoffs():
    return SPINOFFS


@router.get("/export", tags=["informe"], summary="Informe de mision en md o json")
def export(environment: str = Query("eva"), formato: str = Query("md", alias="format"),
           db: Session = Depends(get_db)):
    env = _env(environment)
    filas = _build_cached(db, environment)
    if formato == "json":
        cuerpo = json.dumps({
            "kernel": settings().kernel_version, "environment": env.label,
            "generado": "2026-11-14",
            "hallazgos": [{"archivo": f.sources, "experimento": f.experiment,
                           "material": f.material, "rpi": f.rpi, "banda": f.band}
                          for f in filas],
        }, indent=2, ensure_ascii=False)
        return Response(cuerpo, media_type="application/json",
                        headers={"Content-Disposition": 'attachment; filename="emberwatch.json"'})

    lineas = [f"# emberwatch — informe de misión", "",
              f"Entorno: {env.label} · O2 {round(env.o2_fraction * 100)} % · "
              f"{env.pressure_atm:.2f} atm · {env.gravity_g} g", "",
              f"Kernel {settings().kernel_version}", ""]
    for i, f in enumerate(filas, 1):
        lineas += [f"{i}. [{f.rpi}] {f.experiment} — {f.material} ({f.band})",
                   f"   {f.narrative}",
                   f"   Fuente: {', '.join(f.sources)}", ""]
    return Response("\n".join(lineas), media_type="text/markdown",
                    headers={"Content-Disposition": 'attachment; filename="emberwatch.md"'})

@router.get("/investigations", response_model=list[InvestigationOut], tags=["investigaciones"], summary="Listado de experimentos")
def investigations(db: Session = Depends(get_db)):
    from ..engine.catalog import EXPERIMENT_PROJECT, PROJECTS, RELEVANCE

    filas = db.scalars(select(Observation)).all()
    grupos: dict[str, list[Observation]] = {}
    for obs in filas:
        grupos.setdefault(obs.experiment_key, []).append(obs)

    salida = []
    for clave, items in grupos.items():
        proyecto = EXPERIMENT_PROJECT.get(clave)
        meta = PROJECTS.get(proyecto or "", {})
        salida.append({
            "key": clave,
            "label": items[0].experiment_label,
            "facility": items[0].facility,
            "relevance": RELEVANCE.get(clave, "context"),
            "project": proyecto,
            "project_label": meta.get("label"),
            "hardware": meta.get("hardware"),
            "observations": len(items),
            "materials": sorted({o.material_key for o in items if o.material_key}),
            "modes": sorted({o.flame_mode for o in items}),
        })
    return sorted(salida, key=lambda x: -x["observations"])


@router.get("/investigations/{clave}/variation", response_model=VariationOut, tags=["investigaciones"], summary="Variables que cambian entre corridas")
def variation(clave: str, db: Session = Depends(get_db)):
    filas = db.scalars(
        select(Observation).where(Observation.experiment_key == clave)
    ).all()
    if not filas:
        raise HTTPException(404, "experimento sin observaciones")

    columnas: dict[str, list[str]] = {}
    for obs in filas:
        for nombre, valor in (obs.raw or {}).items():
            columnas.setdefault(nombre, []).append(str(valor))

    variables: list[VariationColumn] = []
    constantes: list[str] = []
    for nombre, valores in columnas.items():
        distintos = {v.strip().lower() for v in valores if v.strip()}
        if len(distintos) <= 1:
            constantes.append(nombre)
            continue
        numeros = []
        for v in distintos:
            try:
                numeros.append(float(v.replace(",", ".")))
            except ValueError:
                pass
        variables.append(VariationColumn(
            column=nombre, distinct=len(distintos),
            minimum=min(numeros) if numeros else None,
            maximum=max(numeros) if numeros else None,
            examples=sorted(distintos)[:5],
        ))

    variables.sort(key=lambda c: -c.distinct)
    return VariationOut(
        experiment=filas[0].experiment_label,
        material=filas[0].material_key,
        observations=len(filas),
        varying=variables,
        constant=sorted(constantes),
        note="Solo las columnas con más de un valor distinguen corridas.",
    )


@router.get("/similarity", response_model=list[SimilarityPair], tags=["comparacion"], summary="Similitud entre experimentos")
def similarity(db: Session = Depends(get_db), minimo: int = Query(0, ge=0, le=100)):
    from ..engine.catalog import EXPERIMENT_PROJECT

    filas = db.scalars(select(Observation)).all()
    grupos: dict[tuple, list[Observation]] = {}
    for obs in filas:
        grupos.setdefault((obs.experiment_key, obs.material_key, obs.flame_mode), []).append(obs)

    def perfil(items):
        o2 = [o.o2_max for o in items if o.o2_max is not None]
        pres = [o.pressure_atm for o in items if o.pressure_atm is not None]
        g = [o.gravity_g for o in items if o.gravity_g is not None]
        return {
            "o2": median(o2) if o2 else 0.21,
            "p": median(pres) if pres else 1.0,
            "g": median(g) if g else 0.0,
            "material": items[0].material_key,
            "mode": items[0].flame_mode,
            "facility": items[0].facility,
            "project": EXPERIMENT_PROJECT.get(items[0].experiment_key),
        }

    claves = list(grupos)
    perfiles = {k: perfil(grupos[k]) for k in claves}
    salida: list[SimilarityPair] = []

    for i, a in enumerate(claves):
        for b in claves[i + 1:]:
            pa, pb = perfiles[a], perfiles[b]
            if pa["material"] == pb["material"]:
                continue
            distancia = (
                abs(math.log(max(pa["o2"], .01) / max(pb["o2"], .01))) * 1.1
                + abs(math.log(max(pa["p"], .05) / max(pb["p"], .05))) * 0.6
                + abs(pa["g"] - pb["g"]) * 1.4
                + (0.0 if pa["mode"] == pb["mode"] else 0.5)
                + (0.0 if pa["project"] == pb["project"] else 0.3)
            )
            similitud = int(round(100 * math.exp(-distancia / 1.6)))
            if similitud < minimo:
                continue
            compartido, distinto = [], []
            (compartido if pa["mode"] == pb["mode"] else distinto).append("modo")
            (compartido if pa["project"] == pb["project"] else distinto).append("proyecto")
            (compartido if abs(pa["o2"] - pb["o2"]) < .03 else distinto).append("O2")
            (compartido if abs(pa["g"] - pb["g"]) < .05 else distinto).append("gravedad")
            salida.append(SimilarityPair(
                a=f'{a[0]}::{a[1]}', b=f'{b[0]}::{b[1]}',
                similarity=similitud, shared=compartido, differing=distinto,
            ))
    return sorted(salida, key=lambda x: -x.similarity)[:400]


@router.get("/hardware", response_model=list[HardwareNodeOut], tags=["hardware"], summary="Arbol de facilidades y proyectos")
def hardware(db: Session = Depends(get_db)):
    from ..engine.catalog import EXPERIMENT_PROJECT, PROJECTS

    filas = db.scalars(select(Observation)).all()
    conteo: dict[str, int] = {}
    for obs in filas:
        conteo[obs.experiment_key] = conteo.get(obs.experiment_key, 0) + 1

    arbol: dict[str, dict] = {}
    for proyecto, meta in PROJECTS.items():
        arbol[proyecto] = {**meta, "project": proyecto, "experiments": []}
    for clave, n in conteo.items():
        proyecto = EXPERIMENT_PROJECT.get(clave)
        if proyecto and proyecto in arbol:
            arbol[proyecto]["experiments"].append({"key": clave, "observations": n})
    for nodo in arbol.values():
        nodo["experiments"].sort(key=lambda e: -e["observations"])
    return sorted(arbol.values(), key=lambda n: -sum(e["observations"] for e in n["experiments"]))


@router.get("/gaps", response_model=GapsOut, tags=["vacios"], summary="Celdas sin evidencia y brechas declaradas")
def gaps(db: Session = Depends(get_db)):
    from ..engine.catalog import DECLARED_GAPS
    from ..engine.environments import CLASS_FIT, MATERIAL_CLASS

    filas = db.scalars(select(Observation)).all()
    conteo: dict[tuple[str, str], int] = {}
    for obs in filas:
        clase = MATERIAL_CLASS.get(obs.material_key or "", "solido")
        conteo[(clase, obs.flame_mode)] = conteo.get((clase, obs.flame_mode), 0) + 1

    celdas = []
    for env_key in ENVIRONMENTS:
        for clase in CLASS_FIT[env_key]:
            n = sum(v for (c, _), v in conteo.items() if c == clase)
            celdas.append({
                "environment": env_key, "material_class": clase,
                "observations": n,
                "affinity": CLASS_FIT[env_key][clase],
                "state": "sin evidencia" if n == 0 else ("escasa" if n < 5 else "cubierta"),
            })
    return {
        "cells": celdas,
        "declared": DECLARED_GAPS,
        "note": "Una celda sin evidencia no es un cero: es una ausencia.",
    }


@router.get("/oxygen-ladder", response_model=OxygenLadderOut, tags=["atmosfera"], summary="Umbrales de material a lo largo del O2")
def oxygen_ladder():
    from ..engine.environments import MATERIAL_CLASS, MATERIAL_LOI
    from ..engine.kernel import quench_limit
    from ..engine.environments import ENVIRONMENTS

    escalones = [0.21, 0.30, 0.40, 0.60, 0.85, 1.00]
    filas = []
    for material in sorted(MATERIAL_LOI):
        fila = {"material": material, "class": MATERIAL_CLASS.get(material, "solido"), "steps": []}
        for o2 in escalones:
            cabina = quench_limit(material, ENVIRONMENTS["iss"])
            traje = quench_limit(material, ENVIRONMENTS["eva"])
            fila["steps"].append({
                "o2": o2,
                "over_cabin_limit": round(o2 - cabina, 3),
                "over_suit_limit": round(o2 - traje, 3),
                "sustains_cabin": o2 > cabina,
                "sustains_suit": o2 > traje,
            })
        filas.append(fila)
    return {
        "steps": escalones,
        "materials": filas,
        "anchors": [
            {"o2": 0.21, "label": "Tierra"},
            {"o2": 0.30, "label": "Base lunar mínima"},
            {"o2": 0.85, "label": "Techo de CFI-G"},
            {"o2": 1.00, "label": "Traje EVA"},
        ],
    }


PARTIAL_G_MEDIDO = {"PMMA"}  # Olson 2024, unica serie en gravedad parcial del corpus


@router.post("/lab/gravity-band", response_model=GravityBandOut, tags=["laboratorio"], summary="Banda ug a 1 g")
def gravity_band(body: GravityBandIn):
    env = replace(ENVIRONMENTS["eva"], o2_fraction=body.o2_fraction,
                  pressure_atm=body.pressure_atm, diluent=body.diluent)
    bajo = kernel.burn_rate(body.material, replace(env, gravity_g=0.0), body.mode)
    alto = kernel.burn_rate(body.material, replace(env, gravity_g=1.0), body.mode)
    medio = kernel.burn_rate(body.material, replace(env, gravity_g=body.gravity_g), body.mode)
    return GravityBandOut(
        low=bajo["rate_mm_s"], high=alto["rate_mm_s"],
        interpolated=medio["rate_mm_s"], interpolated_at=body.gravity_g,
        declared=body.material in PARTIAL_G_MEDIDO,
        quenched_low=bajo["quenched"], quenched_high=alto["quenched"],
    )

@router.get("/measurements", response_model=MeasurementsOut, tags=["sensores"], summary="Que se midio y con que")
def measurements():
    from ..engine.catalog import MEASUREMENTS, MISSING_VARIABLES

    salida = []
    for clave, instrumentos in MEASUREMENTS.items():
        salida.append({
            "experiment": clave,
            "measurements": [{"instrument": i, "variable": v, "kind": k} for i, v, k in instrumentos],
            "kinds": sorted({k for _, _, k in instrumentos}),
        })
    return {"experiments": salida, "missing_variables": MISSING_VARIABLES,
            "note": "Qué se midió y con qué. Una variable ausente no es un cero."}


@router.get("/findings/{clave}/context", response_model=ContextOut, tags=["interpretacion"], summary="Paquete listo para un LLM")
def finding_context(clave: str, environment: str = Query("eva"), db: Session = Depends(get_db)):
    from ..llm.prompt import ESQUEMA_RESPUESTA, construir

    filas = _build(db, environment)
    objetivo = next((f for f in filas if f.key == clave), None)
    if objetivo is None:
        raise HTTPException(404, "hallazgo desconocido")

    obs = db.scalars(select(Observation).where(Observation.source_file.in_(objetivo.sources))).all()
    evidencia = [{"file": o.source_file, "row": o.source_row, "quality": o.quality,
                  "flags": o.flags, "raw": o.raw} for o in obs[:12]]
    env = ENVIRONMENTS[environment]
    return {
        "finding": objetivo.model_dump(),
        "environment": env.__dict__,
        "evidence": evidencia,
        "messages": construir(objetivo.model_dump(), env.__dict__, evidencia),
        "response_schema": ESQUEMA_RESPUESTA,
        "provider": "sin clave: usa messages con cualquier API compatible",
    }

def _referencia() -> dict:
    import json as _json

    ruta = Path(__file__).resolve().parent.parent / "data" / "reference.json"
    if not ruta.exists():
        raise HTTPException(503, "falta app/data/reference.json: ejecuta scripts/load_reference.py")
    return _json.loads(ruta.read_text(encoding="utf-8"))


@router.get("/rules", response_model=RulesOut, tags=["reglas"], summary="Mitos y hechos de la guia oficial")
def rules():
    datos = _referencia()
    return {"rules": datos["reglas"], "count": len(datos["reglas"]),
            "source": "A Researcher's Guide to ISS Combustion Science, NP-2015-10-034-JSC"}


@router.get("/facilities", response_model=FacilitiesOut, tags=["hardware"], summary="Instalaciones con masa y volumen")
def facilities():
    datos = _referencia()
    return {"facilities": datos["instalaciones"], "investigations": datos["investigaciones"]}


@router.get("/fm2", response_model=Fm2Out, tags=["atmosfera"], summary="Payload lunar planificado")
def fm2():
    datos = _referencia()["fm2"]
    return {"payload": datos,
            "note": "Payload lunar planificado. Aporta las condiciones de 0.165 g que PSI aún no tiene."}


@router.get("/incidents/{slug}/source", response_model=IncidentSourceOut, tags=["incidentes"], summary="Extracto del informe original")
def incident_source(slug: str):
    carpeta = settings().dataset_dir / "incidents_txt"
    ruta = carpeta / f"{slug}.txt"
    if not ruta.exists():
        raise HTTPException(404, "incidente sin fuente")
    texto = ruta.read_text(encoding="utf-8-sig")
    utiles = [l.strip() for l in texto.splitlines() if l.strip() and not l.startswith("====")]
    return {"slug": slug, "excerpt": utiles[:14], "lines": len(utiles), "chars": len(texto)}









