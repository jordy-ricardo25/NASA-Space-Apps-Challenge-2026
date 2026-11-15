# Auditoría de integración: backend (`api/`) y frontend (`web/`)

Fecha: 15 de noviembre de 2026 · Rama auditada: `main` (commit `ea95400`) fusionada en `dev/juan`.

## 1. Resumen

- El backend (`api/`, FastAPI, nombre interno *emberwatch*) y el frontend (`web/`, Next.js) se
  diseñaron con **contratos distintos**. El backend gira en torno a un ranking de riesgo por
  hallazgo (índice RPI) y su CORS apunta a `localhost:5173`, que no es el puerto del frontend.
  El frontend pide fronteras de inflamabilidad con intervalo, nivel de evidencia y alertas.
- De los 23 endpoints del backend, **15 responden con contenido** y **8 quedan vacíos o en 404**,
  porque dependen de una carpeta de datos (`dataset_clean`) que no está en el repositorio.
- De los 12 recursos que usa el frontend, **1 tiene equivalente directo y funcional** en el
  backend (estado del servicio), **5 tienen un equivalente parcial** con otra forma u otros
  valores, y **6 no tienen equivalente**.
- Se integró lo que encaja sin riesgo: el estado del backend y las reglas "mitos y hechos" de la
  guía oficial de NASA. Todo lo demás sigue respondiendo desde los servicios del frontend.
  Con el backend apagado, la plataforma funciona igual.

## 2. Cómo se auditó

1. Se fusionó `main` en `dev/juan` (sin conflictos) y se leyó el código de `api/`.
2. Se instaló el backend en un entorno virtual y se ejecutaron sus pruebas: **9 fallan** y el
   resto pasa. Las 9 fallan por la misma causa: no hay datos ingeridos.
3. Se levantó el backend y se llamó a cada endpoint, anotando estado, tamaño y forma.
4. Se contrastó cada recurso que necesita el frontend con lo que ofrece el backend.

## 3. Endpoints del backend y su estado

| Endpoint | Estado | Observación |
|---|---|---|
| `GET /health` | Responde | `{status, kernel}` |
| `GET /api/meta` | Responde | Entornos, pesos, materiales y bandas |
| `GET /api/rules` | Responde | 5 mitos y hechos de la guía NP-2015-10-034-JSC |
| `GET /api/incidents` | Responde | Apolo 1, Apolo 13 y Mir; `linked_observations` en 0 |
| `GET /api/spinoffs` | Responde | 3 casos, sin enlace a NASA Spinoff |
| `GET /api/gaps` | Responde | 35 celdas (todas "sin evidencia") y 4 brechas declaradas |
| `GET /api/oxygen-ladder` | Responde | Umbrales por material a 6 niveles de O₂ |
| `GET /api/measurements` | Responde | Instrumentos y variables de 20 experimentos |
| `GET /api/hardware` | Responde | 6 nodos; la lista de experimentos de cada uno está vacía |
| `GET /api/facilities` | Responde | 4 instalaciones con masa y volumen |
| `GET /api/fm2` | Responde | Ficha de la carga FM2 |
| `POST /api/lab/simulate` | Responde | Límite de O₂, exceso y curva de velocidad |
| `POST /api/lab/gravity-band` | Responde | Valor interpolado entre µg y 1 g |
| `GET /api/matrix` | Responde vacío | Sin hallazgos |
| `GET /api/export` | Responde vacío | Informe sin hallazgos |
| `GET /api/findings` | Vacío | Necesita `dataset_clean` |
| `GET /api/investigations` | Vacío | Necesita `dataset_clean` |
| `GET /api/similarity` | Vacío | Necesita `dataset_clean` |
| `GET /api/investigations/{clave}/variation` | 404 | Necesita `dataset_clean` |
| `GET /api/findings/{clave}/context` | 404 | Necesita `dataset_clean` |
| `GET /api/provenance/{archivo}` | 404 | Necesita `dataset_clean` |
| `GET /api/incidents/{slug}/source` | 404 | "incidente sin fuente" |
| `POST /api/ingest` | No ejecutado | Recrea la base; sin datos no aporta nada |

## 4. Qué necesita el frontend y qué hay en el backend

| Recurso del frontend | Quién lo usa | Equivalente en el backend | Alineación |
|---|---|---|---|
| `GET /api/health` | Indicador "Sistema en línea" | `GET /health` | **Directa. Integrado** |
| `GET /api/environments` | Módulos, chip de ambiente | `GET /api/meta` | Parcial: otra forma y **valores distintos** (§5) |
| `GET /api/investigations` y `/[id]` | Guía: biblioteca y ficha | `GET /api/investigations` | Vacío sin datos; otra forma |
| `GET /api/investigations?env=` | Guía: ranking | `GET /api/findings` | Vacío sin datos; mide otra cosa (RPI) |
| `GET /api/compare` | Guía: comparador | `GET /api/similarity` | Vacío sin datos |
| `GET /api/coverage` | Guía: cobertura | `GET /api/measurements` | Parcial: instrumentos, no la matriz por variable |
| `POST /api/predict/solid-boundary` | Laboratorio y cabinas | `POST /api/lab/simulate` | Parcial: sin intervalo, evidencia ni alertas (§5) |
| `POST /api/risk` | Margen y alertas | `POST /api/lab/simulate` | Parcial, igual que el anterior |
| `POST /api/predict/droplet-k` | Laboratorio: gotas | — | **No existe** |
| `GET /api/techmap` | Radar | `GET /api/gaps`, `GET /api/fm2` | Parcial: solo brechas, sin la cadena evidencia → tecnología |
| `GET /api/earth` | Tierra | `GET /api/spinoffs` | Parcial: 3 casos frente a 5, sin problema, impacto ni enlace |
| Lecciones históricas | Guía | `GET /api/incidents` | Parcial: otra forma |
| `POST /api/asistente/chat` | Asistente FUEGO | — | **No existe** (hay un paquete de contexto para un LLM, vacío sin datos) |
| Fuentes y licencias | Referencias | — | **No existe** |
| Mitos y hechos | Guía (pestaña nueva) | `GET /api/rules` | **Directa. Integrado** |

