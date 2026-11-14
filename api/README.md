# emberwatch backend

Motor de ingesta y clasificación de riesgo contra incendios sobre NASA PSI.

## Arranque

    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    Copy-Item .env.example .env
    python -m scripts.ingest
    uvicorn app.main:app --reload

Documentación interactiva en http://127.0.0.1:8000/docs

## Archivos locales y secretos

La plantilla `.env.example` contiene solo valores públicos de ejemplo. Guarda la
configuración real en `.env` o sus variantes locales, excluidas de Git. También
se excluyen bases locales, respaldos, logs y archivos habituales de credenciales.
Antes de hacer commit, revisa `git status --short --untracked-files=all -- api`
desde la raíz del repositorio: las exclusiones no detectan secretos escritos en
código ni protegen archivos que Git ya esté siguiendo.

## Endpoints

| Método | Ruta | Uso |
|---|---|---|
| GET | /health | estado y versión de kernel |
| GET | /api/meta | entornos, pesos, materiales, bandas |
| POST | /api/ingest | reconstruye desde DATASET_DIR |
| GET | /api/findings?environment=eva | ranking por entorno, filtros min_rpi y material |
| GET | /api/matrix | matriz hallazgo x entorno y medias |
| GET | /api/incidents | revalidación Apollo 1, Apollo 13, Mir |
| GET | /api/spinoffs | beneficio terrestre |
| GET | /api/export?format=md | informe de misión |
| GET | /api/provenance/{archivo} | fila cruda, banderas, calidad |
| POST | /api/lab/simulate | contrafactual de atmósfera |

## Principios

- Ninguna celda sucia aborta la carga: se anota la bandera y baja la calidad.
- La unidad viene de la columna, nunca del valor.
- Multi-valor expande fila; no promedia.
- Todo valor guarda raw, rule y quality.
- El material se reduce a una clave canónica; el texto original se conserva.
- Los pesos del kernel están versionados en app/engine/weights.json.

## Notas

- /api/findings devuelve ~80 KB con el corpus completo; el frontend debe paginar.
- POST /api/ingest recrea la base desde cero.
- La versión de kernel viaja en /api/meta y en el informe exportado.

## Documentación

`/docs` muestra el contrato interactivo agrupado por etiqueta.
`python -m scripts.export_openapi` regenera `docs/openapi.json` y `docs/api.md`.
Ambos se generan desde el código: no se editan a mano.
