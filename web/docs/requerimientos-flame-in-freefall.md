# Flame in Freefall: análisis de requerimientos del reto

**Versión 3.0**

| Versión | Cambio |
|---|---|
| 1.0 | Primera versión |
| 2.0 | Reescrita desde cero con base en el texto oficial del reto y la transcripción del video |
| 3.0 | Se agrega la problemática; se agregan enlaces directos a las fuentes; los modelos predictivos se replantean como recomendaciones; se retiran arquitectura, stack y proceso (van en documentos posteriores) |

**Alcance de este documento.** Analiza **qué busca el reto y qué debe hacer la solución**. No define arquitectura, stack tecnológico ni proceso de trabajo: eso se decide en documentos posteriores, una vez que el equipo lo acuerde (ver §12).

**Etiquetas de origen**

| Etiqueta | Significado |
|---|---|
| **[W]** | Texto oficial del reto |
| **[VID]** | Transcripción del video oficial |
| **[N]** | Documento de NASA verificado, con enlace |
| **[T]** | Conocimiento técnico de combustión; validar con el asesor |
| **[S]** | Supuesto o propuesta del equipo |

**Prioridad (MoSCoW):** **M** = imprescindible · **S** = debería · **C** = podría · **W** = no en esta versión.

---

## Enlaces esenciales

Los enlaces mínimos para empezar. En cada sección se dan los específicos.