## 5. Diferencias que impiden sustituir sin romper

Estas diferencias son la razón por la que no se cambiaron los cálculos del frontend por los del backend.

| Tema | Backend | Frontend y documentos del proyecto |
|---|---|---|
| Atmósfera de la base lunar | 32 % O₂ a 0,558 atm | 34 % a 56,5 kPa (exploración) o 30 % a 70,3 kPa (reto) |
| Gravedad del rover | 0,38 g | 0,165 g (rover lunar) |
| Gravedad parcial | `gravity-band` **interpola** entre µg y 1 g | No se interpola: la Luna puede ser el peor caso; se marca como extrapolación |
| Resultado del laboratorio | Un límite y una curva, sin incertidumbre | Frontera con intervalo, nivel de evidencia y alertas ALR-01…09 |
| Validación | Constantes de tabla por material | Motor verificado contra Saffire, BASS-II, FLEX (38 pruebas) |
| Incidentes | "Confirmado" con archivos citados, pero 0 observaciones enlazadas | Lecciones con su fuente histórica |
| Spin-offs | Vinculan cada caso con un experimento sin fuente | Distingue transferencia documentada de aplicación posible |

Además: hay dos archivos de arranque (`api/main.py` y `api/app/main.py`), el segundo es el vigente.

## 6. Qué se integró

| Cambio | Detalle |
|---|---|
| Cliente del backend | `web/src/shared/lib/backend.ts`: solo servidor, con tiempo máximo y validación Zod. Si el backend no está, no responde o responde otra forma, devuelve `null` y el servicio sigue con su fuente |
| Variable `API_BASE_URL` | En `.env.example` y `.env.local`. Vacía o inalcanzable no cambia nada |
| Estado del servicio | `GET /api/health` informa `services.backend` (`ok`, `unreachable` o `not_configured`) y la versión del kernel |
| Mitos y hechos | Nueva pestaña en la Guía. Usa `GET /api/rules` del backend; si no está, la copia tipada en `web/src/content/myths.ts`. También expuesto como `GET /api/rules` en el frontend |

Verificado en ambos sentidos: con el backend encendido la Guía muestra el texto que sirve el
backend; con el backend apagado muestra las mismas cinco reglas desde el frontend.

## 7. Qué se conservó

Ambientes, investigaciones, ranking, comparador, cobertura, frontera de inflamabilidad, riesgo,
gotas, Radar, Tierra, lecciones, referencias y asistente siguen respondiendo desde los servicios
del frontend, sin cambios. Ninguna pantalla depende de que el backend esté levantado.

## 8. Ajustes necesarios para alinear ambos

Por orden de impacto:

1. **Subir o documentar `dataset_clean`.** Sin esa carpeta, ocho endpoints quedan vacíos y nueve pruebas fallan.
2. **Unificar el catálogo de ambientes.** Decidir una sola tabla de gravedad, O₂ y presión por
   ambiente (la del reto y del documento maestro) y que el backend la use.
3. **Acordar el contrato del laboratorio.** Para que `lab/simulate` pueda alimentar el mapa de
   inflamabilidad debe devolver frontera por flujo, intervalo, nivel de evidencia y alertas.
4. **Revisar `gravity-band`.** Interpolar entre µg y 1 g contradice la evidencia de que la
   gravedad lunar puede ser el peor caso.
5. **Añadir lo que falta:** gotas (ley d²), cadena evidencia → tecnología y fuentes con DOI.
6. **Adoptar el sobre común** (`data_mode`, `kind`, `value`, `interval`, `evidence_level`,
   `alerts`, `sources`) para que el frontend pueda consumir cada endpoint sin adaptadores.
7. **CORS:** incluir `http://localhost:3000` si alguna vez se llama desde el navegador (hoy el
   frontend llama desde su servidor y no lo necesita).

Cuando un endpoint del backend cumpla el contrato, conectarlo es añadir una llamada a
`backendFetch` en el servicio de esa feature; el respaldo queda como está.

## 9. Cómo levantar ambos

Backend, desde `api/`:

```bash
python -m venv .venv
```

```bash
.venv/Scripts/python -m pip install -r requirements.txt
```

```bash
.venv/Scripts/python -m uvicorn app.main:app --port 8000
```

Frontend, desde `web/`, con `API_BASE_URL=http://127.0.0.1:8000` en `.env.local`:

```bash
npm run dev
```
