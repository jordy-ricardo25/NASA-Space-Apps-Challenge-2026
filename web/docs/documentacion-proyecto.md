# Flame in Freefall · Documentación del proyecto

**Centro de mando de seguridad contra incendios en ambientes habitables**
NASA Space Apps Challenge 2026 · Reto *Flame in Freefall* · Equipo de Riobamba

Versión del documento: 14 de noviembre de 2026.

---

## Índice

1. [Qué es y qué problema resuelve](#1-qué-es-y-qué-problema-resuelve)
2. [Cómo responde a los objetivos del reto](#2-cómo-responde-a-los-objetivos-del-reto)
3. [Cómo ponerlo en marcha](#3-cómo-ponerlo-en-marcha)
4. [Recorrido por la plataforma](#4-recorrido-por-la-plataforma)
5. [Los cinco ambientes](#5-los-cinco-ambientes)
6. [La física: qué calcula y de dónde sale](#6-la-física-qué-calcula-y-de-dónde-sale)
7. [Evidencia y alertas](#7-evidencia-y-alertas)
8. [El mundo 3D](#8-el-mundo-3d)
9. [El asistente FUEGO](#9-el-asistente-fuego)
10. [Arquitectura del código](#10-arquitectura-del-código)
11. [API](#11-api)
12. [Estado en la URL](#12-estado-en-la-url)
13. [Sistema de diseño](#13-sistema-de-diseño)
14. [Calidad y pruebas](#14-calidad-y-pruebas)
15. [Guion sugerido para la demo](#15-guion-sugerido-para-la-demo)
16. [Limitaciones y pendientes](#16-limitaciones-y-pendientes)
17. [Fuentes, licencias y uso de IA](#17-fuentes-licencias-y-uso-de-ia)

---

## 1. Qué es y qué problema resuelve

NASA guarda en su repositorio PSI (Physical Sciences Informatics) décadas de experimentos
de combustión en baja gravedad: 24 investigaciones y unos 12 TB de datos. Esos resultados
son difíciles de encontrar, de comparar y de interpretar, así que las decisiones de
seguridad contra incendios para la Luna y Marte se siguen apoyando en criterios terrestres
que podrían no ser conservadores.

**Flame in Freefall** convierte esa evidencia en decisiones. Es una plataforma web que:

- ordena las investigaciones de NASA según el ambiente que se quiera proteger;
- muestra, con un modelo físico calibrado con datos publicados, si un material arde en una
  atmósfera dada y con cuánto margen;
- enseña cómo se comporta la llama en cada gravedad, en 3D y en tiempo real;
- dice con claridad qué se sabe, qué se extrapola y qué no tiene evidencia.

Toda la aplicación es un **centro de mando en una sola pantalla**: ocupa el alto de la
ventana, nunca desplaza la página y nunca abre ventanas nuevas. Un único mundo 3D
permanece vivo mientras las rutas cambian los paneles que flotan encima.

---

## 2. Cómo responde a los objetivos del reto

| Objetivo del reto | Qué pide | Dónde se resuelve |
|---|---|---|
| **O1** · Identificar investigaciones relevantes | Encontrar y comparar investigaciones por ambiente | **Guía** (`/guia`): biblioteca, ranking por ambiente con pesos visibles, comparador, matriz de cobertura y lecciones históricas |
| **O2** · Extraer datos para modelos de inflamabilidad | Datos limpios, unidades armonizadas, modelos con incertidumbre | **Laboratorio** (`/laboratorio`) y **cabinas** (`/modulos/<id>?view=cabina`) |
| **O3** · Destacar controles y equipos de próxima generación | Evidencia para protocolos, supresión y selección de materiales | **Radar** (`/radar`): evidencia → hallazgo → brecha → tecnología y mapa de brechas |
| **O4** · Aplicaciones en la Tierra | Mostrar la transferencia tecnológica | **Tierra** (`/tierra`) |

### Por qué existe la sección Tierra

El texto oficial del reto pide mostrar aplicaciones terrestres de esta investigación. La
sección no es un añadido decorativo: cada caso usa la misma evidencia de NASA que el resto
de la plataforma y **enlaza con la pantalla donde esa evidencia se analiza**.

| Caso | Tipo | Enlace dentro del proyecto |
|---|---|---|
| Tanques de aire ligeros para bomberos | Transferencia documentada | Lecciones históricas de la Guía (Apolo 13) |
| Textiles PBI para trajes de bombero | Transferencia documentada | Mapa de inflamabilidad de tejidos en el Laboratorio |
| Detector de fuego incipiente | Transferencia documentada | Humo y detección en el Laboratorio (SAME) |
| Imagen infrarroja de llamas invisibles | Transferencia documentada | Gotas y llamas frías en el Laboratorio (FLEX) |
| Niebla de agua en lugar de agentes químicos | Aplicación posible | Diseño de supresión en el Radar |

Se distingue siempre una transferencia documentada (con artículo de NASA Spinoff) de una
aplicación posible.

---

## 3. Cómo ponerlo en marcha

Requisitos: Node.js 20 o superior y Google Chrome.

```bash
npm install
```

```bash
npm run dev
```

Abrir http://localhost:3000.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` · `npm run start` | Compilación y servidor de producción |
| `npm run lint` · `npm run typecheck` · `npm run test` | ESLint, TypeScript y pruebas unitarias |
| `npm run check` | Todo lo anterior más la compilación |
| `npm run e2e` | Recorrido automático con Playwright (requiere `npm run build` y el puerto 3000 libre) |
| `npm run bake` | Optimiza un modelo `.glb` de NASA para la web |
| `npm run thumbs` | Regenera las miniaturas de `/modulos` desde la plataforma en marcha |

Variables de entorno (ninguna es obligatoria; copiar `.env.example` como `.env.local`):

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_DEFAULT_LANG` | Idioma inicial: `es` o `en` |
| `NEXT_PUBLIC_SITE_URL` | URL pública, para `sitemap.xml` |
| `NEXT_PUBLIC_ENABLE_MUSIC` | Módulo de música (apagado; solo existe su estructura) |
| `GEMINI_API_KEY` · `GEMINI_MODEL` · `FILE_SEARCH_STORE` | Conexión opcional del asistente con Gemini File Search (solo servidor) |

---

## 4. Recorrido por la plataforma

| Ruta | Pantalla | Qué se hace |
|---|---|---|
| `/` | **Inicio** | Sitio lunar en 3D con los ambientes; cada etiqueta o fila lleva a su módulo |
| `/modulos` | **Módulos** | Tarjetas de los cinco ambientes y de las herramientas |
| `/modulos/<id>` | **Escena** | Modelo 3D del ambiente, descripción, componentes y su atmósfera de diseño. "Ver detalles" muestra alertas e investigaciones relevantes |
| `/modulos/<id>?view=cabina` | **Cabina** | Se enciende una muestra y se ve la llama, la telemetría y el efecto de cada respuesta de la tripulación |
| `/laboratorio` | **Laboratorio** | Cuatro análisis: mapa de inflamabilidad, gotas (ley d²), humo y detección, CO de cabina |
| `/guia` | **Guía** | Biblioteca PSI, ranking, comparador, cobertura y lecciones |
| `/radar` | **Radar** | De la evidencia a la tecnología y mapa de brechas |
| `/tierra` | **Tierra** | Casos de transferencia y su vínculo con el proyecto |
| `/referencias` | **Datos y referencias** | Buscador de citas, licencias y uso de IA |
| `/ajustes` | **Ajustes** | Idioma, unidades, calidad del 3D, movimiento y rol |
| `/mapa` | **Mapa del sitio** | Todas las secciones y los atajos |

### Controles

- **Vistas 3D:** arrastrar para girar, rueda para acercar, clic derecho (o Mayús + arrastrar) para desplazar.
- **Atajos:** `H` inicio · `M` módulos · `L` laboratorio · `G` guía · `R` radar · `T` Tierra · `/` asistente · `Esc` cierra paneles.
- **Idioma:** botón ES / EN en la barra superior.

### Buscador de citas

En `/referencias` las 56 fuentes se pueden filtrar de tres maneras que se combinan:

1. **Pestaña por tipo:** todas, reportes NASA (NTRS), artículos con DOI, datos y normas, modelos y texturas.
2. **Texto libre:** autor, título, año o identificador; ignora tildes y mayúsculas.
3. **Misión:** lista de investigaciones (BASS-II, Saffire, FLEX, SAME, LUCI, FM2…). La relación
   entre misión y fuente sale de las fichas de investigación, no de etiquetas puestas a mano.

La búsqueda queda en la URL (`?q=` y `?mission=`), así que un resultado se puede compartir.

---

## 5. Los cinco ambientes

Cada módulo es un ambiente habitable y funciona como selector de contexto: al cambiarlo
cambian el ranking, el margen, las alertas, la forma de la llama y el contexto del asistente.

| Módulo | Código | Ambiente | Gravedad | O₂ | Presión | ppO₂ | Evidencia |
|---|---|---|---|---|---|---|---|
| Nave | SPX-001 | Cabina de nave en tránsito | µg | 21 % | 101,3 kPa | 21,3 kPa | Directa o análoga |
| Estación | SPX-002 | Estación espacial (ISS) | µg | 21 % | 101,3 kPa | 21,3 kPa | Directa (aquí se midieron los datos de PSI) |
| Rover | SPX-003 | Rover lunar presurizado | 0,165 g | 30 % | 70,3 kPa | 21,1 kPa | Sin datos directos: gravedad parcial |
| Traje EVA | SPX-005 | Traje de exploración | 0,165 g o µg | 100 % | 29,6 kPa | 29,6 kPa | Fuera del rango ensayado (cota superior del reto) |
| Base · Marte | SPX-004 | Hábitat en la superficie de Marte | 0,38 g | 34 % (hipótesis) | 56,5 kPa (hipótesis) | 19,2 kPa | Sin evidencia: gravedad marciana y atmósfera sin definir |

Notas importantes:

- **Rover y base** admiten variantes de atmósfera (la del reto, ≥30 % O₂ a ≤70,3 kPa, y la de
  exploración SEA, 34 % O₂ a 56,5 kPa).
- **Traje EVA:** el reto fija 100 % de O₂ a 4,3 psi como cota superior. PSI ensayó entre 10 y
  40 % de O₂, así que todo resultado del traje es una extrapolación y la plataforma lo avisa
  (ALR-09). Se usa igual que los demás módulos: escena, interior y laboratorio. El interior se ve
  desde dentro del casco: el acolchado, el marco del visor y la superficie lunar al otro lado, con
  un retal de las capas textiles del traje como muestra.
- **Base en Marte:** ninguna fuente fija todavía la atmósfera de una cabina marciana. La
  plataforma usa la atmósfera de exploración como **hipótesis** y la marca como tal. Al entrar
  al módulo, el mundo 3D cambia a Marte (suelo rojizo, cielo y luz marcianos); el rover, la
  nave y el traje siguen en el sitio lunar.
- **El "Cohete" del diseño original** es aquí la cabina tripulada de una nave: el reto excluye
  motores y propelentes.

---

## 6. La física: qué calcula y de dónde sale

El motor (`src/features/fire/engine`) es un **modelo de orden reducido**: correlaciones
sencillas calibradas con cifras publicadas. No es una dinámica de fluidos completa (CFD).

### 6.1 Ideas que el modelo respeta

| Idea | Cómo se refleja |
|---|---|
| Sin flotabilidad, el oxígeno llega por difusión o por la ventilación | En µg el flujo efectivo es solo el del ventilador |
| La flotabilidad crece con g^(1/3) | Flujo equivalente de 15,3 / 19,3 / 25,2 / 35 cm/s para 1/12, 1/6, 3/8 y 1 g |
| Ventilación y flotabilidad se combinan | Suma vectorial: `flujo efectivo = √(ventilación² + flotabilidad²)` |
| Curva en "U" de la inflamabilidad | Con aire casi quieto la llama pierde calor; con flujo alto se apaga por soplado; el mínimo de oxígeno está en medio |
| La gravedad lunar puede ser el peor caso | Hay flujo suficiente para traer oxígeno, pero no tanto como para enfriar la llama |
| Respirar igual no es arder igual | La llama responde a la fracción de O₂, no a su presión parcial |
| Gotas: ley d² | `D²(t) = D₀² − K·t`, con extinción radiativa y llama fría en gotas grandes |
| Dilución | CO₂ y helio suben el límite de oxígeno del material |

### 6.2 Qué calcula

| Función | Resultado |
|---|---|
| `frontier` | Límite de oxígeno del material (con intervalo) según gravedad, flujo, presión y diluyentes |
| `assess` | Margen = O₂ del ambiente − límite; nivel de riesgo, evidencia y alertas |
| `spreadRate` · `heatRelease` | Velocidad de propagación (mm/s) y potencia del fuego (kW) |
| `dropletK` · `dropletCurve` | Constante de combustión K y curva D²(t) de una gota |
| `sootIndex` | Hollín: decide el color de la llama |
| `step` (escenario temporal) | Evolución de O₂, CO₂, CO, humo y temperatura de la cabina, detector y respuesta de la tripulación |

### 6.3 Materiales

Tela SIBAL (algodón y fibra de vidrio, referencia de Saffire), PMMA en placa de 1 cm, tejido
Nomex, aislante de cable (Kapton y Teflon), gota de n-heptano y gota de metanol. Cada
parámetro declara su origen: medido, calibrado o estimado.

### 6.4 Verificación contra la literatura

`npm run test` ejecuta 29 pruebas. Entre ellas:

| Prueba | Referencia |
|---|---|
| Propagación a 20 cm/s: 1,8 mm/s a favor del flujo y 1,3 mm/s en contra | Saffire-1 (Ferkul 2017) |
| Potencia ≈1,5 kW; PMMA de dos caras ≈3,1 kW | Saffire I y VI |
| Nomex no propaga en la atmósfera de la ISS y sí en la de exploración | Thomsen 2017 |
| PMMA: 3–4 puntos de O₂ entre 1 g y µg | Liveretou 2026 |
| Frontera del PMMA cerca de gravedad lunar: 13,2–15,2 % a 57,6 kPa | Olson 2024 |
| Papel en base lunar: ≈18,6 % | Takahashi 2026a |
| Relación crítica agente/O₂: CO₂ ≈ 1,12 y He ≈ 2,1 | Ruff 2004 |
| Metanol: K ≈ 0,478 mm²/s y extinción a 0,81 mm | FLEX (PSI-69) |
| Heptano grande en aire quieto: extinción radiativa y llama fría | FLEX |

---

## 7. Evidencia y alertas

### 7.1 Niveles de evidencia

Todo resultado lleva una insignia. "Sin evidencia" es gris rayado y **nunca** se pinta de
verde ni se presenta como riesgo bajo.

| Nivel | Significado | Ejemplo |
|---|---|---|
| **A** · Directa | Mismo régimen de gravedad y atmósfera, dentro del rango ensayado | BASS-II para la ISS |
| **B** · Análoga | Régimen similar con otro material o escala | Saffire para un material no ensayado |
| **C** · Proxy | Mecanismo sustituto | E-FIELD o gravedad obtenida por rotación |
| **D** · Extrapolación | Fuera del rango de los datos | Gravedad lunar, traje a 100 % de O₂ |
| **∅** · Sin evidencia | Nada lo respalda | Atmósfera de una cabina marciana |

### 7.2 Alertas de análisis

La plataforma no recibe datos de sensores reales: sus alertas son avisos de análisis. Cada
una muestra por qué se disparó y qué fuente la respalda.

| Alerta | Condición | Tipo |
|---|---|---|
| ALR-01 | El O₂ supera el límite del material | Riesgo alto |
| ALR-02 | A menos de 2 puntos del límite | Precaución |
| ALR-03 | O₂ ≥ 30 % | Información |
| ALR-04 | Gravedad entre 0 y 1 g: sin datos directos en PSI | Evidencia |
| ALR-05 | Material sin límite conocido | Sin evidencia |
| ALR-06 | Flujo cercano al de mayor inflamabilidad | Precaución |
| ALR-07 | Posible llama fría tras apagarse la visible | Fenómeno |
| ALR-08 | Material evaluado solo en 1 g | Fenómeno |
| ALR-09 | Consulta fuera del rango de los datos | Dominio |

En la cabina se suman avisos del escenario: alarma del detector de humo (1 % de
obscuración por pie), CO por encima de los límites de exposición (100 ppm en 24 h, 425 ppm
en 1 h) y atmósfera no respirable tras despresurizar.

---

## 8. El mundo 3D

### 8.1 Modelos

Todos son modelos abiertos de **NASA 3D Resources**, reducidos con `scripts/bake-model.mjs`
(misma técnica de la versión alpha): agrupar por pieza, pasar las texturas a color por
vértice, soldar y simplificar con un presupuesto de triángulos, cuantizar y comprimir.

| Modelo | Uso | Peso |
|---|---|---|
| Estación Espacial Internacional (IGOAL) | Estación | 330 KB |
| Space Exploration Vehicle | Rover | 216 KB |
| Saturn V y Mobile Launcher | Nave y torre de servicio | 63 KB |
| Habitat Demonstration Unit | Base | 20 KB |
| Astronauta | Traje EVA y tripulación | 21 KB |

Las texturas de la Tierra y de la Luna vienen del Scientific Visualization Studio de NASA.
El terreno (lunar y marciano) y los interiores de las cabinas se generan con código.

### 8.2 La llama

Es un shader volumétrico (*raymarching*), no un video ni una malla. En cada cuadro recibe del
motor físico la dirección del flujo, el hollín, la intensidad y el parpadeo:

- en 1 g se estira hacia arriba y es amarilla por el hollín;
- en microgravedad es azul y casi esférica;
- en gravedad parcial queda inclinada, entre ambas;
- con ventilación se arrastra a favor del flujo;
- sin oxígeno suficiente se apaga.

En la cabina, un recuadro muestra la misma llama en la Tierra para comparar.

### 8.3 Rendimiento

Un solo `WebGLRenderer` para toda la plataforma. El bucle se pausa si la pestaña está oculta
y la calidad se ajusta sola (pasos de la llama y resolución) para mantener la fluidez. Los
modelos pesan menos de 1 MB en total.

---

## 9. El asistente FUEGO

FUEGO es la mascota y el asistente: una llama con carita que **cae y se vuelve esfera**, y
cuya forma sigue la gravedad del ambiente activo (gota amarilla en 1 g, esfera azul en
microgravedad).

Responde por capas, de la más segura a la más abierta:

1. **Pregunta preparada:** respuesta aprobada por el equipo, al instante.
2. **Análisis del escenario:** cifras calculadas por el motor físico, nunca redactadas.
3. **Base de conocimiento:** fichas curadas a partir del documento maestro, con sus fuentes.
4. **Gemini File Search (opcional):** solo si se configuran las claves en el servidor.
5. **Sin evidencia:** se abstiene y lo dice.

Cada respuesta muestra su origen, sus fuentes y su nivel de evidencia. El micrófono nunca
envía solo: llena el campo de texto y la persona pulsa Enviar. La lectura en voz alta usa la
voz del navegador.

---

## 10. Arquitectura del código

Sigue las reglas de construcción del equipo (`docs/pautas-construccion.md`).

| Capa | Tecnología |
|---|---|
| Framework | Next.js con App Router y renderizado en servidor |
| Lenguaje | TypeScript estricto |
| Estilos | Sass con CSS Modules y tokens de diseño |
| 3D | three.js, solo en el navegador |
| Gráficas | SVG propio con `d3-scale` y `d3-shape` |
| Validación | Zod |
| Pruebas | Vitest y Playwright |
| No se usa | Tailwind, Bootstrap ni TanStack |

```
src/
├── app/                  Rutas delgadas y Route Handlers de /api
│   ├── (platform)/       Todas las pantallas comparten el centro de mando
│   └── api/              Capa intermedia hacia el backend
├── features/             Una carpeta por funcionalidad (feature first)
│   ├── world/            Mundo 3D persistente: sitio, cielo, terreno, cabinas y llama
│   ├── fire/             Motor físico y sus pruebas
│   ├── scene/            Escena de cada módulo y consola de cabina
│   ├── laboratory/       Mapa de inflamabilidad y gráficas
│   ├── investigations/   Guía: biblioteca, ranking, comparador, cobertura
│   ├── radar/ · earth/ · references/ · modules/ · sitemap/ · preferences/
│   ├── alerts/           Presentación de las alertas
│   ├── assistant/        FUEGO y el chat
│   ├── shell/            Barras, pantalla de carga y contenedor
│   └── audio/            Estructura del módulo de música (apagado)
├── shared/               Componentes, hooks, estilos y utilidades comunes
└── content/              Textos y catálogos tipados en español e inglés
```

Reglas que el código cumple:

1. Las páginas de `src/app` solo leen parámetros, piden datos al servicio de la feature y componen.
2. Los componentes de servidor son la opción por defecto; `"use client"` solo donde hay interacción.
3. three.js nunca se ejecuta en el servidor.
4. Los datos pasan por un servicio por feature, que usan tanto las páginas como `/api`.
5. Ningún color ni tamaño se escribe suelto: salen de los tokens.
6. Los textos viven en `src/content` como pares español / inglés.
7. Las rutas se definen una sola vez (`src/content/routes.ts`): las leen la barra lateral, el mapa del sitio y `sitemap.xml`.

### Cómo conviven React y el 3D

- `WorldStage` crea el mundo una vez y vive en el layout, así que no se desmonta al navegar.
- `StageBridge` traduce la ruta en una vista (inicio, módulo, cabina o fondo) y en la configuración del motor.
- `worldCtl` es el puente: los componentes nunca importan three.js, envían órdenes.
- `fireStore` publica el estado del fuego para la telemetría.

---

## 11. API

Todas las respuestas usan el mismo sobre (`src/shared/types/api.ts`), con `data_mode`,
`kind`, `value`, intervalo, nivel de evidencia, alertas, fuentes y versión del modelo.
Conectar el backend real del equipo (FastAPI) no obliga a tocar componentes.

| Ruta | Método | Devuelve |
|---|---|---|
| `/api/health` | GET | Estado del servicio |
| `/api/environments` | GET | Catálogo de ambientes |
| `/api/investigations` | GET | Fichas; con `?env=` y `?pillar=`, el ranking |
| `/api/investigations/[id]` | GET | Ficha de una investigación |
| `/api/compare?inv=a,b` | GET | Investigaciones alineadas para comparar |
| `/api/coverage` | GET | Matriz investigación × variable |
| `/api/predict/solid-boundary` | POST | Frontera de propagación, margen y alertas |
| `/api/predict/droplet-k` | POST | Curva D²(t) y constante K |
| `/api/risk` | POST | Nivel de riesgo, margen y evidencia |
| `/api/techmap` | GET | Radar tecnológico y brechas |
| `/api/earth` | GET | Casos de transferencia |
| `/api/asistente/chat` | POST | Respuesta del asistente con fuentes |

---

## 12. Estado en la URL

Lo que define qué está viendo el usuario vive en los parámetros de la URL: un escenario
exacto se puede compartir y el botón Atrás funciona.

| Parámetro | Ejemplo | Dónde |
|---|---|---|
| `view` | `cabina` | Escena |
| `panel` | `details` | Escena |
| `atm` | `sea`, `reto`, `luna`, `orbita` | Escena y Laboratorio |
| `mat` | `pmma`, `sibal`, `nomex`, `wire`, `heptane`, `methanol` | Escena y Laboratorio |
| `o2` · `p` · `vent` / `flow` | `34` · `56.5` · `10` | Escena y Laboratorio |
| `co2` · `he` | `10` | Laboratorio |
| `env` | `nave`, `estacion`, `rover`, `traje`, `base` | Laboratorio y Guía |
| `tab` | `droplet`, `ranking`, `gaps` | Laboratorio, Guía, Radar, Referencias |
| `inv` · `w` · `id` | `saffire,bass2` | Guía |
| `q` · `mission` | `saffire` · `flex` | Referencias |
| `case` | `mist` | Tierra |

Ejemplo para la demo: `/laboratorio?env=rover&mat=pmma&o2=30&p=70.3&flow=10`.

---

## 13. Sistema de diseño

| Elemento | Valor |
|---|---|
| Fondo | `#071525` |
| Superficie | `#123653` |
| Acento | `#35D8F2` |
| Éxito | `#00D49A` |
| Texto | `#EAF3F8` |
| Cálido (FUEGO y telemetría) | `#FF8738` |
| Riesgo bajo / precaución / alto | `#00D49A` / `#FFC53D` / `#FF5C6C` |
| Sin evidencia | `#8497A8`, con patrón rayado |
| Títulos | Space Grotesk |
| Interfaz | Inter |
| Cifras | JetBrains Mono |

Principios: paneles translúcidos con borde fino, alertas siempre con color, ícono y texto,
foco visible en todos los controles, y gráficas dibujadas al tamaño real de su panel con
texto de 12 px o más.

---

## 14. Calidad y pruebas

| Tipo | Qué cubre |
|---|---|
| Unitarias (Vitest) | Unidades, ppO₂, física contra la literatura, alertas, ranking y escenario temporal |
| Extremo a extremo (Playwright) | Todas las rutas sin errores de consola ni desplazamiento; recorrido de la demo; ruta inexistente |
| Estáticas | ESLint y TypeScript estricto (`noUncheckedIndexedAccess`) |

Antes de dar un cambio por terminado: `npm run check` y revisar la pantalla en Chrome a
1440 × 900.

---

## 15. Guion sugerido para la demo

1. **Inicio.** Girar el sitio lunar con el ratón y presentar los cinco ambientes.
2. **Estación → cabina.** Encender una gota de heptano: la llama es una esfera azul. Compararla con la vela terrestre del recuadro.
3. **Rover → cabina.** Encender PMMA: la llama se inclina y aparece ALR-04 (gravedad parcial sin datos directos). Cortar la ventilación: en la Luna la flotabilidad la mantiene viva.
4. **Laboratorio.** Mover el oxígeno y el flujo sobre el mapa de inflamabilidad; mostrar el margen con su intervalo.
5. **Traje EVA.** 100 % de O₂: la plataforma avisa que está fuera del rango ensayado.
6. **Base en Marte.** El mundo cambia a Marte y la evidencia pasa a "sin evidencia": es una brecha real.
7. **Radar.** Qué misión cerrará cada brecha (LUCI, FM2).
8. **FUEGO.** Una pregunta del jurado, con su fuente.

---

## 16. Limitaciones y pendientes

| Tema | Estado |
|---|---|
| Modelo físico | De orden reducido; no reemplaza una simulación CFD ni un ensayo. Algunos parámetros son estimaciones y están marcados |
| Gravedad parcial | PSI no tiene datos; los resultados lunares son extrapolación |
| Marte | Atmósfera de cabina sin definir en las fuentes; se muestra una hipótesis |
| Traje EVA | 100 % de O₂ queda fuera del rango ensayado (10–40 %) |
| Catálogo de investigaciones | 17 fichas verificadas de las 24 de PSI; faltan las restantes |
| Backend | La plataforma calcula con su propio motor; la conexión con FastAPI y los modelos entrenados del equipo está preparada pero no hecha |
| Asistente con Gemini | Código listo, sin probar por falta de clave |
| Voz clonada | No implementada; se usa la voz del navegador |
| Música | Solo la estructura del módulo, apagada |
| Fidelidad visual | Modelos con color por vértice, sin texturas ni posprocesado |
| Repositorio y despliegue | Sin repositorio git ni despliegue en Vercel todavía |

---

## 17. Fuentes, licencias y uso de IA

- **Datos y cifras:** NASA PSI, NTRS y artículos con DOI. La lista completa, con buscador, está en `/referencias`.
- **Modelos 3D y texturas:** NASA 3D Resources y NASA Scientific Visualization Studio, citando la fuente y sin logotipos de NASA.
- **Software de terceros:** three.js, Next.js, React, d3, lucide y Zod (licencias MIT e ISC); tipografías con licencia SIL OFL. Detalle en `NOTICE`.
- **Uso de IA:** el código se escribió con ayuda de un asistente de programación con IA y fue revisado por el equipo. Ninguna cifra científica fue generada por IA. La mascota y la pantalla de inicio son gráficos vectoriales hechos con código; no se usan imágenes generadas con IA.
- **Aviso:** proyecto independiente para NASA Space Apps. No implica aval de NASA.

### Documentos relacionados

| Documento | Contenido |
|---|---|
| `docs/requerimientos-flame-in-freefall.md` | Qué debe hacer la plataforma |
| `docs/documento-maestro-flame-in-freefall.md` | Física, datos, ambientes y referencias |
| `docs/pautas-construccion.md` | Reglas de construcción del frontend |
| `README.md` | Resumen y puesta en marcha |
| `CLAUDE.md` | Reglas para trabajar el código con Claude Code |