| Para qué | Dónde ir |
|---|---|
| Leer el reto oficial y sus recursos | [Flame in Freefall en Space Apps](https://www.spaceappschallenge.org/2026/find-a-team/flame-in-freefall/) |
| Explorar los datos (fuente principal) | [Repositorio PSI: buscador de investigaciones](https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation) → filtrar por *Combustion Science* |
| Entender qué es PSI y a quién escribir | [PSI: historia, misión y contactos](https://science.nasa.gov/physical-sciences-informatics-psi/history-of-physical-science-informatics/) |
| Ver los experimentos de combustión de NASA y su hardware (CIR, MDCA) | [NASA Glenn: Combustion Science](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science) |
| Buscar reportes técnicos y artículos de NASA | [NTRS: NASA Technical Reports Server](https://ntrs.nasa.gov) |

---

## Índice

1. [Problemática](#1-problemática)
   - 1.1 Contexto
   - 1.2 Problema central
   - 1.3 Causas
   - 1.4 Por qué es urgente ahora
   - 1.5 Consecuencias de no resolverlo
   - 1.6 Enunciado del problema
   - 1.7 Qué espera NASA de la solución
2. [Análisis de las fuentes](#2-análisis-de-las-fuentes)
   - 2.1 Núcleo del reto
   - 2.2 Lo que aporta el video
   - 2.3 Correcciones a la transcripción
   - 2.4 Usuarios objetivo y casos de uso
   - 2.5 Alcance, exclusiones y restricciones
3. [Entornos y ámbitos de análisis](#3-entornos-y-ámbitos-de-análisis)
4. [Fuentes de datos e insumos](#4-fuentes-de-datos-e-insumos)
5. [Física del fuego aplicada](#5-física-del-fuego-aplicada)
6. [Modelos predictivos recomendados](#6-modelos-predictivos-recomendados)
7. [Sistema de alertas y visualización](#7-sistema-de-alertas-y-visualización)
8. [Gestión del conocimiento e IA](#8-gestión-del-conocimiento-e-ia)
9. [Requerimientos funcionales](#9-requerimientos-funcionales)
10. [Requerimientos no funcionales](#10-requerimientos-no-funcionales)
11. [Trazabilidad con los criterios de evaluación](#11-trazabilidad-con-los-criterios-de-evaluación)
12. [Fuera del alcance de este documento](#12-fuera-del-alcance-de-este-documento)
13. [Supuestos y puntos abiertos](#13-supuestos-y-puntos-abiertos)

---

## 1. Problemática

### 1.1 Contexto

- Un incendio en una nave es un peligro catastrófico: la tripulación no puede evacuar ni volver rápido a la Tierra. [W][N]
- La historia lo confirma: Apollo 1 (tripulación fallecida en un incendio en atmósfera de oxígeno), Apollo 13 (explosión de un tanque de oxígeno), el incendio de Mir (falla de un generador de oxígeno) y la alarma de humo de Artemis II. [W]
- La estrategia de NASA se organiza en **prevención, detección y supresión**. [W]
- Durante décadas, NASA ha estudiado cómo arde el fuego en microgravedad con torres de caída, vuelos parabólicos, cohetes sonda, vuelos suborbitales y la ISS. [VID]

### 1.2 Problema central

> NASA tiene décadas de datos de combustión en baja gravedad en PSI (24 investigaciones, 12 TB), pero **están dispersos, son heterogéneos y difíciles de interpretar**. Por eso no se traducen con facilidad en **decisiones de diseño** de seguridad contra incendios para las próximas misiones. [W][VID]

En palabras del reto: los resultados son *difíciles de encontrar, más difíciles de comparar y aún más difíciles de interpretar*. [W]

### 1.3 Causas

| Causa | Detalle | Origen |
|---|---|---|
| Volumen | 24 investigaciones y 12 TB solo en combustión | [VID] |
| Heterogeneidad | Combustibles sólidos, líquidos y gaseosos; hardware distinto (CIR, MDCA, MSG, Cygnus); variables y unidades distintas | [W] |
| Dispersión | Los resultados están repartidos entre carpetas por muestra, documentos y publicaciones con DOI | [VID] |
| Física contraintuitiva | Sin flotación el fuego se comporta distinto; la intuición terrestre falla | [W][VID] |
| Requiere experto | Interpretar los datos exige conocimiento de combustión que el diseñador no siempre tiene | [VID] |

### 1.4 Por qué es urgente ahora

| Factor | Implicación | Origen |
|---|---|---|
| Regreso a la Luna para quedarse | Hábitats y rovers de larga duración | [VID] |
| Atmósfera lunar con más O₂ (≥30 %) y menos presión (≤10,2 psi) | Más de 40 % de aumento en la fracción de O₂: los materiales se vuelven mucho más inflamables | [W] |
| No hay datos de gravedad parcial en PSI | No se puede consultar directamente qué pasa en la Luna o Marte | [W] |
| El ensayo estándar de materiales se hace en 1 g | NASA-STD-6001 usa un ensayo de propagación en 1 g que algunos investigadores consideran no conservador en baja gravedad | [N] [NASA Glenn](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science) |
| La gravedad lunar podría ser el peor caso | Algunos materiales tienen límites de flamabilidad más amplios en gravedad lunar que en la Tierra: hay flujo suficiente para traer oxígeno, pero no tanto como para enfriar la llama | [N] [FM2, NTRS](https://ntrs.nasa.gov/citations/20240015307) |
| Diseño basado en 1 g | Por la falta de datos, los diseñadores han basado detección, supresión y propagación en el entendimiento en 1 g | [N] [NTRS](https://ntrs.nasa.gov/citations/20150000894) |
| Detectores de origen terrestre | Los detectores actuales de las naves se diseñaron con criterios terrestres | [N] [NTRS](https://ntrs.nasa.gov/citations/20170007283) |

### 1.5 Consecuencias de no resolverlo

| Pilar | Consecuencia |
|---|---|
| Prevención | Aprobar materiales que pasan en 1 g pero arden en la Luna o en microgravedad |
| Detección | Detectores que reaccionan tarde o mal al humo en baja gravedad |
| Supresión | Agentes o cantidades de agente mal dimensionados; según NASA, la velocidad de crecimiento del fuego define el tiempo de detección y el agente requerido [N] [Saffire VI](https://ntrs.nasa.gov/api/citations/20240007488/downloads/Saffire%20ICES%202024%20Saffire%20presentation072124small.pdf) |
| Investigación | Datos públicos subutilizados; se repiten preguntas que ya tienen respuesta |

### 1.6 Enunciado del problema

> **Ingenieros e investigadores que diseñan hábitats, naves y rovers para la Luna y Marte no pueden aprovechar con rapidez la evidencia experimental de NASA sobre combustión en baja gravedad, porque está dispersa, es heterogénea y exige conocimiento experto para interpretarla. Por eso, las decisiones de materiales, atmósfera, detección y supresión se siguen apoyando en criterios terrestres que podrían no ser conservadores fuera de la Tierra.**

### 1.7 Qué espera NASA de la solución

| NASA necesita | La solución debe | Origen |
|---|---|---|
| Encontrar | Identificar las investigaciones relevantes para cada ambiente habitable (O1) | [W] |
| Comparar | Mostrar similitudes y diferencias entre investigaciones | [W] |
| Interpretar | Extraer datos útiles para modelos predictivos de flamabilidad (O2) | [W] |
| Decidir | Destacar investigación que informe controles y equipos de próxima generación (O3); en el video, protocolos, diseño de supresión y screening de materiales | [W][VID] |
| Transferir | Mostrar aplicaciones en la Tierra | [W] |

**Lo que NO es el problema:** detectar incendios reales en tiempo real, monitorear incendios forestales ni estudiar cohetes y propelentes. [W]

---

## 2. Análisis de las fuentes

### 2.1 Núcleo del reto

| Elemento | Contenido | Origen |
|---|---|---|
| Entregable | Dashboard web interactivo con IA (*SI-powered*) que resume, ordena e interpreta | [W][VID] |
| Diferencia física | La vela pasa de gota parpadeante a esfera azul que depende de la difusión | [W][VID] |
| Prevención | Control de ignición y selección de materiales según límites de flamabilidad | [W] |
| Variables críticas | Concentración de O₂ y flujo de aire | [W] |
| Flamabilidad de sólidos | BASS, BASS-II, Saffire-I/II/III | [W] |
| Detección | SAME, SAME-R | [W] |
| Supresión | FLEX, por dilución con CO₂ y helio | [W] |
| O₂ más alto ensayado | CFI-G: hasta 85 % O₂, llama "de adentro hacia afuera" | [W] |
| Proxy de gravedad parcial | E-FIELD Flames: el campo eléctrico actúa sobre los iones de la llama | [W][VID] |
| Datos futuros | LUCI y FM2 aportarán datos de gravedad parcial | [W] |
| Hipótesis del reto | 0 g y 1 g *podrían* acotar lo que pasa en gravedad intermedia | [W] (ver §5.5) |
| Atributos a mostrar | Objetivos, combustibles (forma y tamaño), condiciones (O₂, flujo), variables entre pruebas, sensores, similitudes y diferencias | [W] |

### 2.2 Lo que aporta el video

| Aporte | Implicación |
|---|---|
| Los datos deben servir para **protocolos, diseño de supresión y screening de materiales** | El módulo O3 se organiza por esos tres destinos |
| El O₂ alto en la Luna reduce el riesgo de descompresión y permite **EVA más frecuentes** | La vista lunar explica el compromiso, no solo el riesgo |
| Cambian **ignición, propagación y extinción** | Tres dimensiones de análisis |
| Plataformas: torres de caída, vuelo parabólico, cohetes sonda, suborbitales, ISS | Filtro por plataforma |
| Ejemplos visuales: vela, E-FIELD, acrílico en BASS-II, quemador poroso del BRE | Referencias para la visualización |
| PSI: 6 áreas; combustión con 24 investigaciones y 12 TB; una carpeta por muestra; publicaciones con DOI | Ingesta selectiva y citas por DOI |
| Público: investigadores e ingenieros | Lenguaje técnico y exportación de datos |

### 2.3 Correcciones a la transcripción

| Transcripción | Lectura correcta |
|---|---|
| `psi.mnasa.gov` | `psi.nasa.gov` |
| "conduction investigations" | combustion investigations |
| "the bins" | the bends (enfermedad por descompresión) |
| "carrying the suit upwards" | carrying the soot upwards (hollín) |
| "sfree" | spherical |
| "e-ill flames" | E-FIELD Flames |
| "best two microraph" | BASS-II |
| "B gaseous burner" | BRE (Burning Rate Emulator) |
| "protective closing" | protective clothing |
| Nombres de ponentes | Distorsionados; verificar antes de citar |

### 2.4 Usuarios objetivo y casos de uso

| Usuario [W] | Pregunta típica |
|---|---|
| Ingeniero aeroespacial | "¿Qué materiales tienen evidencia de arder a 30 % O₂ con flujo bajo?" |
| Investigador | "¿Qué variables midió FLEX y cuáles faltan para modelar la extinción?" |
| Estudiante de posgrado | "¿Qué brechas hay en gravedad parcial?" |
| Estudiante de pregrado | "¿Por qué la llama es esférica en microgravedad?" |
| Diseñador de equipos | "¿Qué evidencia respalda un supresor por dilución?" |

### 2.5 Alcance, exclusiones y restricciones

| Dentro | Fuera |
|---|---|
| Las 24 investigaciones de combustión de PSI | Cohetes y propelentes [W] |
| Contexto técnico de NASA para interpretarlas | Detección real de incendios con sensores |
| Interpretación por ambiente habitable | Predicciones cuantitativas en gravedad parcial presentadas como hechos |
| Transferencia tecnológica a la Tierra | Monitoreo de incendios forestales |

**Restricción del evento:** la página oficial del reto pide no empezar a trabajar en el proyecto antes de que comience el hackathon. [N] [Página del reto](https://www.spaceappschallenge.org/2026/find-a-team/flame-in-freefall/)

---

## 3. Entornos y ámbitos de análisis

### 3.1 Catálogo de ambientes

| Ambiente | Gravedad | Presión | O₂ | ppO₂ | Evidencia en PSI |
|---|---|---|---|---|---|
| Tierra (referencia) | 1 g | 14,7 psi [W] | 20,9 % | 3,07 psi | Ensayos de tierra |
| ISS | ~0 g | ~14,7 psi [S] | ~21 % [S] | ~3,1 psi | **Directa** |
| Nave en tránsito | ~0 g | ~14,7 psi [S] | ~21 % [S] | ~3,1 psi | Directa |
| Base lunar (valores del reto) | 0,165 g | ≤10,2 psi [W] | ≥30 % [W] | ~3,06 psi | **Ninguna directa** [W] |
| Atmósfera de exploración (SEA) | variable | 8,2 psi [N] | 34 % [N] | ~2,8 psi | Ninguna directa |
| Rover presurizado | 0,165 g | ≤10,2 psi [W] | ≥30 % [W] | ~3,06 psi | Ninguna directa; volumen pequeño |
| Base marciana | 0,38 g | No definida | No definida | — | Ninguna |
| Traje (cota superior) | variable | 4,3 psi [W] | 100 % [W] | 4,3 psi | Fuera del alcance directo |

La atmósfera SEA (34 % O₂ a 8,2 psia) es una de las que FM2 replicará en la Luna, junto con aire a 14,7 psia. [N] [FM2, NTRS](https://ntrs.nasa.gov/citations/20240015307)

**Requisito:** el usuario puede editar O₂, presión y flujo dentro de cada ambiente; la plataforma recalcula ppO₂ y avisa si sale del rango de los datos.

### 3.2 El ambiente como selector de contexto [S]

Al elegir un ambiente cambian a la vez: el ranking de investigaciones, el índice de riesgo, las alertas, la visualización de la llama, el contexto del asistente y el mapa de brechas.

### 3.3 Niveles de evidencia

| Nivel | Definición | Ejemplo |
|---|---|---|
| **A · Directa** | Mismo régimen de gravedad y atmósfera, dentro del rango ensayado | BASS-II para la ISS |
| **B · Análoga** | Régimen similar con otro material o escala | Saffire para un material no ensayado |
| **C · Proxy** | Mecanismo sustituto | E-FIELD para gravedad parcial |
| **D · Extrapolación** | Fuera del rango de los datos | Valores numéricos para Marte |
| **∅ · Sin evidencia** | Nada lo respalda | Se muestra así; nunca como "riesgo bajo" |

---

## 4. Fuentes de datos e insumos

### 4.1 Fuente primaria: PSI

**Dónde:** [Buscador de investigaciones PSI](https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation) → filtrar por *Combustion Science*.

Cómo está organizado, según el video [VID]:

| Elemento | Qué contiene | Uso |
|---|---|---|
| Página de cada investigación | Resumen con objetivos y enfoque | Fichas, ranking, asistente |
| Carpetas a la izquierda | Datos científicos y documentos | Tablas, documentos de apoyo |
| *Data files and documents* | Una subcarpeta por muestra ensayada | Datos por prueba, imágenes, video |
| Publicaciones (en azul) | DOI que lleva al artículo completo o al resumen | Hallazgos y citas |

**Contacto de PSI** para dudas de acceso: `msfc-psi-help@mail.nasa.gov`. [N] [PSI](https://science.nasa.gov/physical-sciences-informatics-psi/history-of-physical-science-informatics/)

**Reglas de uso [S]:** no descargar los 12 TB; priorizar resúmenes, documentos y tablas; descargar imágenes o video solo de muestras seleccionadas.

### 4.2 Inventario de investigaciones según las fuentes

| Investigación | Combustible | Hardware [W] | Pilar | Referencia de apoyo |
|---|---|---|---|---|
| BASS / BASS-II | Sólidos y gases | MSG, ducto de flujo de SPICE | Prevención, supresión | PSI |
| Saffire-I / II / III | Sólidos a escala de nave | Nave Cygnus sin tripulación [N] | Prevención | [Objetivos (NTRS)](https://ntrs.nasa.gov/citations/20170001636) · [Resultados (NTRS)](https://ntrs.nasa.gov/citations/20170008805) |
| SAME / SAME-R | Humo | No indicado | Detección | [Detección en naves (NTRS)](https://ntrs.nasa.gov/citations/20170007283) |
| DAFT / DAFT-2 | Polvo | Instrumento de SAME | Detección (indirecta) | PSI |
| FLEX | Gotas líquidas | MDCA en CIR | Supresión | [Resultados detallados FLEX (NTRS)](https://ntrs.nasa.gov/api/citations/20150023456/downloads/20150023456.pdf) |
| FLEX-2 | Gotas líquidas | MDCA en CIR | Fundamental | PSI |
| CFI | Gotas, llamas frías | MDCA en CIR | Fundamental | PSI |
| ACME (proyecto) | Gases | Módulos ACME en CIR | Varios | [ACME (NASA Science)](https://science.nasa.gov/biological-physical/investigations/acme/) |
| ACME BRE | Gases que emulan materiales | ACME en CIR | Prevención | [BRE (NASA Science)](https://science.nasa.gov/biological-physical/investigations/bre/) |
| ACME CFI-G | Gases, hasta 85 % O₂ | ACME en CIR | Prevención (O₂ alto) | PSI |
| ACME E-FIELD Flames | Gases con campo eléctrico | ACME en CIR | Proxy de gravedad parcial | PSI |
| ACME s-Flame y otros | Gases | ACME en CIR | Fundamental | [s-Flame (NASA Science)](https://science.nasa.gov/biological-physical/investigations/s-flame) |
| SPICE | Gas, punto de humo | MSG | Fundamental | PSI |
| SLICE | Gas, desprendimiento de llama | MSG | Fundamental | PSI |
| Resto hasta 24 | — | — | — | Identificar en PSI |

Para cualquier investigación de la ISS: [Space Station Research Explorer](https://www.nasa.gov/mission/station/research-explorer/).

### 4.3 Fuentes NASA complementarias

| Fuente | Para qué |
|---|---|
| [NTRS](https://ntrs.nasa.gov) | Buscar reportes por nombre de investigación |
| [NASA-STD-6001](https://standards.nasa.gov/standard/nasa/nasa-std-6001) | Norma de ensayo de flamabilidad de materiales (Test 1: propagación hacia arriba en 1 g) |
| [FM2 (NASA Glenn)](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/) | Futuro experimento en la superficie lunar; atmósferas objetivo |
| [LUCI (NTRS)](https://ntrs.nasa.gov/citations/20250010653) | Ensayos en gravedad lunar simulada en cohete suborbital (no está en PSI) |
| [Extintor de agua nebulizada (NASA Spinoff)](https://spinoff.nasa.gov/node/11065) | Caso de transferencia a la Tierra para la vista Tierra |

### 4.4 Evaluación de APIs satelitales y ambientales

| Fuente | ¿Sirve al reto? | Veredicto |
|---|---|---|
| NASA FIRMS (focos de calor) | No: incendios forestales en 1 g, dominados por flotación y viento | **No incluir** |
| Copernicus (EFFIS, CAMS) | No | No incluir |
| NOAA (humo, meteorología) | No | No incluir |
| Constantes planetarias (g lunar y marciana) | Sí | Valores fijos, sin API |

**Por qué.** Los ambientes del reto son **atmósferas internas** de naves y hábitats, fijadas por ingeniería. El vínculo con la Tierra que pide el reto es la **transferencia tecnológica** (nebulizadores, detección, equipo de bomberos), no el monitoreo de incendios. Mezclar datos satelitales con PSI resta en uso riguroso de datos.

### 4.5 Licencias y citación

| Material | Regla |
|---|---|
| Datasets PSI | Citar el DOI de cada investigación; verificar la licencia de cada una |
| Reportes NTRS | Revisar el campo *Copyright* de cada registro |
| Artículos de revista | Texto completo solo si es acceso abierto; si no, DOI y resumen propio |
| Imágenes y video de PSI | Citar DOI; verificar licencia |
| Logo de NASA | No usar ni sugerir aval |

---

## 5. Física del fuego aplicada

### 5.1 Principios que el producto debe reflejar

| Principio | Enunciado | Origen |
|---|---|---|
| Sin flotación | En ~0 g el aire caliente no sube; el O₂ llega por difusión o ventilación | [W][VID] |
| Llama esférica | Esférica, azul, sin parpadeo; en 1 g la flotación arrastra el hollín y la llama se ve amarilla | [VID] |
| Tres fases | Cambian ignición, propagación y extinción | [VID] |
| Ventilación decisiva | El flujo de aire importa mucho en microgravedad | [W] |
| Curva en "U" | Con flujo muy bajo la llama pierde calor y se apaga; con flujo moderado se alimenta; con flujo alto se apaga por soplado | [T] |
| Opuesta vs. concurrente | La llama avanza contra el flujo o a favor de él; Saffire ensayó ambas | [N] [NTRS](https://ntrs.nasa.gov/citations/20170008805) |
| Escala | El comportamiento depende de la escala; los ensayos a escala real son necesarios | [N] [NTRS](https://ntrs.nasa.gov/citations/20170008805) |
| Ley d² (gotas) | d² = d₀² − K·t | [T] |
| Llamas frías | En FLEX, tras apagarse la llama visible en gotas grandes de heptano, siguió una llama fría | [N] [NASA SVS](https://svs.gsfc.nasa.gov/11318) |
| Dilución | CO₂ y He suprimen el fuego | [W] |
| Detección temprana | En una nave, el objetivo de detección son los productos de pirólisis, antes que el hollín | [N] [NTRS](https://ntrs.nasa.gov/citations/20170007283) |

### 5.2 Variables de control

| Variable | Símbolo | Unidad sugerida |
|---|---|---|
| Fracción de O₂ | XO₂ | 0–1 |
| Presión total | P | kPa (mostrar psi) |
| Presión parcial de O₂ | ppO₂ = XO₂·P | kPa |
| Velocidad de flujo | u | cm/s |
| Gravedad | g | múltiplos de g₀ |
| Material o combustible | — | catálogo |
| Forma y tamaño de muestra | — | mm |
| Diluyentes | XCO₂, XHe | 0–1 |

### 5.3 Comportamiento por familia de combustible

| Familia | Investigaciones | Fenómenos clave | Destino |
|---|---|---|---|
| Sólidos | BASS, BASS-II, Saffire | Propagación, límites de O₂, espesor, flujo, fusión del acrílico | **Prevención** (materiales) |
| Líquidos | FLEX, FLEX-2, CFI | Ley d², extinción, llamas frías | **Supresión** |
| Gases | ACME, SPICE, SLICE | Emulación de materiales, O₂ alto, proxy de flotación, hollín | Flamabilidad fundamental |
| Humo y polvo | SAME, SAME-R, DAFT | Firma del humo y del polvo | **Detección** |

### 5.4 Oxígeno y presión: el caso lunar

| Atmósfera | O₂ | Presión | ppO₂ |
|---|---|---|---|
| Tierra | 20,9 % | 14,7 psi | 3,07 psi |
| Base lunar (reto) | 30 % | 10,2 psi | 3,06 psi |
| SEA | 34 % | 8,2 psi | 2,79 psi |
| Traje | 100 % | 4,3 psi | 4,3 psi |

- La tripulación respira casi la misma ppO₂ que en la Tierra. [T]
- La **fracción** de O₂ sube más de 40 %, y eso vuelve a los materiales mucho más inflamables. [W]

**Requisito:** la vista lunar explica que respirar igual no significa arder igual.

### 5.5 Gravedad parcial: tratamiento obligatorio

- El reto sugiere que 0 g y 1 g **podrían acotar** el comportamiento intermedio. [W]
- NASA reporta lo contrario para algunos materiales: en gravedad lunar los límites de flamabilidad **se amplían** frente a la Tierra. Es una "zona Ricitos de Oro": la flotación aporta oxígeno fresco pero enfría poco la llama. [N] [FM2, NTRS](https://ntrs.nasa.gov/citations/20240015307) · [Hipótesis de NASA Glenn (NTRS)](https://ntrs.nasa.gov/citations/20210020516)

**Requisitos:**

1. **RF-FIS-01 (M):** no interpolar entre 0 g y 1 g sin aviso visible.
2. **RF-FIS-02 (M):** en ambientes lunares y marcianos, usar el límite más conservador disponible y declarar evidencia C o D.
3. **RF-FIS-03 (S):** tarjeta "¿Por qué la Luna puede ser peor que la ISS y que la Tierra?", con los enlaces anteriores.

---

## 6. Modelos predictivos recomendados

### 6.1 Lógica general

Las tablas de PSI son **pequeñas** (cientos de pruebas, no millones), tienen **pocas variables** y vienen de **campañas experimentales**. Por eso conviene:

- **Modelos simples e interpretables** (regresión, regresión logística, árboles pequeños) apoyados en física conocida. Deep learning no aporta con tan pocos datos y no se puede explicar al jurado.
- **Validar por grupos** (por campaña o muestra), no mezclando pruebas al azar, porque las pruebas de una misma campaña se parecen y eso infla los resultados.
- **Mostrar siempre la incertidumbre** y avisar cuando la consulta sale del rango de los datos.
- **Comparar con una regla física simple.** Si el modelo no le gana a la física, se dice.

### 6.2 Qué modelo para qué necesidad

| # | Lo que pide el reto | Lo que hay en los datos | Modelo recomendado | Variables | Qué se visualiza | Qué entiende el público |
|---|---|---|---|---|---|---|
| 1 | **Supresión:** ¿cuánto diluyente apaga una llama? | FLEX: gotas en atmósferas con distinto O₂, CO₂, He y presión | **Regresión** de la velocidad de quemado (K) apoyada en la ley d², más **clasificación** del modo de extinción | O₂, CO₂, He, presión, combustible, tamaño de gota | Mapa O₂ vs. diluyente con zonas "arde / se apaga" y curva de la gota encogiéndose | Cuánto CO₂ o He hace falta y por qué funciona |
| 2 | **Prevención:** ¿qué material arde en qué atmósfera y flujo? | BASS, BASS-II, Saffire: material, O₂, flujo, dirección de flujo, propagación | **Correlación física de propagación** ajustada a los datos + **clasificación** "arde / no arde" | Material, espesor, O₂, velocidad y dirección de flujo | **Mapa de flamabilidad** O₂ vs. flujo con la curva en "U" y un punto que marca la cabina elegida | Que el aire casi quieto de una cabina puede ser el peor caso; cuánto margen hay |
| 3 | **O₂ alto lunar:** ¿cambia el tipo de llama? | CFI-G: hasta 85 % O₂ | **Clasificación** del régimen de llama (fría, caliente, extinción) | O₂, combustible, presión | Diagrama de regímenes con marcas en 30 % y 34 % O₂ | Que más O₂ cambia cómo arde y puede reavivar una llama |
| 4 | **Detección:** ¿qué humo produce cada material? | SAME, SAME-R: humo de materiales de nave | **Agrupamiento** de firmas de humo + estadística descriptiva | Material, condiciones de calentamiento, tamaño de partícula | Perfiles de humo por material frente al rango que detecta cada tipo de detector | Por qué un detector terrestre puede no bastar |
| 5 | **Relevancia (O1):** ¿qué investigación aplica a mi ambiente? | Metadatos y documentos de las 24 | **Puntaje multicriterio** con pesos visibles + **búsqueda semántica** sobre textos | Atmósfera, gravedad, combustible, pilar, escala, datos disponibles | Ranking con barras desglosadas por criterio | Por qué una investigación aplica y otra no |
| 6 | **Riesgo integrado:** ¿qué tan cerca estoy del límite? | Límites de O₂ por material tomados de publicaciones | **Índice basado en reglas físicas**, no aprendizaje automático (§6.3) | Ambiente, material, flujo | Semáforo con margen y nivel de evidencia | Riesgo en una mirada, con su respaldo |
| 7 | **Gravedad parcial:** ¿qué pasa en la Luna? | No hay datos en PSI; E-FIELD como proxy | **Análisis de escenarios**, no predicción | Gravedad | Banda sombreada "sin datos" con el peor caso posible marcado | Que es una brecha real y qué misión la cerrará |

**Prioridad sugerida:** 2 y 6 (prevención, el núcleo del reto) → 1 (supresión, los datos más ricos) → 5 (ranking, O1) → 3 → 4 → 7. La factibilidad final depende de las columnas reales de cada tabla (punto abierto A2).

### 6.3 Índice de riesgo de flamabilidad

No es una probabilidad de incendio. Es una **regla física con datos citados**:

1. Se toma el límite de O₂ conocido del material para ese régimen de gravedad y flujo (de una publicación con DOI).
2. Se compara con el O₂ del ambiente: **margen = O₂ del ambiente − límite del material**.
3. En gravedad parcial se usa el límite más bajo conocido menos un margen de seguridad (§5.5).
4. Si no hay límite conocido, el resultado es **"sin evidencia"**, nunca "bajo".

| Parámetro | Valor inicial [S] |
|---|---|
| Banda de precaución | 2 puntos de O₂ |
| Margen extra en gravedad parcial | 2–4 puntos de O₂ |

Ambos los valida el asesor.

### 6.4 Reglas de comunicación

- Cada predicción muestra intervalo, nivel de evidencia y DOI.
- Prohibido decir "predice el fuego en la Luna". Correcto: "extrapolación desde datos en 0 g y 1 g, sin validación en gravedad parcial".
- Cada modelo tiene una **ficha** visible: datos usados, cómo se validó, en qué rango es válido y qué no puede responder.

---

## 7. Sistema de alertas y visualización

### 7.1 Qué significa "alarma" en este reto

El dashboard no recibe datos de sensores. Las alertas son de **análisis**:

| Tipo | Qué indica |
|---|---|
| **Riesgo** | La configuración está cerca o por encima del límite de flamabilidad |
| **Evidencia** | Lo mostrado es proxy, extrapolación o no tiene datos |
| **Dominio** | La consulta sale del rango de los datos |
| **Fenómeno** | Riesgo propio de la baja gravedad (llama fría, flujo bajo, ensayo en 1 g no conservador) |

**Simulador de escenario (C):** el usuario mueve O₂, flujo o diluyente y ve cambiar el nivel, la llama y las alertas. Es la forma más clara de mostrar el "sistema de alarmas" en un demo corto.

### 7.2 Disparadores

| ID | Condición | Nivel | Mensaje de ejemplo |
|---|---|---|---|
| ALR-01 | Margen ≥ 0 | Alto | "El O₂ supera el límite medido para este material" |
| ALR-02 | Margen dentro de la banda de precaución | Precaución | "A menos de 2 puntos del límite" |
| ALR-03 | O₂ ≥ 30 % | Información | "Fracción de O₂ más de 40 % mayor que la terrestre" |
| ALR-04 | Gravedad entre 0 y 1 g | Evidencia | "Sin datos PSI en gravedad parcial; NASA reporta que podría ser el peor caso" |
| ALR-05 | Material sin límite conocido | Sin evidencia | "Sin evidencia para este material" |
| ALR-06 | Flujo en la zona de mayor flamabilidad | Precaución | "Flujo cercano al de mayor flamabilidad en microgravedad" |
| ALR-07 | Combustible líquido o gaseoso con O₂ alto | Fenómeno | "Posible llama fría tras apagarse la visible: riesgo de reignición" |
| ALR-08 | Material evaluado solo en 1 g | Fenómeno | "El ensayo en 1 g podría no ser conservador en baja gravedad" |
| ALR-09 | Consulta fuera de rango | Dominio | "Fuera del rango de los datos en: {variable}" |

Cada alerta muestra **por qué se disparó** y **qué fuente la respalda**.

### 7.3 Semántica visual

| Nivel | Color | Ícono |
|---|---|---|
| Bajo | Verde | ✓ |
| Precaución | Ámbar | ! |
| Alto | Rojo | ▲ |
| Sin evidencia | Gris rayado | ∅ (**nunca verde**) |
| Extrapolación | Borde punteado | ~ |

Siempre color, ícono y texto juntos.

### 7.4 Representación visual de la llama

Animación con la etiqueta **"representación cualitativa"**:

| Condición | Cómo se ve | Origen |
|---|---|---|
| 1 g | Gota alargada, amarilla, parpadeante | [VID] |
| ~0 g | Esfera azul, estable | [W][VID] |
| Gravedad parcial | Forma intermedia con marca de extrapolación | [S] |
| Campo eléctrico | Vuelve a forma de gota en 0 g | [VID] |
| Más O₂ | Más brillante y rápida | [T] |
| Flujo forzado | Inclinada aguas abajo; opuesta o concurrente | [N] |
| Sólido | Frente que avanza sobre la muestra | [S] |
| Acrílico | Burbujas de fusión | [VID] |
| Gota líquida | Esfera que se encoge | [T] |
| Gas | Quemador poroso (BRE) o esférico (CFI-G) | [W][VID] |

**Evidencia real al lado (S):** fotogramas o video de la muestra en PSI, con DOI. Ver la animación junto al experimento real refuerza la credibilidad.

### 7.5 Vista de detección

| Elemento | Contenido |
|---|---|
| Por material | Firma del humo medida en SAME y SAME-R |
| Interpretación | Qué tipo de detector responde mejor, con publicación de respaldo |
| Relación con DAFT | Mismo instrumento aplicado a polvo [W]; posible relevancia para polvo lunar [S, verificar] |
| Brecha | Detección en gravedad parcial y con polvo: sin datos |

---

## 8. Gestión del conocimiento e IA

### 8.1 Qué debe hacer el asistente

| Capacidad | Detalle |
|---|---|
| Responder con evidencia | Cada afirmación cita la investigación PSI y el DOI |
| Usar el contexto | Toma el ambiente seleccionado (ISS, base lunar, etc.) |
| Abstenerse | Si no hay evidencia, lo dice y sugiere dónde buscar |
| Responder números exactos | Preguntas como "¿qué rango de O₂ se ensayó en FLEX?" se responden desde las tablas, no desde el texto |
| Bilingüe | Responde en el idioma del usuario aunque el corpus esté en inglés |
| Declarar evidencia | Marca el nivel A, B, C, D o sin evidencia |

### 8.2 Corpus (qué documentos consolidar)

| Capa | Documentos | Dónde |
|---|---|---|
| Reto | Texto oficial y transcripción del video | [Página del reto](https://www.spaceappschallenge.org/2026/find-a-team/flame-in-freefall/) |
| Resúmenes PSI | Objetivos y enfoque de las 24 investigaciones | [PSI](https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation) |
| Documentos PSI | Reportes y descripciones de cada investigación | PSI → carpetas de cada investigación |
| Publicaciones | Acceso abierto completo; el resto, DOI y resumen propio | Enlaces DOI dentro de PSI |
| Reportes NASA | Saffire, FLEX, FM2, LUCI, detección | [NTRS](https://ntrs.nasa.gov) |
| Fichas NASA | Descripciones de experimentos | [Space Station Research Explorer](https://www.nasa.gov/mission/station/research-explorer/) |
| Conclusiones del equipo | Fichas estructuradas y diccionario de datos | Generadas por el equipo |

### 8.3 Estrategia de consolidación

1. **Reunir** los documentos de la tabla anterior con su DOI o enlace de origen.
2. **Extraer** el texto y separarlo por secciones.
3. **Etiquetar** cada fragmento con investigación, DOI, tipo de documento, pilar, combustible y ambiente.
4. **Indexar** para búsqueda por significado y por palabras clave.
5. **Versionar** el corpus para que cualquier respuesta se pueda reproducir.

### 8.4 Opciones técnicas candidatas

> **Supuesto.** Esta tabla es solo una referencia para la discusión. El equipo aún no ha acordado el stack; se decide en el documento de arquitectura.

| Requisito del usuario | Opción candidata | Por qué encaja |
|---|---|---|
| Base de datos serverless y open source | Postgres serverless con la extensión `pgvector` | Guarda datos y vectores en un solo lugar |
| Lo más sencillo posible | Base vectorial embebida en archivo (LanceDB) | Sin servidor que mantener |
| Embeddings open source | Modelos pequeños multilingües | Baratos y reproducibles |
| NotebookLM | Sirve para que el **equipo** estudie el corpus; no es open source ni tiene API para integrarlo al producto | — |

### 8.5 Cómo saber si funciona

| Prueba | Meta [S] |
|---|---|
| 30–50 preguntas con respuesta y DOI esperados, revisadas por el asesor | ≥90 % de citas válidas |
| 10 preguntas sin respuesta en el corpus (ej. combustión en Marte) | ≥80 % de abstención correcta |
| 10 preguntas numéricas | Respuesta exacta |

---

## 9. Requerimientos funcionales

### A. Selector de ambiente

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-AMB-01 | Elegir ambiente del catálogo §3.1 | M | Cambian ranking, riesgo, alertas, llama y asistente |
| RF-AMB-02 | Modo personalizado (O₂, presión, flujo, gravedad) | S | ppO₂ recalculada; aviso fuera de rango |
| RF-AMB-03 | Recorrido visual por ambientes | C | Solo si funciona como selector, no como decoración |

### B. Fichas, ranking y comparador (O1)

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-INV-01 | Ficha por investigación: objetivo, combustible, condiciones, variables, sensores, hardware, plataforma, hallazgos, pilar, ambientes, limitaciones | M | 24 fichas con fuente por campo |
| RF-RNK-01 | Ranking por ambiente y pilar con pesos visibles y ajustables | M | Cada puntaje muestra su desglose |
| RF-RNK-02 | Justificación generada por IA para el top 5 | S | Con DOI |
| RF-CMP-01 | Comparar 2–4 investigaciones lado a lado | M | Similitudes y diferencias resaltadas [W] |
| RF-CMP-02 | Matriz de cobertura variable × investigación | M | Huecos visibles |

**Criterios del ranking [S]:** similitud de atmósfera, similitud de combustible, pilar, escala, disponibilidad de datos y régimen de gravedad.

### C. Datos e interpretación (O2)

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-DAT-01 | Tablas consolidadas con unidades armonizadas | M | Se conserva el dato original |
| RF-DAT-02 | Gráficos exploratorios | M | Filtros por investigación y ambiente |
| RF-DAT-03 | Exportar datos con DOI | S | Descarga con referencias |
| RF-DAT-04 | Diccionario de datos | S | Unidad y documento de origen por columna |

### D. Modelos y riesgo

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-PRD-01 | Modelos 1 y 2 de §6.2 | M | Intervalo y aviso de rango |
| RF-PRD-02 | Modelos 3 y 4 de §6.2 | S | Ídem |
| RF-PRD-03 | Ficha visible de cada modelo | M | Datos, validación, límites |
| RF-RSK-01 | Índice de riesgo por ambiente y material | M | Nivel, margen, evidencia y DOI |
| RF-FIS-01..03 | Tratamiento de gravedad parcial (§5.5) | M/S | — |

### E. Alertas y visualización

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-ALR-01 | Disparadores de §7.2 | M (01–05, 09) · S (06–08) | Causa y fuente visibles |
| RF-ALR-02 | Simulador de escenario | C | Respuesta inmediata |
| RF-VIS-01 | Llama según gravedad, O₂, flujo y combustible | S | Etiqueta "cualitativa" |
| RF-VIS-02 | Evidencia real de PSI al lado | S | Con DOI |
| RF-DET-01 | Vista de detección | S | Por material |

### F. Asistente con IA

| ID | Requisito | Prio |
|---|---|---|
| RF-RAG-01 | Respuestas citadas (§8.1) | M |
| RF-RAG-02 | Contexto de ambiente automático | M |
| RF-RAG-03 | Abstención sin evidencia | M |
| RF-RAG-04 | Respuestas numéricas desde las tablas | S |
| RF-VOZ-01 | Voz | C |

### G. Investigación → tecnología y brechas (O3)

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-TEC-01 | Mapa evidencia → hallazgo → brecha → tecnología | M | Organizado por protocolos, supresión y screening de materiales [VID] |
| RF-TEC-02 | 2–3 recomendaciones de ingeniería con DOI | M | Revisadas por el asesor |
| RF-GAP-01 | Mapa de brechas: gravedad parcial, O₂ alto, escala, detección con polvo | M | Cada brecha con la misión que la cerraría (LUCI, FM2) |

### H. Aplicaciones en la Tierra

| ID | Requisito | Prio | Criterio de aceptación |
|---|---|---|---|
| RF-EAR-01 | Vista de transferencia tecnológica | S | 3–5 casos con enlace a NASA Spinoff y a la investigación relacionada |

### I. Transversal

| ID | Requisito | Prio |
|---|---|---|
| RF-CIT-01 | Página "Datos y referencias" con DOIs, licencias y declaración de uso de IA | M |
| RF-CIT-02 | Botón "copiar cita" | S |
| RF-I18N-01 | Interfaz en inglés; español opcional | M · C |

---

## 10. Requerimientos no funcionales

| ID | Categoría | Requisito |
|---|---|---|
| RNF-01 | Respuesta | El cambio de ambiente se siente inmediato; el asistente empieza a responder en pocos segundos |
| RNF-02 | Demo | Debe funcionar aunque falle un servicio externo (respuestas y datos de respaldo) |
| RNF-03 | Dispositivos | Pensado para laptop; en celular se leen fichas, ranking y asistente |
| RNF-04 | Accesibilidad | Contraste suficiente; alertas con color, ícono y texto |
| RNF-05 | Reproducibilidad | Cualquiera puede regenerar los datos y resultados desde el repositorio |
| RNF-06 | Transparencia | Todo número tiene fuente; toda inferencia de IA está marcada |
| RNF-07 | Licencias | Repositorio con licencia abierta y lista de terceros |
| RNF-08 | Marca | Sin logo de NASA ni sugerencia de aval |
| RNF-09 | Privacidad | Sin cuentas ni datos personales |

---

## 11. Trazabilidad con los criterios de evaluación

La rúbrica oficial no está en las fuentes analizadas (punto abierto A11). Se usan los criterios de trabajo del proyecto:

| Criterio | Qué lo sostiene |
|---|---|
| **Uso riguroso de datos de NASA** | DOIs en todo, niveles de evidencia, validación por grupos, abstención del asistente, evidencia real junto a la animación |
| **Viabilidad técnica** | Modelos simples, corpus acotado, modo de respaldo |
| **Impacto en misiones futuras** | Índice de riesgo lunar, tratamiento de gravedad parcial, mapa de brechas y recomendaciones |
| **Calidad de presentación y repositorio** | Selector de ambiente como hilo del demo; datos y resultados reproducibles |

**Guion de demo sugerido [S]:** elegir base lunar → cambia el ranking → aparece la alerta de gravedad parcial → la llama cambia de forma con marca de extrapolación → el asistente responde con cita.

---

## 12. Fuera del alcance de este documento

| Tema | Dónde se define |
|---|---|
| Arquitectura de la plataforma | Documento de arquitectura, tras la reunión del equipo |
| Stack tecnológico | Mismo documento. **Todo lo que aquí se menciona de tecnología es un supuesto** |
| Modelo de datos y contratos de API | Documento de arquitectura |
| Proceso de trabajo, fases y responsables | Documento de proceso |

---

## 13. Supuestos y puntos abiertos

### Supuestos

| # | Supuesto | Si resulta falso |
|---|---|---|
| S1 | "SI" (*super intelligence*) se interpreta como IA aplicada: asistente, interpretación automática y modelos | Bajo impacto |
| S2 | ISS y naves operan cerca de 14,7 psi y ~21 % O₂ | Ajustar el catálogo |
| S3 | Valores de la banda de precaución y del margen en gravedad parcial | Recalibrar con el asesor |
| S4 | Las APIs satelitales quedan fuera | Ninguno si se respeta |
| S5 | Cualquier mención de tecnología en este documento es provisional | Se reemplaza en el documento de arquitectura |

### Puntos abiertos

| # | Tema | Pregunta |
|---|---|---|
| A1 | Acceso a PSI | ¿Descarga manual o automatizable? ¿Hay límites? Consultar a `msfc-psi-help@mail.nasa.gov` si hace falta |
| A2 | Columnas reales | ¿Qué variables tiene cada tabla? Define qué modelos de §6.2 son factibles |
| A3 | Inventario completo | Identificar las 24 investigaciones en PSI, incluidas las de tierra |
| A4 | Límites de O₂ por material | ¿Hay suficientes valores con DOI? Sin ellos, el índice de riesgo muestra "sin evidencia" |
| A5 | Flujo y propagación | ¿Están en las tablas o hay que sacarlos de artículos o video? |
| A6 | Gravedad parcial | Fijar con el asesor el margen extra a partir de los reportes de FM2 y LUCI |
| A7 | Atmósfera de Marte | El reto no la define: ¿se usa la lunar como hipótesis o se deja "sin definir"? |
| A8 | Licencias | Licencia de cada dataset, imagen y video |
| A9 | DAFT y polvo lunar | Verificar antes de afirmar relevancia para falsas alarmas |
| A10 | Reglas del evento | Inicio permitido del trabajo, pitch, idioma |
| A11 | Rúbrica oficial | Confirmar en la guía de jurado |
| A12 | Requisitos de envío | Formato del demo y enlaces públicos |
| A13 | Uso de IA | ¿Hay que declararlo? |
| A14 | Proveedor de IA | Costo y ofertas del evento |
| A15 | Simulador | ¿Imprescindible o "podría"? |
| A16 | Ponentes del video | Verificar nombres antes de citarlos |

---

## Referencias

**Fuentes del reto**
- Texto oficial: [Flame in Freefall (Space Apps)](https://www.spaceappschallenge.org/2026/find-a-team/flame-in-freefall/)
- Transcripción del video oficial del reto (entregada por el equipo)

**Datos**
- [Repositorio PSI](https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation) · [Información de PSI](https://science.nasa.gov/physical-sciences-informatics-psi/history-of-physical-science-informatics/)

**Contexto NASA**
- [NASA Glenn: Combustion Science](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science)
- [FM2: Flammability of Materials on the Moon (NTRS)](https://ntrs.nasa.gov/citations/20240015307)
- [Fire on the Moon: hipótesis de flamabilidad en gravedad lunar (NTRS)](https://ntrs.nasa.gov/citations/20210020516)
- [LUCI (NTRS)](https://ntrs.nasa.gov/citations/20250010653)
- [Saffire: objetivos (NTRS)](https://ntrs.nasa.gov/citations/20170001636) · [Resultados a gran escala (NTRS)](https://ntrs.nasa.gov/citations/20170008805)
- [Large-Scale Spacecraft Fire Safety Tests (NTRS)](https://ntrs.nasa.gov/citations/20150000894)
- [Detección de incendios en naves (NTRS)](https://ntrs.nasa.gov/citations/20170007283)
- [Resultados detallados de FLEX (NTRS)](https://ntrs.nasa.gov/api/citations/20150023456/downloads/20150023456.pdf)
- [NASA-STD-6001](https://standards.nasa.gov/standard/nasa/nasa-std-6001)
- [Extintor de agua nebulizada (NASA Spinoff)](https://spinoff.nasa.gov/node/11065)
