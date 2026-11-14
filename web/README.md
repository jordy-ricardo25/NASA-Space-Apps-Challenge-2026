# Flame in Freefall · Centro de mando de seguridad contra incendios

Plataforma web para el reto **Flame in Freefall** (NASA Space Apps Challenge 2026).
Convierte décadas de experimentos de combustión en microgravedad de NASA (PSI) en
decisiones de seguridad contra incendios para naves, estaciones, rovers presurizados
y bases lunares.

Toda la aplicación es un **centro de mando en una sola pantalla** (100vh, sin
desplazamiento): un mundo 3D persistente y paneles que cambian con la ruta.

## Puesta en marcha

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
| `npm run build` y `npm run start` | Compilación y servidor de producción |
| `npm run lint` · `npm run typecheck` · `npm run test` | Calidad: ESLint, TypeScript y pruebas unitarias (Vitest) |
| `npm run check` | Todo lo anterior más la compilación |
| `npm run e2e` | Recorrido de la demo con Playwright (requiere `npm run build` antes) |
| `npm run bake` | Optimiza un modelo `.glb` de NASA para la web (`scripts/bake-model.mjs`) |
| `npm run thumbs` | Regenera las miniaturas de `/modulos` desde la plataforma en marcha |

Variables de entorno: copiar `.env.example` como `.env.local`. Ninguna es obligatoria.

## Qué incluye

| Ruta | Pantalla | Objetivo del reto |
|---|---|---|
| `/` | Sitio lunar 3D con los cuatro ambientes habitables | — |
| `/modulos` | Tarjetas de módulos y herramientas | — |
| `/modulos/[id]` | Escena del ambiente (nave, estación, rover, base) | Selector de contexto |
| `/modulos/[id]?view=cabina` | Cabina: llama en tiempo real, telemetría y respuesta de la tripulación | O2 |
| `/laboratorio` | Mapa de inflamabilidad, gotas (ley d²), humo y CO de cabina | O2 |
| `/guia` | Biblioteca PSI, ranking por ambiente, comparador, cobertura y lecciones | O1 |
| `/radar` | Evidencia → hallazgo → brecha → tecnología y mapa de brechas | O3 |
| `/tierra` | Transferencia tecnológica a la Tierra | O4 |
| `/referencias` | Fuentes, licencias y uso de IA | — |
| `/ajustes` · `/mapa` | Preferencias y mapa del sitio | — |

- **Vistas 3D**: arrastrar para girar, rueda para acercar y clic derecho (o Mayús + arrastrar) para desplazar.
- **Atajos**: `H` inicio · `M` módulos · `L` laboratorio · `G` guía · `R` radar · `T` Tierra · `/` asistente · `Esc` cierra paneles.
- **FUEGO**, la mascota y asistente: una llama con carita que cae y se vuelve esfera; su forma sigue la gravedad del ambiente activo.

## Arquitectura

Sigue `docs/pautas-construccion.md`: Next.js (App Router) · TypeScript estricto ·
Sass con CSS Modules · SSR · Zod · three.js solo en el navegador · gráficas SVG
propias con `d3-scale` y `d3-shape`. Sin Tailwind, Bootstrap ni TanStack.

```
src/
├── app/            Rutas delgadas y Route Handlers de /api
├── features/       Una carpeta por funcionalidad (feature first)
│   ├── world/      Mundo 3D persistente: sitio lunar, cabinas y llama volumétrica
│   ├── fire/       Motor físico de orden reducido (con pruebas contra la literatura)
│   ├── scene/      Escena de cada módulo y consola de cabina
│   ├── laboratory/ Mapa de inflamabilidad y gráficas
│   ├── investigations/ · radar/ · earth/ · references/
│   ├── assistant/  Mascota FUEGO y chat con fuentes
│   └── shell/      Barras, pantalla de carga y contenedor
├── shared/         Componentes, hooks, estilos (tokens) y utilidades
└── content/        Textos y catálogos tipados (ES/EN), con su fuente
```

- El estado de cada pantalla vive en los **query params** (se puede compartir un escenario exacto).
- Las peticiones pasan por `/api` con un sobre común (`src/shared/types/api.ts`); conectar el backend real no obliga a tocar componentes.
- Los modelos 3D son de [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources), reducidos con `scripts/bake-model.mjs`.

## Rigor científico

- Cada cifra enlaza a su fuente (DOI o NTRS) y cada resultado lleva su nivel de evidencia (A, B, C, D o ∅).
- "Sin evidencia" nunca se muestra en verde ni como riesgo bajo.
- En gravedad parcial no hay datos directos en PSI: la plataforma lo declara (alerta ALR-04) y usa el límite más conservador.
- El motor físico se verifica con `npm run test` contra valores publicados (Saffire, BASS-II, FLEX, entre otros).

## Créditos y licencia

Proyecto independiente para NASA Space Apps. Usa datos y modelos abiertos de NASA;
no implica aval de NASA. Código bajo licencia MIT; terceros en `NOTICE`.
