# Flame in Freefall: pautas de construcción del frontend

**Versión 1.2**

| Versión | Cambio |
|---|---|
| 1.0 | Primera versión |
| 1.1 | Panel del equipo, experiencia de uso, ambientes delimitados, música, mapa del sitio, asistente astronauta y protocolo de voz para la demo |
| 1.2 | La música pasa a ser un módulo propio, apagado y documentado, sin implementar |

**Para quién es.** Para quien programe el frontend (Ricardo y Claude Code) y para quien lo revise (Juan). Es la fuente de verdad para construir la plataforma.

**Alcance.** El **frontend completo** en Next.js, con datos simulados y marcados como tales. El equipo conecta después el backend real (FastAPI en el VPS) sin tocar los componentes: solo cambia una variable de entorno.

**Documentos relacionados**

| Documento | Qué aporta aquí |
|---|---|
| `requerimientos-flame-in-freefall.md` | Qué debe hacer la plataforma (requisitos RF y RNF) |
| `documento-maestro-flame-in-freefall.md` | Física, datos, ambientes, textos técnicos y referencias |
| `proceso-flame-in-freefall.md` | Contratos entre el equipo (§5) y criterios de evaluación |
| Ficha y maquetación de Zuleica | Diseño visual, distribución, paleta, tipografía y navegación |
| Alpha (`llama-caida-libre-alpha-proceso.md`) | Técnica de 3D y de la llama que se porta a este stack |
| Guía del asistente RAG (v2) | Base del asistente astronauta |

**Etiquetas:** **[R]** regla de Ricardo · **[A]** regla agregada en este documento · **[Z]** diseño de Zuleica · **[P]** propuesta a confirmar por el equipo.

---

## Índice

