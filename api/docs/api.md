# Contrato de API

Generado desde el propio FastAPI. No editar a mano.

## `GET /api/meta`
Entornos, pesos y materiales
Etiqueta: metadatos
- respuesta 200: MetaOut

## `POST /api/ingest`
Reconstruir la base desde DATASET_DIR
Etiqueta: metadatos
- respuesta 200: IngestOut

## `GET /api/findings`
Ranking por entorno
Etiqueta: hallazgos
- parametro `environment` en query tipo string requerido False
- parametro `min_rpi` en query tipo integer requerido False
- parametro `material` en query tipo [{'type': 'string'}, {'type': 'null'}] requerido False
- parametro `limit` en query tipo integer requerido False
- parametro `offset` en query tipo integer requerido False
- respuesta 200: array
- respuesta 422: HTTPValidationError

## `GET /api/matrix`
Matriz hallazgo x entorno
Etiqueta: hallazgos
- respuesta 200: MatrixOut

## `GET /api/provenance/{source_file}`
Fila cruda, banderas y calidad
Etiqueta: procedencia
- parametro `source_file` en path tipo string requerido True
- respuesta 200: ProvenanceOut
- respuesta 422: HTTPValidationError

## `POST /api/lab/simulate`
Contrafactual de atmosfera
Etiqueta: laboratorio
- cuerpo: LabIn
- respuesta 200: LabOut
- respuesta 422: HTTPValidationError

## `GET /api/incidents`
Revalidacion historica
Etiqueta: incidentes
- respuesta 200: array

## `GET /api/spinoffs`
Aplicaciones en Tierra
Etiqueta: beneficio terrestre
- respuesta 200: array

## `GET /api/export`
Informe de mision en md o json
Etiqueta: informe
- parametro `environment` en query tipo string requerido False
- parametro `format` en query tipo string requerido False
- respuesta 200: sin esquema
- respuesta 422: HTTPValidationError

## `GET /api/investigations`
Listado de experimentos
Etiqueta: investigaciones
- respuesta 200: array

## `GET /api/investigations/{clave}/variation`
Variables que cambian entre corridas
Etiqueta: investigaciones
- parametro `clave` en path tipo string requerido True
- respuesta 200: VariationOut
- respuesta 422: HTTPValidationError

## `GET /api/similarity`
Similitud entre experimentos
Etiqueta: comparacion
- parametro `minimo` en query tipo integer requerido False
- respuesta 200: array
- respuesta 422: HTTPValidationError

## `GET /api/hardware`
Arbol de facilidades y proyectos
Etiqueta: hardware
- respuesta 200: array

## `GET /api/gaps`
Celdas sin evidencia y brechas declaradas
Etiqueta: vacios
- respuesta 200: GapsOut

## `GET /api/oxygen-ladder`
Umbrales de material a lo largo del O2
Etiqueta: atmosfera
- respuesta 200: OxygenLadderOut

## `POST /api/lab/gravity-band`
Banda ug a 1 g
Etiqueta: laboratorio
- cuerpo: GravityBandIn
- respuesta 200: GravityBandOut
- respuesta 422: HTTPValidationError

## `GET /api/measurements`
Que se midio y con que
Etiqueta: sensores
- respuesta 200: MeasurementsOut

## `GET /api/findings/{clave}/context`
Paquete listo para un LLM
Etiqueta: interpretacion
- parametro `clave` en path tipo string requerido True
- parametro `environment` en query tipo string requerido False
- respuesta 200: ContextOut
- respuesta 422: HTTPValidationError

## `GET /api/rules`
Mitos y hechos de la guia oficial
Etiqueta: reglas
- respuesta 200: RulesOut

## `GET /api/facilities`
Instalaciones con masa y volumen
Etiqueta: hardware
- respuesta 200: FacilitiesOut

## `GET /api/fm2`
Payload lunar planificado
Etiqueta: atmosfera
- respuesta 200: Fm2Out

## `GET /api/incidents/{slug}/source`
Extracto del informe original
Etiqueta: incidentes
- parametro `slug` en path tipo string requerido True
- respuesta 200: IncidentSourceOut
- respuesta 422: HTTPValidationError

## `GET /health`
Estado del servicio
Etiqueta: metadatos
- respuesta 200: sin esquema
