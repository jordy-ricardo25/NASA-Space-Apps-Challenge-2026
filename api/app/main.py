from contextlib import asynccontextmanager
import logging
import time
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .config import settings
from .db import engine
from .models import Base

logging.basicConfig(level=settings().log_level)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield


TAGS = [
    {"name": "metadatos", "description": "Entornos, pesos y reconstruccion del corpus."},
    {"name": "hallazgos", "description": "Ranking e interpretacion por entorno."},
    {"name": "investigaciones", "description": "Experimentos y variables."},
    {"name": "comparacion", "description": "Que es comparable con que."},
    {"name": "hardware", "description": "Facilidades, proyectos y masa."},
    {"name": "atmosfera", "description": "Oxigeno, presion y gravedad parcial."},
    {"name": "sensores", "description": "Instrumentos y variables medidas."},
    {"name": "reglas", "description": "Fisica de la guia oficial."},
    {"name": "incidentes", "description": "Revalidacion historica."},
    {"name": "vacios", "description": "Ausencias de evidencia."},
    {"name": "beneficio terrestre", "description": "Transferencia a Tierra."},
    {"name": "procedencia", "description": "Trazabilidad por fila."},
    {"name": "laboratorio", "description": "Contrafactuales."},
    {"name": "interpretacion", "description": "Contexto para un LLM."},
    {"name": "informe", "description": "Exportacion."},
]

app = FastAPI(
    openapi_tags=TAGS,
    title="emberwatch API",
    version=settings().kernel_version,
    description="Inteligencia de seguridad contra incendios sobre NASA PSI.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings().origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.middleware("http")
async def registro(request, call_next):
    inicio = time.perf_counter()
    identificador = uuid.uuid4().hex[:8]
    respuesta = await call_next(request)
    respuesta.headers["X-Request-Id"] = identificador
    logging.getLogger("emberwatch").info(
        "%s %s -> %s en %.0f ms [%s]", request.method, request.url.path,
        respuesta.status_code, (time.perf_counter() - inicio) * 1000, identificador,
    )
    return respuesta


app.include_router(router)


@app.get("/health", tags=["metadatos"], summary="Estado del servicio")
def health():
    return {"status": "ok", "kernel": settings().kernel_version}