1. [Decisiones de diseño clave](#1-decisiones-de-diseño-clave)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Reglas de desarrollo](#3-reglas-de-desarrollo)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Mapa de rutas y navegación](#5-mapa-de-rutas-y-navegación)
6. [Pantallas](#6-pantallas)
7. [Sistema de diseño](#7-sistema-de-diseño)
8. [Estado en la URL](#8-estado-en-la-url)
9. [Capa de datos: API simulada y real](#9-capa-de-datos-api-simulada-y-real)
10. [3D y llama (lo que se porta de la Alpha)](#10-3d-y-llama-lo-que-se-porta-de-la-alpha)
11. [Asistente astronauta (RAG con voz)](#11-asistente-astronauta-rag-con-voz)
12. [Contenido, idioma y recursos visuales](#12-contenido-idioma-y-recursos-visuales)
13. [Calidad: accesibilidad, rendimiento y pruebas](#13-calidad-accesibilidad-rendimiento-y-pruebas)
14. [Entorno de desarrollo](#14-entorno-de-desarrollo)
15. [Git y GitHub](#15-git-y-github)
16. [Cómo trabajar con Claude Code](#16-cómo-trabajar-con-claude-code)
17. [Orden de construcción](#17-orden-de-construcción)
18. [Puntos abiertos](#18-puntos-abiertos)
19. [Anexo A: `CLAUDE.md`](#anexo-a-claudemd)
20. [Anexo B: primer mensaje para Claude Code](#anexo-b-primer-mensaje-para-claude-code)

---

## 1. Decisiones de diseño clave

### 1.1 Se conserva el diseño de Zuleica

Se respetan la distribución, la navegación, la paleta, la tipografía, el personaje FUEGO y la plantilla común de escena. [Z]

### 1.2 Los cuatro módulos son los cuatro ambientes habitables del reto [P]

El diseño tiene cuatro módulos: Cohete, Estación, Carro y Base. El reto pide analizar exactamente cuatro tipos de ambiente habitable: naves, estaciones espaciales, rovers presurizados y bases en la Luna y Marte. Se usa esa coincidencia: **cada módulo es un ambiente** y funciona como el selector de contexto de toda la plataforma.

| Módulo [Z] | ID [Z] | Ambiente del reto | Gravedad | Presión | O₂ | ppO₂ |
|---|---|---|---|---|---|---|
| Cohete | SPX-001 | **Nave tripulada** (cabina) | ~0 g | 101,3 kPa | 21 % | 21,3 kPa |
| Estación | SPX-002 | **Estación espacial (ISS)** | ~0 g | 101,3 kPa | 21 % | 21,3 kPa |
| Carro | SPX-003 | **Rover lunar presurizado** | 0,165 g | ≤ 70,3 kPa | ≥ 30 % | ~21,1 kPa |
| Base | SPX-004 | **Base lunar** (variante: Marte) | 0,165 g (Marte 0,38 g) | 56,5 kPa | 34 % | 19,2 kPa |

Valores de la base lunar: atmósfera SEA, la misma que replicará FM2 (documento maestro §12.8).

### 1.3 El Cohete cambia de contenido [P]

El reto **excluye explícitamente cohetes y propelentes**: la combustión en motores es prácticamente independiente de la gravedad. Por eso, si el módulo habla de "propulsión avanzada" y muestra velocidad y altitud, se aleja del reto.

**Se conserva** el modelo visual del cohete y su lugar en el Home, pero su contenido pasa a ser **la cabina tripulada en tránsito**. Los textos propuestos están en §6.3. Juan y Zuleica deben aprobar el cambio.

### 1.4 La telemetría muestra la atmósfera del ambiente [P]

Velocidad, altitud y batería no se relacionan con el reto. La caja de telemetría muestra las variables que deciden si algo arde: **O₂, presión y ventilación**, con la ppO₂ calculada. Son parámetros de diseño del ambiente, no datos en vivo.

### 1.5 Dos personajes con funciones distintas

| Personaje | Función | Cómo se comporta |
|---|---|---|
| **Astronauta** (como en el wireframe: "Bienvenido, comandante") | **Asistente con IA**: chat RAG con citas y voz | Avatar con traje espacial en la celda del chat. Responde preguntas del usuario y de los jurados (§11) |
| **FUEGO** [Z] | **Guía contextual** | Mensajes fijos y breves en cada escena. No usa IA. Al pulsarlo, ofrece "Pregúntale al astronauta" y abre el chat |

Así queda claro qué responde una IA (el astronauta) y qué es un texto escrito por el equipo (FUEGO).

### 1.6 Nada se presenta como dato real si no lo es

Todo dato simulado lleva una insignia visible ("Demo data"). Ver §9.

---

## 2. Stack tecnológico

| Capa | Tecnología | Origen |
|---|---|---|
| Framework | **Next.js** (App Router), versión estable más reciente (la guía del RAG se verificó con 16.4.6) | [R] |
| Lenguaje | **TypeScript** en modo `strict` | [R] [A] |
| Estilos | **Sass** con **CSS Modules** (`*.module.scss`) | [R] |
| Prohibido | Tailwind CSS, Bootstrap, TanStack (Query, Table, Router, etc.) | [R] |
| Renderizado | SSR con Server Components por defecto | [R] |
| API | Route Handlers en `/api` como capa intermedia (simulada o real) | [R] |
| Validación | **Zod** para parámetros de URL, cuerpos de petición y respuestas del backend | [A] |
| 3D | **three.js**, cargado solo en el navegador | [A] (de la Alpha) |
| Gráficos | **SVG propio** con `d3-scale` y `d3-shape` (sin librería de gráficos pesada) | [A] |
| Íconos | `lucide-react` (línea fina, como el diseño) | [A] |
| Fuentes | `next/font/google`: Space Grotesk, Inter y JetBrains Mono | [Z] [A] |
| Asistente | `@google/genai` (Gemini File Search) y `react-markdown` | Guía RAG |
| Pruebas | Vitest (unitarias) y Playwright (recorrido de la demo) | [A] |
| Despliegue | Vercel | Equipo |
| Backend real | FastAPI en VPS Debian 13 (lo conecta el equipo) | Equipo |

**Por qué SVG propio para los gráficos:** el mapa de inflamabilidad, la curva D²(t) y el indicador de margen necesitan bandas de incertidumbre, colores por nivel de evidencia y estilos del diseño. Con SVG y Sass hay control total, y las dos librerías de d3 pesan muy poco.

---

## 3. Reglas de desarrollo

### 3.1 Reglas de Ricardo [R]

1. Next.js con **App Router** y su sistema de rutas.
2. Arquitectura **feature first**.
3. **SSR**.
4. Estilos con **Sass** en archivos `*.module.scss`.
5. **Sin Tailwind, sin Bootstrap, sin TanStack.**
6. **TypeScript.**
7. **Query params** para conservar el estado de la página.
8. **Componentes pequeños y reutilizables.**
9. Peticiones al backend **simuladas en `/api`**.
10. Importaciones con el alias **`@/`**.
11. Código **comentado y documentado**.

### 3.2 Reglas agregadas [A]

**Componentes y renderizado**

12. **Server Components por defecto.** `"use client"` solo donde haya interacción: 3D, controles deslizantes, chat, reloj.
13. **El 3D nunca se renderiza en el servidor.** Se carga con `next/dynamic` y `ssr: false` dentro de un componente cliente.
14. **Un componente, una responsabilidad**, hasta unas 150 líneas. Si crece, se divide.
15. **Las páginas (`app/`) son delgadas:** leen parámetros, piden datos a la capa de servicio y componen piezas de `features/`. Sin lógica de negocio.
16. Cada segmento de ruta importante tiene `loading.tsx` y `error.tsx`. Hay un `not-found.tsx` global.
17. Los componentes que usan `useSearchParams` van dentro de `<Suspense>`, como exige Next.js.

**Datos**

18. **Una sola capa de servicio por feature** (`features/<f>/server/*.service.ts`). La usan tanto los Server Components como los Route Handlers. Un Server Component **no** hace `fetch` a su propia `/api`: llama al servicio directamente.
19. **Todas las respuestas usan el sobre común** (§9.2) y se validan con Zod en el límite.
20. **Los textos y datos de contenido no van dentro de los componentes.** Viven en `src/content/` (módulos, fichas, lecciones) y en los diccionarios de idioma.
21. **Ningún número aparece sin unidad y sin fuente.** Las conversiones de unidades viven en una sola función probada (`shared/lib/units.ts`).
22. **Nunca se inventan datos científicos.** Si un valor no está en el documento maestro o en una fuente con DOI, se muestra "Sin evidencia" (∅).

**Estilos**

23. **Tokens de diseño** en `shared/styles/_tokens.scss` y expuestos como variables CSS en `:root`. Ningún color ni tamaño se escribe directo en un componente.
24. Sass moderno: `@use` y `@forward`. No usar `@import`, que está obsoleto.
25. Clases en camelCase dentro de los módulos. Solo `globals.scss` define estilos globales (reset, tipografía, variables).
26. **Sin estilos en línea**, salvo valores calculados en tiempo de ejecución (por ejemplo, el ancho de una barra), y siempre como variable CSS: `style={{ "--value": "62%" }}`.

**Calidad**

27. `strict: true` y `noUncheckedIndexedAccess: true` en `tsconfig`. Prohibido `any`; si hace falta, `unknown` y validación.
28. Antes de cada commit deben pasar `npm run lint`, `npm run typecheck` y `npm run build`.
29. Comentarios JSDoc en cada componente exportado, hook y servicio: qué hace, qué recibe y qué devuelve.
30. **Secretos solo en el servidor.** Nunca en variables `NEXT_PUBLIC_`.

---

## 4. Estructura del repositorio

```
flame-in-freefall/
├── src/
│   ├── app/                              # Rutas (delgadas)
│   │   ├── layout.tsx                    # Fuentes, idioma, globals.scss
│   │   ├── (platform)/                   # Grupo con el shell común
│   │   │   ├── layout.tsx                # TopBar + SideBar + área de contenido
│   │   │   ├── template.tsx              # Transición de entrada entre pantallas
│   │   │   ├── page.tsx                  # 01 · Home
│   │   │   ├── modulos/page.tsx          # Selector de módulos (tarjetas)
│   │   │   ├── modulos/[moduleId]/page.tsx  # Escena individual
│   │   │   ├── guia/page.tsx             # Classroom y biblioteca PSI (O1)
│   │   │   ├── guia/[investigationId]/page.tsx
│   │   │   ├── simulacion/page.tsx       # Laboratorio (O2)
│   │   │   ├── radar/page.tsx            # Radar tecnológico (O3)
│   │   │   ├── tierra/page.tsx           # Aplicaciones en la Tierra
│   │   │   ├── referencias/page.tsx      # Datos y referencias (INFO)
│   │   │   ├── ajustes/page.tsx
│   │   │   └── mapa/page.tsx             # Mapa del sitio
│   │   ├── sitemap.ts                    # sitemap.xml
│   │   ├── design-system/page.tsx        # Solo en desarrollo
│   │   ├── api/                          # Route Handlers (§9)
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── features/
│   │   ├── shell/            # TopBar, SideBar, Clock, SystemStatus, EnvironmentChip, TeamPanel
│   │   ├── audio/            # Música (estructura y comentarios; apagada) §12.3
│   │   ├── environments/     # Catálogo de ambientes, selector, ppO₂
│   │   ├── home/             # Mapa lunar, etiquetas de módulos
│   │   ├── scene/            # Plantilla de escena: visor, panel, telemetría, controles
│   │   ├── viewer3d/         # three.js: carga de modelos, cámara, controles
│   │   ├── flame/            # Shader de la llama y física reducida (visual)
│   │   ├── investigations/   # Fichas, ranking, comparador, cobertura
│   │   ├── laboratory/       # Mapa de inflamabilidad, D²(t), margen
│   │   ├── alerts/           # Reglas ALR-01…09 y su presentación
│   │   ├── assistant/        # Astronauta, chat, micrófono, voz, FAQ, prompt; FUEGO (guía)
│   │   ├── radar/            # Evidencia → brecha → tecnología
│   │   ├── earth/            # Casos de transferencia
│   │   ├── references/       # DOIs, licencias, uso de IA
│   │   └── preferences/      # Idioma, unidades, calidad 3D, rol
│   ├── shared/
│   │   ├── components/       # Panel, Button, IconButton, Tooltip, Badge,
│   │   │                     # ProgressBar, Drawer, Tabs, EvidenceBadge, DataModeBadge
│   │   ├── hooks/            # useScenarioParams, useReducedMotion
│   │   ├── lib/              # apiClient, units, format, env
│   │   ├── styles/           # _tokens.scss, _mixins.scss, _typography.scss, globals.scss
│   │   └── types/            # api.ts (sobre común), domain.ts
│   ├── content/              # Textos y datos de contenido tipados
│   │   ├── modules.ts        # Los 4 módulos (§6.3)
│   │   ├── team.ts           # Panel del Equipo
│   │   ├── routes.ts         # Lista única de rutas
│   │   ├── environments.ts   # Catálogo de ambientes
│   │   ├── investigations.ts # Fichas de PSI
│   │   └── i18n/             # en.ts, es.ts
│   └── mocks/                # Datos simulados para /api (marcados)
├── public/
│   ├── models/               # .glb optimizados (Meshopt)
│   ├── media/                # Imágenes y videos de PSI (con licencia)
│   ├── fuego/                # Personaje FUEGO
│   ├── astronaut/            # Avatar del asistente
│   └── audio/                # Vacía hasta implementar la música (§12.3)
├── scripts/                  # ingest.ts, probar.ts (asistente), bake de modelos
├── conocimiento/             # Corpus del asistente (fuera de git)
├── tests/                    # e2e de Playwright
├── CLAUDE.md
├── README.md
├── .env.example
└── .gitattributes
```

**Anatomía de una feature:**

```
features/laboratory/
├── components/     # FlammabilityMap.tsx + FlammabilityMap.module.scss
├── hooks/          # useFlammabilityQuery.ts
├── server/         # laboratory.service.ts (usa apiClient)
├── lib/            # cálculos puros (con pruebas)
├── types.ts
└── index.ts        # API pública de la feature
```

Una feature solo importa de otra a través de su `index.ts`.

---

## 5. Mapa de rutas y navegación

### 5.1 Barra lateral [Z]

Cinco accesos fijos y siempre en el mismo orden, con tooltip y estado activo en cian:

| Ícono | Nombre [Z] | Ruta | Contenido |
|---|---|---|---|
| Casa | Inicio | `/` | Home (mapa lunar con los 4 módulos) |
| Cubo | Módulos | `/modulos` | Tarjetas de los 4 módulos + Laboratorio, Radar y Tierra |
| Libro | Guía | `/guia` | Classroom: biblioteca PSI, lecciones, casos históricos (O1) |
| Engranaje | Ajustes | `/ajustes` | Idioma, unidades, calidad del 3D, música, reducir movimiento, rol de uso |
| Usuarios | **Equipo** [P] (reemplaza a "Perfil") | Panel lateral | Datos del equipo y enlaces (§5.4) |

La plataforma no tiene cuentas, así que "Perfil" no tendría contenido propio. Ese acceso pasa a mostrar **quiénes somos**. El rol de uso y el progreso se mueven a Ajustes.

### 5.2 Barra superior [Z]

| Elemento | Destino |
|---|---|
| Nombre de la plataforma | `/` |
| ● SYSTEM ONLINE | Verde si la API responde; ámbar con "Demo data" en modo simulado; rojo con "Precomputed" si se usa el respaldo |
| INFO | `/referencias` (datos de NASA, DOIs, licencias, uso de IA) |
| SIMULACIÓN | `/simulacion` (Laboratorio) |
| AYUDA | Abre el chat del astronauta |
| Chip de ambiente | Muestra siempre el ambiente activo (por ejemplo "LUNAR BASE · 0.165 g · 34 % O₂") (§5.6) |
| Música | Botón de activar o silenciar. **Oculto** mientras `NEXT_PUBLIC_ENABLE_MUSIC=false` (§12.3) |
| Reloj | Decorativo (hora local) |
| Ícono de usuario | Abre el panel del Equipo |

### 5.3 Flujo [Z]

Home → etiqueta de un módulo → escena individual → **Ver detalles** (panel ampliado dentro de la misma página) → regreso al Home desde la barra lateral o la flecha de la escena.

**Reglas de navegación [A]:**

- Una sola plataforma: la barra superior y la lateral **no se recargan** al navegar, porque viven en `(platform)/layout.tsx`.
- Transición de entrada suave con `template.tsx`, desactivada si el usuario pidió reducir movimiento.
- **Sin ventanas emergentes ni pestañas nuevas.** "Ver detalles" abre un panel lateral controlado por la URL (`?panel=details`), así el botón Atrás del navegador lo cierra.
- El simulador 3D se carga aparte. Si el dispositivo es lento, baja la calidad automáticamente en vez de bloquear la página.

### 5.4 Panel del Equipo

Panel lateral deslizable que se abre desde la barra lateral o desde el ícono de usuario, sin salir de la pantalla actual.

| Bloque | Contenido |
|---|---|
| Proyecto | Nombre, una frase del problema que resuelve, reto (Flame in Freefall) y evento local (NASA Space Apps Riobamba) |
| Integrantes | Nombre, rol y un enlace profesional (GitHub o LinkedIn) por persona: Juan, Ricardo, Johnatan, Aracelly, Zuleica y Nolasco |
| Enlaces | Repositorio, página del proyecto en Space Apps, video demo, `/referencias` |
| Agradecimientos | Mentores y asesores, si corresponde |

Reglas:

- Solo datos que cada integrante apruebe. Sin teléfonos, correos ni direcciones.
- En 2025, las personas que aparecían en un envío debían aceptar el uso de su nombre e imagen por NASA. Si se ponen fotos, confirmar con cada uno.
- Los datos viven en `src/content/team.ts`, no dentro del componente.

### 5.5 Experiencia de uso: acceso fácil

| Principio | Cómo se cumple |
|---|---|
| **Todo a dos clics** | Desde cualquier pantalla se llega a cualquier módulo en máximo dos clics: barra lateral → destino |
| **Siempre se sabe dónde se está** | Ícono activo en la barra lateral, título de la pantalla y ruta corta debajo de la barra superior (por ejemplo "Modules › Lunar Base") |
| **Siempre se puede volver** | Flecha de regreso en cada escena; el botón Atrás del navegador funciona porque el estado vive en la URL |
| **Atajos de teclado** | `H` Home · `M` Módulos · `G` Guía · `/` abre el chat · `Esc` cierra paneles. Se listan en el mapa del sitio |
| **Primera visita guiada** | FUEGO muestra 3 pasos cortos (elegir ambiente, ver detalles, preguntar al astronauta). Se puede saltar y no vuelve a aparecer |
| **Estados vacíos útiles** | Si no hay datos, se explica por qué y se sugiere qué hacer, en vez de dejar un hueco |
| **Sin sorpresas** | Ningún botón parece funcionar si no funciona: lo que no está implementado se oculta |

### 5.6 Ambientes delimitados

Cada ambiente es un contexto cerrado. El usuario nunca debe confundir los datos de uno con los de otro.

| Regla | Implementación |
|---|---|
| **Identidad visual por ambiente** | Cada ambiente tiene su ícono y un acento sutil en el borde del contenido (dentro de la paleta de Zuleica). Se definen en `src/content/environments.ts` |
| **Ambiente siempre visible** | Chip en la barra superior con nombre, gravedad y O₂ del ambiente activo |
| **Cambio explícito** | Cambiar de ambiente es una acción visible (selector o módulo). Al cambiar, se recalculan ranking, alertas, llama y contexto del asistente, y aparece una notificación breve: "Switched to Lunar Base" |
| **Sin mezcla de datos** | Gráficos y fichas indican a qué ambiente aplican. Si un dato viene de otro régimen (por ejemplo, de la ISS usado para la Luna), se marca con su nivel de evidencia (B, C o D) |
| **Fronteras del dominio** | Si el usuario mueve un control fuera del rango de los datos, la alerta ALR-09 lo avisa en el mismo lugar del control |

### 5.7 Mapa del sitio

Dos formas:

| Forma | Para qué | Implementación |
|---|---|---|
| **Página `/mapa`** | Que el usuario y el jurado vean toda la plataforma de un vistazo | Diagrama de las secciones agrupadas por objetivo del reto (O1, O2, O3, Tierra), cada una con su enlace y una línea de descripción. Incluye los atajos de teclado. Acceso desde AYUDA y desde el pie del panel del Equipo |
| **`sitemap.xml`** | Buscadores y verificación técnica | Archivo `src/app/sitemap.ts` de Next.js, generado a partir de la misma lista de rutas |

La lista de rutas vive en un solo archivo (`src/content/routes.ts`). La usan la barra lateral, la página `/mapa` y `sitemap.ts`, así nunca se desincronizan.

---

## 6. Pantallas

### 6.1 Home · `/` [Z]

| Zona | Contenido | Comportamiento |
|---|---|---|
| Escenario central | Paisaje lunar panorámico con Cohete, Estación (en órbita), Carro y Base | Cada módulo tiene una **etiqueta clicable** (botón accesible) que lleva a `/modulos/<id>` |
| Mensaje de bienvenida | FUEGO + "¡Bienvenido al centro de exploración! Selecciona uno de los módulos para iniciar tu recorrido." | Caja inferior izquierda; se cierra o continúa; recuerda si se cerró |
| Indicador inferior | Señal de desplazamiento | Discreta |

**Primera versión [P]:** imagen panorámica fija con etiquetas posicionadas. La versión con escena 3D es opcional (prioridad C). Así el Home carga rápido y el 3D pesado queda en las escenas.

### 6.2 Módulos · `/modulos` [Z]

Grilla de tarjetas como en la segunda maquetación. Cada tarjeta lleva número, título, estado, imagen, descripción breve y botón **Entrar**.

| Tarjeta | Ruta |
|---|---|
| 01 Home · Vista general | `/` |
| 02–05 Cohete, Estación, Carro, Base | `/modulos/<id>` |
| Laboratorio | `/simulacion` |
| Radar tecnológico | `/radar` |
| Tierra | `/tierra` |

La barra inferior del diseño (Progreso · Misiones · Logros · Ranking) se adapta así [P]:

- **Progreso y Logros:** avance en la Guía, guardado en el navegador. Prioridad C.
- **Misiones:** retos de seguridad contra incendios. Ejemplo: "Encuentra un material que no propague a 34 % O₂ con evidencia A o B". Prioridad C.
- **Ranking:** pasa a ser el **ranking de investigaciones por ambiente** (O1). Un ranking de usuarios exigiría cuentas, y la plataforma no las tiene.

### 6.3 Escena individual · `/modulos/[moduleId]` [Z]

**Estructura idéntica en los cuatro módulos.** Solo cambian el modelo, los textos, los componentes y la telemetría.

| Zona [Z] | Contenido | Comportamiento |
|---|---|---|
| Área visual 3D | Modelo del módulo en su entorno | Rotar, alejar, acercar, centrar, pantalla completa. Los paneles no tapan el modelo |
| Panel derecho | Ícono + nombre · ID · descripción · especialidades · componentes · **Ver detalles** | Misma jerarquía en las 4 escenas. Cada componente abre una explicación breve |
| Telemetría | Título + 3 indicadores con valor, unidad y barra | Caja inferior izquierda |
| Controles 3D | Rotar · Alejar · Acercar · Centrar · Pantalla completa | Barra compacta; tooltip en cada uno. Si una función no existe, no se muestra |
| FUEGO | Mensaje contextual | Cerca de la telemetría sin tapar el modelo. Al pulsarlo ofrece abrir el chat del astronauta |
| Ver detalles | Panel ampliado | Muestra el ambiente con alertas, investigaciones relevantes (ranking) y un botón "Abrir en el Laboratorio" con el escenario ya cargado en la URL |

**Textos propuestos por módulo [P]**

Reemplazan a los de la ficha, para alinearlos con el reto. Mantienen la longitud, el formato y los IDs de Zuleica.

**Cohete · SPX-001 · Nave tripulada**

| Campo | Texto |
|---|---|
| Descripción | Cabina presurizada de una nave en tránsito, en microgravedad. |
| Especialidades | Prevención • Detección • Supresión |
| Componentes | Ventilación de cabina · Detector de humo · Extintor · Materiales de cabina |
| Telemetría | O₂: 21 % · Presión: 101,3 kPa · Ventilación: 10–20 cm/s |
| FUEGO | "En la nave el humo no sube: lo mueve la ventilación. Por eso los detectores están en el flujo de aire." |
| Investigaciones clave | Saffire, SAME, FLEX |

**Estación · SPX-002 · Estación espacial**

| Campo | Texto |
|---|---|
| Descripción | Laboratorio orbital donde NASA estudia cómo arde el fuego sin gravedad. |
| Especialidades | Investigación de combustión • Soporte vital • Experimentos en el CIR |
| Componentes | Combustion Integrated Rack · Glovebox (MSG) · Muestras sólidas · Gotas de combustible |
| Telemetría | O₂: 21 % · Presión: 101,3 kPa · Gravedad: ~0 g |
| FUEGO | "Aquí, sin flotación, la llama se vuelve una esfera azul que vive de la difusión." |
| Investigaciones clave | BASS-II, FLEX, ACME, SAME-R |

**Carro · SPX-003 · Rover presurizado**

| Campo | Texto |
|---|---|
| Descripción | Vehículo presurizado para recorrer la Luna, con más oxígeno y menos presión que la Tierra. |
| Especialidades | Atmósfera enriquecida • Volumen reducido • Gravedad lunar |
| Componentes | Cabina presurizada · Esclusa · Sistemas eléctricos · Materiales interiores |
| Telemetría | O₂: 30 % · Presión: 70,3 kPa · ppO₂: 21,1 kPa |
| FUEGO | "Respiras casi el mismo oxígeno que en la Tierra, pero aquí los materiales arden con más facilidad." |
| Investigaciones clave | CFI-G, LUCI, E-FIELD (proxy) |

**Base · SPX-004 · Base lunar**

| Campo | Texto |
|---|---|
| Descripción | Hábitat de larga duración en la Luna, con atmósfera de exploración. |
| Especialidades | Habitabilidad • Atmósfera de exploración • Gravedad parcial |
| Componentes | Módulos habitacionales · Esclusas · Centro de operaciones · Soporte vital |
| Telemetría | O₂: 34 % · Presión: 56,5 kPa · Gravedad: 0,165 g |
| FUEGO | "En la Luna la gravedad parcial podría ser el peor caso para un incendio. Te muestro por qué." |
| Investigaciones clave | FM2, LUCI, BRE |
| Variante Marte | Interruptor Luna / Marte. En Marte: 0,38 g y atmósfera **sin definir**, con evidencia ∅ |

La telemetría lleva la etiqueta **"Parámetros del ambiente"** y su nivel de evidencia. "DEMO" se reserva para valores simulados.

### 6.4 Guía · `/guia` (O1)

| Sección | Contenido | Prioridad |
|---|---|---|
| Biblioteca PSI | Una ficha por investigación: objetivo, combustible, condiciones, variables, sensores, hardware, plataforma, hallazgos, pilar, ambientes, limitaciones, DOI | M |
| Ranking | Por ambiente y pilar, con pesos visibles y ajustables y desglose por criterio | M |
| Comparador | 2–4 investigaciones lado a lado, con unidades armonizadas | M |
| Matriz de cobertura | Investigación × variable: medida, no medida o no aplica | M |
| Lecciones | Plan de estudios del documento maestro §15.2.2 | S |
| Casos históricos | Apollo 1, Apollo 13, Mir | S |

### 6.5 Simulación · `/simulacion` (Laboratorio, O2)

| Panel | Contenido | Prioridad |
|---|---|---|
| Selector de escenario | Ambiente, material, O₂, presión, flujo y gravedad (todo en la URL) | M |
| Mapa de inflamabilidad | O₂ vs. flujo; puntos "propaga / no propaga"; banda de frontera con incertidumbre; punto de la cabina. Un panel por gravedad (µg · Luna · 1 g) | M |
| Indicador de margen | Barra con intervalo y el cero marcado; nivel de evidencia | M |
| Alertas | ALR-01…09 con causa y fuente | M |
| Gotas (FLEX) | Curva D²(t) y K predicha según el diluyente | S |
| Llama 3D | Shader de la Alpha reaccionando al escenario, con etiqueta "representación cualitativa" | S |
| Evidencia real | Video o fotograma de PSI junto a la animación | S |
| Ficha del modelo | Datos, validación, dominio y límites | M |

### 6.6 Radar · `/radar` (O3)

Grafo evidencia → hallazgo → brecha → tecnología, organizado por **protocolos, supresión y selección de materiales**. Incluye el mapa de brechas: gravedad parcial, O₂ alto, escala y polvo, cada una con la misión que la cerraría (LUCI, FM2). Prioridad M.

### 6.7 Tierra · `/tierra`

De 3 a 5 casos de transferencia (tanques de aire, PBI, detección, nebulizadores), cada uno con enlace a NASA Spinoff y a la investigación relacionada. Prioridad S.

### 6.8 Referencias · `/referencias`

Todos los DOIs y enlaces NTRS, las licencias de cada recurso y la declaración de uso de IA. Prioridad M.

### 6.9 Ajustes

| Opción | Valores |
|---|---|
| Idioma | EN / ES |
| Unidades | SI / psi |
| Calidad del 3D | Automática · alta · baja |
| Música | Activada / silenciada · volumen. Se agrega cuando se implemente el módulo de audio (§12.3) |
| Reducir movimiento | Sí / No |
| Rol de uso | Operador · ingeniero · investigador · estudiante (cambia el orden de la Guía) |
| Progreso | Avance en la Guía y logros, con botón para reiniciar |

Sin cuentas ni datos personales: todo se guarda en el navegador.

### 6.10 Design System · `/design-system` (solo desarrollo)

Página con tokens, tipografía, botones y estados. Sirve para revisar el diseño con Zuleica. Se oculta en producción con una variable de entorno.

---

## 7. Sistema de diseño

### 7.1 Paleta [Z]

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#071525` | Fondo general |
| `--color-surface` | `#123653` | Paneles, bordes y superficies |
| `--color-accent` | `#35D8F2` | Etiquetas activas, botones y contornos |
| `--color-success` | `#00D49A` | Estado online y confirmaciones |
| `--color-text` | `#EAF3F8` | Textos y líneas |
| `--color-warm` | `#FF8738` | Telemetría y FUEGO |

**Colores de estado agregados [A].** Las alertas necesitan su propia escala, distinta del naranja de FUEGO:

| Token | Uso |
|---|---|
| `--color-risk-low` | Riesgo bajo |
| `--color-risk-caution` | Precaución |
| `--color-risk-high` | Riesgo alto |
| `--color-evidence-none` | Sin evidencia (gris; patrón rayado) |

Valores exactos a definir con Zuleica, verificando contraste AA sobre `--color-bg`. El estado "sin evidencia" **nunca** se pinta de verde.

### 7.2 Tipografía [Z]

| Uso | Fuente |
|---|---|
| Títulos | Space Grotesk |
| Interfaz | Inter |
| Cifras, IDs y telemetría | JetBrains Mono |

Jerarquía: título de módulo > subtítulo de sección > texto descriptivo > dato técnico.

### 7.3 Componentes base [Z] [A]

| Componente | Estados |
|---|---|
| Botón primario (cian, relleno) y secundario (borde) | Normal · hover · activo · deshabilitado · foco visible |
| Botón de ícono (barra lateral y controles 3D) | Ídem + tooltip |
| Panel (borde fino cian, fondo translúcido) | — |
| Insignia de estado (online, demo, precalculado) | — |
| Insignia de evidencia (A, B, C, D, ∅) | — |
| Barra de progreso con valor y unidad | — |
| Panel lateral deslizable (Ver detalles) | Abierto · cerrado |
| Pestañas | Activa · inactiva |

### 7.4 Responsive [Z]

- **Escritorio** (≥ 1280 px): escena a la izquierda y panel a la derecha.
- **Tableta y móvil** (< 1024 px): el panel derecho pasa a ser una tarjeta inferior desplegable. Las fichas, el ranking y el chat se leen en vertical.
- Sin texto pequeño sobre imágenes complejas: siempre sobre un panel.

---

## 8. Estado en la URL

Todo lo que define "qué está viendo el usuario" vive en los query params [R]. Así se puede compartir un escenario exacto y el botón Atrás funciona.

| Parámetro | Ejemplo | Dónde |
|---|---|---|
| `env` | `iss`, `spacecraft`, `lunar_rover`, `lunar_sea`, `mars` | Global |
| `material` | `pmma`, `sibal`, `nomex` | Laboratorio |
| `o2` | `0.34` (fracción) | Laboratorio |
| `p` | `56.5` (kPa) | Laboratorio |
| `flow` | `10` (cm/s) | Laboratorio |
| `g` | `0.165` | Laboratorio |
| `tab` | `map`, `droplet`, `flame` | Laboratorio, Guía |
| `panel` | `details` | Escena |
| `inv` | `bass-ii,flex` | Comparador |
| `w` | pesos del ranking | Guía |
| `lang` | `en`, `es` | Global |

**Implementación [A]:**

- Un hook propio, `useScenarioParams()`, que lee, valida con Zod, aplica valores por defecto y actualiza con `router.replace` (sin agregar entradas al historial por cada movimiento de un control).
- Los controles deslizantes actualizan la URL con un retraso de unos 200 ms, para no saturar el historial.
- Los Server Components leen `searchParams` y validan con el mismo esquema Zod.
- Ejemplo de enlace para la demo: `/simulacion?env=lunar_sea&material=pmma&o2=0.34&p=56.5&flow=10&g=0.165`.

---

## 9. Capa de datos: API simulada y real

### 9.1 Cómo fluye

```
Componente cliente ──fetch──► /api/... (Route Handler) ─┐
Server Component ─────────────► servicio de la feature ─┤
                                                        ▼
                                                   apiClient
                                       ┌────────────────┼────────────────┐
                                API_MODE=mock     API_MODE=real     falla la API
                                       ▼                ▼                ▼
                                  src/mocks/      FastAPI (VPS)    respaldo precalculado
                               data_mode:"simulation" data_mode:"real"  data_mode:"precomputed"
```

- Los **Route Handlers** son la capa intermedia: ocultan la URL del VPS, evitan problemas de CORS y aplican el respaldo.
- Pasar de simulado a real es **cambiar `API_MODE`**, sin tocar componentes.

### 9.2 Sobre común de respuesta

Es el mismo del documento de proceso §5.1:

```ts
// src/shared/types/api.ts
export type DataMode = "real" | "simulation" | "precomputed";
export type EvidenceLevel = "A" | "B" | "C" | "D" | "NONE";

export interface ApiEnvelope<T> {
  data_mode: DataMode;
  kind: "prediction" | "measurement" | "derived" | "catalog";
  value: T;
  interval?: [number, number];
  evidence_level?: EvidenceLevel;
  alerts?: { id: string; message: string; source?: string }[];
  sources: { doi?: string; ntrs?: string; locator?: string }[];
  model_version?: string;
}
```

Regla de interfaz: si `data_mode` no es `real`, se muestra `<DataModeBadge />` con "Demo data" o "Precomputed".

### 9.3 Rutas `/api`

| Ruta | Método | Devuelve | Backend real |
|---|---|---|---|
| `/api/environments` | GET | Catálogo de ambientes | Estático (no requiere backend) |
| `/api/investigations` | GET | Fichas y ranking (`?env=&pillar=&w=`) | Estático o FastAPI |
| `/api/investigations/[id]` | GET | Ficha completa | Estático o FastAPI |
| `/api/compare` | GET | Variables alineadas (`?inv=`) | Estático |
| `/api/coverage` | GET | Matriz de cobertura | Estático |
| `/api/predict/solid-boundary` | POST | Frontera, P(propaga), margen, alertas | `POST /predict/solid-boundary` |
| `/api/predict/droplet-k` | POST | K de gotas | `POST /predict/droplet-k` |
| `/api/risk` | POST | Nivel, margen, alertas, evidencia | Derivado de la frontera |
| `/api/techmap` | GET | Grafo del Radar | Estático |
| `/api/earth` | GET | Casos de transferencia | Estático |
| `/api/health` | GET | Estado (alimenta "SYSTEM ONLINE") | `GET /health` |
| `/api/asistente/chat` | POST | Respuesta con citas | Gemini (§11) |
| `/api/asistente/tts` | POST | Audio | Fish Audio (opcional) |

Los contratos de FastAPI están en el documento maestro §14.4. El Route Handler convierte su respuesta al sobre común.

### 9.4 Reglas de los datos simulados

- Cada archivo en `src/mocks/` empieza con un comentario: **"DATOS SIMULADOS — no son resultados reales"**.
- Los catálogos (ambientes, fichas de investigaciones, casos de la Tierra) **no son simulados**: salen del documento maestro y llevan su fuente.
- Las predicciones simuladas deben ser **físicamente plausibles**: más O₂ → más probabilidad de propagación; gravedad parcial → alerta ALR-04.

### 9.5 Variables de entorno

```env
# .env.example
API_MODE=mock                 # mock | real
API_BASE_URL=                 # URL del FastAPI en el VPS (solo servidor)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
FILE_SEARCH_STORE=
MODO_ESTRICTO=false
FISH_API_KEY=
FISH_VOICE_ID=
FISH_MODEL=s2.1-pro-free
NEXT_PUBLIC_APP_NAME=Space Exploration Simulator
NEXT_PUBLIC_DEFAULT_LANG=en
NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=false
NEXT_PUBLIC_ENABLE_MUSIC=false   # módulo de audio sin implementar (§12.3)
```

---

## 10. 3D y llama (lo que se porta de la Alpha)

### 10.1 Qué se toma de la Alpha

| Pieza de la Alpha | Destino en este stack |
|---|---|
| Modelo de la ISS de NASA-3D-Resources reducido de 96 MB a 322 KB | Exportar como `.glb` con compresión Meshopt y cargar con `GLTFLoader` + `MeshoptDecoder` desde `public/models/` |
| Proceso de optimización (`tools/bake.mjs`) | `scripts/bake-model.mjs`, reutilizable para los otros modelos |
| Shader volumétrico de la llama (`FLAME_FS`) | `features/flame/flameMaterial.ts` (TypeScript) |
| Física reducida para la llama (`physics.js`) | `features/flame/physics.ts`, solo para **animar** la llama. No se presenta como predicción |
| Pruebas de la física contra la literatura (`test_phys.mjs`) | Pruebas de Vitest |
| Calidad automática según la fluidez | Se conserva |
| Interior generado con código (racks, combustibles) | Opcional para la escena de la Estación |

### 10.2 Qué NO se toma de la Alpha

| Pieza | Por qué |
|---|---|
| Red neuronal entrenada con 60 000 escenarios sintéticos | Aprendió del mismo simulador: sus métricas no dicen nada sobre la realidad. Los modelos reales vienen de Aracelly |
| "Riesgo de incendio a 5 minutos" y telemetría de sensores | El reto no incluye detección en tiempo real |
| Límites de O₂ estimados de Nomex, ETFE y PMMA | Se reemplazan por valores con DOI del documento maestro |
| Todo en un solo archivo HTML | Se reescribe en componentes |

### 10.3 Reglas del visor 3D [A]

- Cargado con `next/dynamic` y `ssr: false`; mientras carga, se muestra un esqueleto.
- Un solo `WebGLRenderer` por escena; se **libera** (`dispose`) al desmontar.
- El bucle de render se **pausa** si la pestaña está oculta o el visor sale de pantalla.
- `devicePixelRatio` limitado a 2 y calidad adaptativa.
- Presupuesto: hasta unos 3 MB de modelos por escena.
- Si WebGL no está disponible, se muestra una imagen fija con el mismo diseño.
- La llama lleva la etiqueta **"representación cualitativa"** y, junto a ella, evidencia real de PSI con DOI.

### 10.4 Modelos por módulo [P]

| Módulo | Fuente sugerida |
|---|---|
| Estación | ISS de NASA-3D-Resources (ya resuelto en la Alpha) |
| Cohete | Cápsula o nave de NASA-3D-Resources |
| Carro y Base | Modelos de NASA-3D-Resources si existen; si no, geometría simple generada con código |

Cada modelo se registra con su origen y licencia en `/referencias`.

---

## 11. Asistente astronauta (RAG con voz)

### 11.1 Base técnica

Se implementa según la **guía del asistente RAG v2**, con estos ajustes:

| Tema | Ajuste |
|---|---|
| Ubicación | `src/features/assistant/` (componentes, FAQ, prompt) y `src/app/api/asistente/` (rutas). `scripts/` y `conocimiento/` quedan en la raíz |
| Estilos | La guía usa Tailwind: se reescriben con `*.module.scss`. La lógica no cambia |
| Presentación | Panel lateral de chat; sin ventanas emergentes |
| Citas | Los archivos del corpus se nombran con un código (por ejemplo `B7_Zayac2024_FM2.pdf`). Una tabla `corpus-manifest.ts` traduce el código a título, DOI y enlace, y el chip de la cita muestra el DOI |
| Contexto | El ambiente activo (`env`) se agrega al prompt del sistema |
| Idioma | Responde en el idioma de la pregunta |
| Voz de salida | Por defecto, la voz del navegador. Si se usa una voz clonada con Fish Audio, se declara como contenido generado con IA |
| Preguntas preparadas | Las respuestas aprobadas (física y producto) son las sugerencias destacadas. Responden sin llamar a la IA, así que funcionan aunque falle la API |
| Corpus | Solo documentos públicos de NASA o de acceso abierto. De los artículos de pago, solo resúmenes propios |
| Modo estricto | `true` para la demo, con "Hola" agregado como pregunta preparada |

### 11.2 Apariencia: astronauta

| Elemento | Detalle |
|---|---|
| Avatar | Astronauta con traje espacial, como en el wireframe ("Bienvenido, comandante"). Ilustración del equipo o NASA-style genérica |
| Traje | **Sin logos de NASA, banderas ni insignias de misión** (regla del envío para contenido generado con IA). Si se genera con IA, lleva marca de agua |
| Estados animados | Reposo · escuchando (visor iluminado en cian) · pensando · hablando (onda de voz) |
| Nombre | Por definir [P]. Sugerencia: **CAPCOM**, el nombre del puesto de control de misión que habla con los astronautas |
| Saludo | "Welcome, commander. Ask me anything about fire safety in space." / "Bienvenido, comandante. Pregúntame sobre seguridad contra incendios en el espacio." |

### 11.3 Micrófono: escucha controlada

El problema: si el micrófono queda escuchando solo, toma lo primero que oiga (ruido, otra conversación, el propio asistente hablando) y responde a eso. La solución es que **una persona controle cuándo escucha y cuándo se envía**.

**Botón de micrófono dentro de la celda del chat**, junto al campo de texto:

| Paso | Qué pasa | Qué ve el usuario |
|---|---|---|
| 1. Pulsar el micrófono | Empieza a escuchar. Si el asistente estaba hablando, **se calla primero** para no escucharse a sí mismo | Botón rojo, visor del astronauta en cian, texto "Listening…" |
| 2. La persona habla | La transcripción aparece **en vivo** en el campo de texto | Texto que se va escribiendo |
| 3. Pulsar de nuevo el micrófono | Deja de escuchar. **No envía nada todavía** | La pregunta queda en el campo, editable |
| 4. Revisar y pulsar Enviar | Se envía la pregunta | El astronauta pasa a "pensando" |
| Seguridad | Si nadie detiene el micrófono, se apaga solo a los 30 s | Aviso "Listening stopped" |

Detalles técnicos [A]:

- Web Speech API con `continuous = true` e `interimResults = true`. El reconocimiento **no envía automáticamente**: solo llena el campo de texto.
- **Selector de idioma de escucha** junto al micrófono (ES / EN), separado del idioma de la interfaz. Así un jurado puede preguntar en español aunque la interfaz esté en inglés.
- Mientras el asistente habla, el micrófono está **deshabilitado**. Un botón **Stop** corta la voz en cualquier momento.
- Atajo: barra espaciadora mantenida = hablar (opcional, para el operador).
- Si el navegador no soporta dictado, el botón se oculta y queda el campo de texto. Funciona en Chrome y Edge, y necesita internet.

### 11.4 Protocolo para la demo con jurados

| Momento | Qué se hace |
|---|---|
| Antes | Chrome con el permiso del micrófono aceptado; **micrófono externo** (USB o de solapa) cerca del jurado, porque el de la laptop capta el ruido de la sala; volumen alto; modo estricto activado |
| Presentación | Zuleica: *"Each judge can ask our astronaut one direct question."* |
| Por cada jurado | Juan pulsa el micrófono → el jurado pregunta → Juan pulsa de nuevo → revisa la transcripción en pantalla (corrige si hace falta) → Enviar |
| Respuesta | El astronauta responde en voz alta y en pantalla, con chips de las fuentes (DOI). Si no hay evidencia: "I couldn't find that in our NASA sources" |
| Si el dictado falla | Juan escribe la pregunta, o se usa una de las preguntas preparadas en pantalla |
| Respaldo | Video grabado de 2–3 preguntas con respuesta, por si falla la conexión |

---

---

## 12. Contenido, idioma y recursos visuales

### 12.1 Idioma

- La página del proyecto y los materiales enlazados deben estar en inglés, y **el producto es un material enlazado**. Por eso la interfaz va **en inglés por defecto**, con español disponible en Ajustes.
- Diccionarios propios en `src/content/i18n/en.ts` y `es.ts`, con tipos que obligan a que ambos tengan las mismas claves. No hace falta librería.
- Los textos de §6.3 se traducen al inglés para la versión por defecto.

### 12.2 Recursos visuales

| Tipo | Regla |
|---|---|
| Modelos y fotos de NASA | Se pueden usar citando la fuente. **Sin logos ni marcas de NASA** |
| Imágenes generadas con IA (por ejemplo, los renders de referencia del diseño o el personaje FUEGO, si se hizo con IA) | Solo con **marca de agua visible** indicando que son generadas con IA, y declaradas en el campo de uso de IA |
| Fuentes tipográficas | Licencia abierta (OFL); se registran en `/referencias` |
| Videos e imágenes de PSI | Citar el DOI de la investigación; verificar la licencia |

### 12.3 Música y sonido: módulo propio, sin implementar todavía

**No es prioridad.** Claude Code **no** implementa la música en esta versión. Solo deja creado un módulo aislado, apagado y documentado, para que se sepa exactamente dónde va y cómo se haría cuando haya tiempo.

**Qué se crea ahora (solo la estructura):**

```
src/features/audio/
├── README.md                       # Instrucciones completas para implementarla (abajo)
├── index.ts                        # Exporta MusicToggle y AudioProvider
├── config.ts                       # Pista, volumen por defecto, flag de activación
├── components/
│   ├── MusicToggle.tsx             # Botón de la barra superior (devuelve null si el flag está apagado)
│   └── MusicToggle.module.scss
├── providers/
│   └── AudioProvider.tsx           # Contexto vacío con la interfaz final y comentarios TODO
└── hooks/
    └── useAmbientAudio.ts          # Firma del hook con comentarios TODO, sin lógica
```

**Reglas para esta versión:**

- Variable de entorno `NEXT_PUBLIC_ENABLE_MUSIC=false`. Con el flag apagado, el botón no aparece y no se carga ningún audio.
- El `AudioProvider` se monta en el layout, pero no hace nada. Así, activarlo después no obliga a tocar el shell.
- Cada archivo lleva comentarios `TODO(audio)` con los pasos concretos.
- Ninguna otra feature importa nada de `audio/` salvo el layout (`AudioProvider`) y la barra superior (`MusicToggle`).

**Contenido del `README.md` del módulo (cómo implementarla después):**

| Paso | Qué hacer |
|---|---|
| 1. Pista | Elegir música ambiental con licencia libre (dominio público, sonidos públicos de NASA o CC0). Comprimirla (≤ 2 MB, `.mp3` u `.ogg`) y guardarla en `public/audio/`. Registrar origen y licencia en `/referencias`. Si es generada con IA, declararlo en el texto y en los metadatos |
| 2. Reproducción | En `useAmbientAudio`, crear un único `HTMLAudioElement` en bucle, **solo después de que el usuario pulse el botón** (los navegadores bloquean el audio automático) |
| 3. Preferencia | Guardar activada o silenciada y el volumen en `localStorage` (con `try/catch`). Música **apagada** en la primera visita |
| 4. Bajar volumen | Exponer `duck()` y `unduck()` en el contexto. El asistente llama a `duck()` cuando habla o cuando el micrófono escucha |
| 5. Ajustes | Agregar en `/ajustes` el interruptor y el control de volumen, leyendo del mismo contexto |
| 6. Accesibilidad | Botón con `aria-pressed` y etiqueta "Music on/off". Si el usuario pidió reducir movimiento, no cambia nada del audio, pero los sonidos de interfaz quedan apagados |
| 7. Sonidos de interfaz (opcional) | Clic al navegar y tono al aparecer una alerta, controlados por el mismo interruptor |
| 8. Activar | Cambiar `NEXT_PUBLIC_ENABLE_MUSIC=true` en Vercel y volver a desplegar |

**Interactividad sin música:** el 3D, las etiquetas del Home, la llama que reacciona a los controles y el astronauta ya hacen la plataforma interactiva.

---|---|
| **Apagada al entrar** | Los navegadores bloquean el audio automático y la música inesperada molesta. Se activa con el botón de la barra superior; la preferencia se recuerda |
| Tipo | Música ambiental espacial, suave y en bucle |
| Se baja sola | Cuando el astronauta habla o el micrófono escucha, la música baja o se pausa |
| Sonidos de interfaz (opcional) | Clic suave al navegar y un tono al aparecer una alerta. Se apagan junto con la música |
| Licencia | Solo audio de dominio público o con licencia libre (por ejemplo, sonidos públicos de NASA o música CC0). Se cita en `/referencias`. Si es generada con IA, se declara en el texto y en los metadatos |
| Peso | Archivo comprimido (≤ 2 MB), cargado solo cuando se activa |

**Interactividad sin música:** el 3D, las etiquetas del Home, la llama que reacciona a los controles y el astronauta ya hacen la plataforma interactiva. La música es un extra (prioridad C).

---

## 13. Calidad: accesibilidad, rendimiento y pruebas

### 13.1 Accesibilidad

- HTML semántico: `nav`, `main`, `aside`, `button` (no `div` clicables).
- Las etiquetas del Home y los controles 3D se pueden usar con teclado y tienen `aria-label`.
- Foco visible en cian en todos los elementos interactivos.
- Contraste AA. Color, ícono y texto juntos en cada alerta.
- `prefers-reduced-motion`: desactiva transiciones y reduce el parpadeo de la llama.

### 13.2 Rendimiento

| Meta | Valor |
|---|---|
| Primera carga del Home | < 3 s en laptop |
| Cambio de pantalla | Inmediato (sin recargar el shell) |
| 3D | Fluido en una laptop con gráficos integrados, gracias a la calidad adaptativa |

Además: imágenes con `next/image`, 3D cargado bajo demanda y fuentes con `next/font`.

### 13.3 Pruebas

| Tipo | Qué cubre | Prioridad |
|---|---|---|
| Unitarias (Vitest) | Conversión de unidades, ppO₂, reglas de alertas, validación de query params, física de la llama | M |
| Recorrido de la demo (Playwright) | Home → Base → Ver detalles → Laboratorio con el escenario lunar → el astronauta responde una pregunta preparada | S |
| Revisión manual | Recorrido completo en Chrome, en modo incógnito, tres veces seguidas sin errores | M |

---

## 14. Entorno de desarrollo

Aplica a cualquier computadora donde se programe o se corra el proyecto.

### 14.1 Herramientas

| Herramienta | Versión | Cómo comprobarla |
|---|---|---|
| Node.js | 22 LTS (mínimo 20) | `node -v` |
| npm | La que trae Node | `npm -v` |
| Git | Reciente | `git --version` |
| Claude Code | 2.1.321 o posterior (necesaria para Fable 5.2) | `claude --version` · actualizar con `claude update` |
| Google Chrome | Reciente | Necesario para el micrófono del asistente |
| VS Code | Reciente | Extensiones: ESLint, Prettier, SCSS IntelliSense |
| GitHub CLI (opcional) | Reciente | `gh --version` |
| Vercel CLI (opcional) | Reciente | `vercel --version` |

### 14.2 Cuentas y claves

| Cuenta | Para qué |
|---|---|
| GitHub (`JuanSQuezada`) | Repositorio |
| Vercel, vinculada a GitHub | Despliegue |
| Google AI Studio | Clave de Gemini para el asistente |
| Fish Audio (opcional) | Voz clonada |

### 14.3 Ajustes en Windows

```bash
git config --global core.longpaths true      # rutas largas de node_modules
git config --global core.autocrlf false      # los finales de línea los controla .gitattributes
```

- Archivo `.gitattributes` en el repositorio con `* text=auto eol=lf`.
- Si PowerShell bloquea los scripts de npm: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Nombres de archivo sin tildes, eñes ni espacios.

---

## 15. Git y GitHub

| Tema | Regla |
|---|---|
| Repositorio | `JuanSQuezada/flame-in-freefall` [P], **público** (lo exige el envío) |
| Colaboradores | Agregar a Ricardo, Johnatan y Aracelly con permiso de escritura |
| Ramas | `main` siempre desplegable; trabajo en ramas `feat/<feature>`, `fix/<tema>` |
| Commits | Convención *Conventional Commits*: `feat(laboratory): mapa de inflamabilidad` |
| Revisión | Cambios a `main` por *pull request*, aprobados por Ricardo |
| Despliegue | Vercel publica `main` en producción y cada *pull request* en una vista previa |
| Licencia | MIT para el código; archivo `NOTICE` con terceros (three.js, fuentes, modelos de NASA) |
| Nunca subir | `.env.local`, `conocimiento/`, archivos de modelos sin optimizar |

---

## 16. Cómo trabajar con Claude Code

### 16.1 Modelos

| Tarea | Modelo |
|---|---|
| Planificar cada feature, el shader de la llama, la integración y la revisión final | **Fable 5.2** |
| Volumen de componentes, estilos y pantallas | **Opus 5.5** |

En el plan Max, Fable puede usar hasta el 50 % del límite semanal y lo consume más rápido. Conviene reservarlo para lo difícil.

### 16.2 Forma de trabajo

1. **Una feature por sesión.** Se empieza en modo plan, se revisa el plan y luego se implementa.
2. **`CLAUDE.md` en la raíz** (Anexo A) con las reglas permanentes. Claude Code lo lee en cada sesión.
3. **Este documento en `docs/`**, junto con los requerimientos y el documento maestro, para que Claude Code los consulte.
4. Al terminar cada feature: `lint`, `typecheck`, `build` y pruebas en verde → commit → *pull request*.
5. **Nunca inventar datos.** Si falta un valor, se usa un marcador `TODO(datos)` visible y se muestra "Sin evidencia".
6. Revisar visualmente cada pantalla contra el diseño de Zuleica antes de darla por terminada.

---

## 17. Orden de construcción

| Fase | Contenido | Prioridad | Listo cuando |
|---|---|---|---|
| F0 · Base | Proyecto, dependencias, tokens, fuentes, `CLAUDE.md`, `.env.example` | M | `build` pasa y se despliega en Vercel |
| F1 · Shell | Barra superior con chip de ambiente, barra lateral, panel del Equipo, rutas desde `routes.ts`, transiciones, idioma, `useScenarioParams` | M | Se navega por todas las rutas sin recargar el shell |
| F2 · Datos | Sobre común, `apiClient`, rutas `/api` simuladas, insignias de modo y evidencia | M | Las rutas responden con `data_mode: "simulation"` |
| F3 · Home | Panorama lunar, etiquetas, FUEGO de bienvenida | M | Cada etiqueta abre su módulo |
| F4 · Escenas | Plantilla común + 4 módulos con textos, telemetría, Ver detalles y visor 3D | M | Las 4 escenas tienen la misma estructura |
| F5 · Laboratorio | Mapa de inflamabilidad, margen, alertas, ficha del modelo | M | El enlace de la demo carga el escenario lunar con ALR-03 y ALR-04 |
| F6 · Guía | Biblioteca, ranking, comparador, cobertura | M | 24 fichas (o las verificadas) con fuente |
| F7 · Radar y Referencias | Grafo de brechas y página de DOIs | M | Cada nodo tiene fuente |
| F8 · Asistente | Astronauta con chat RAG, micrófono controlado (§11.3) y FUEGO como guía | M | Pasa la prueba automática de la guía y el protocolo de §11.4 |
| F9 · Extras | D²(t), llama 3D en el Laboratorio, Tierra, lecciones, progreso, mapa del sitio | S/C | — |
| F1 (incluido) · Audio | Solo la estructura del módulo `audio/`, apagada y con comentarios (§12.3). La implementación queda para después del hackathon o si sobra tiempo | W | El flag apagado no muestra nada |
| F10 · Pulido | Responsive, accesibilidad, rendimiento, textos en inglés, recorrido de la demo | M | Tres recorridos seguidos sin error |

---

## 18. Puntos abiertos

| # | Tema | Decide |
|---|---|---|
| 1 | Aprobar el nuevo contenido del Cohete y la telemetría atmosférica (§1.3, §1.4, §6.3) | Juan y Zuleica |
| 2 | Nombre visible de la plataforma: "Space Exploration Simulator" no menciona el fuego, que es el centro del reto | Equipo |
| 3 | Si FUEGO, el astronauta o los renders se hicieron con IA, agregar marca de agua o reemplazarlos | Zuleica |
| 4 | Valores exactos de los colores de alerta (§7.1) | Zuleica |
| 5 | Nombre final del repositorio | Juan |
| 6 | Modelos 3D disponibles para Cohete, Carro y Base | Ricardo |
| 7 | Nombre del astronauta asistente (sugerencia: CAPCOM) e ilustración sin logos | Zuleica |
| 8 | Datos y enlaces que cada integrante aprueba para el panel del Equipo | Cada integrante |
| 9 | Micrófono externo para la demo | Juan |
| 10 | Música: elegir pista con licencia libre, para cuando se implemente el módulo | Zuleica |

---

## Anexo A: `CLAUDE.md`

Copiar en la raíz del repositorio.

```markdown
# Flame in Freefall — instrucciones para Claude Code

Plataforma web (NASA Space Apps 2026, reto Flame in Freefall) que resume, ordena
e interpreta investigaciones de combustión en microgravedad de NASA PSI para
seguridad contra incendios en naves, estaciones, rovers y bases lunares.

## Fuentes de verdad (leer antes de cada feature)
- docs/pautas-construccion.md — cómo se construye (esta es la principal)
- docs/requerimientos-flame-in-freefall.md — qué debe hacer
- docs/documento-maestro-flame-in-freefall.md — física, datos y referencias

## Stack
Next.js (App Router) · TypeScript strict · Sass con *.module.scss · SSR ·
Zod · three.js (solo cliente) · SVG + d3-scale/d3-shape · lucide-react.
PROHIBIDO: Tailwind, Bootstrap, TanStack.

## Reglas
1. Feature first: src/features/<feature>/{components,hooks,server,lib}.
   Las páginas de src/app son delgadas.
2. Server Components por defecto; "use client" solo para interacción.
   El 3D se carga con next/dynamic y ssr:false.
3. Estado de la pantalla en query params (hook useScenarioParams + Zod).
4. Datos solo a través del servicio de cada feature y apiClient.
   Todas las respuestas usan ApiEnvelope (src/shared/types/api.ts).
   Si data_mode no es "real", mostrar DataModeBadge.
5. Estilos: tokens de src/shared/styles/_tokens.scss; nunca colores sueltos.
   Usar @use, no @import.
6. Importaciones con alias @/.
7. Componentes pequeños (≤ ~150 líneas), con JSDoc.
8. NUNCA inventar datos científicos. Sin fuente → "Sin evidencia" y TODO(datos).
9. "Sin evidencia" nunca en verde. Toda alerta: color + ícono + texto.
10. Interfaz en inglés por defecto (diccionarios en src/content/i18n).
10b. Rutas definidas una sola vez en src/content/routes.ts (barra lateral,
     /mapa y sitemap.ts las leen de ahí).
10c. El micrófono del asistente nunca envía solo: llena el campo de texto
     y la persona pulsa Enviar.
10d. Música: NO implementarla. Solo crear src/features/audio/ con su README,
     archivos vacíos con TODO(audio) y el flag NEXT_PUBLIC_ENABLE_MUSIC=false.
11. Secretos solo en el servidor; nunca en NEXT_PUBLIC_.
12. Antes de cada commit: npm run lint && npm run typecheck && npm run build.
13. Commits con Conventional Commits; una feature por rama.
```

---

## Anexo B: primer mensaje para Claude Code

```text
Lee CLAUDE.md y docs/pautas-construccion.md completos.

Vamos a construir la fase F0 y F1 de la sección 17:
1. Crea el proyecto Next.js en esta carpeta: TypeScript, ESLint, App Router,
   carpeta src/, alias @/*, SIN Tailwind.
2. Instala: sass zod three lucide-react d3-scale d3-shape react-markdown
   @google/genai; y como dependencias de desarrollo: vitest @playwright/test
   @types/three @types/d3-scale @types/d3-shape tsx.
3. Configura tsconfig (strict, noUncheckedIndexedAccess), los tokens de la
   sección 7, las fuentes, .env.example, .gitattributes y los scripts
   lint, typecheck, test.
4. Construye el shell de la sección 5: barra superior, barra lateral con los
   cinco accesos, rutas vacías del grupo (platform), template de transición,
   diccionarios EN/ES y el hook useScenarioParams.

Empieza en modo plan: muéstrame el plan antes de escribir código.
```
