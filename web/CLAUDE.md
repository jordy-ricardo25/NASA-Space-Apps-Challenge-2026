# Flame in Freefall — instrucciones para Claude Code

Plataforma web (NASA Space Apps 2026, reto Flame in Freefall) que resume, ordena
e interpreta investigaciones de combustión en microgravedad de NASA PSI para
seguridad contra incendios en naves, estaciones, rovers, trajes EVA y bases
en la Luna y Marte. Documentación completa: docs/documentacion-proyecto.md.

@AGENTS.md

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
   El 3D solo se importa en el navegador (next/dynamic con ssr:false).
3. Estado de la pantalla en query params.
4. Datos solo a través del servicio de cada feature.
   Todas las respuestas usan ApiEnvelope (src/shared/types/api.ts).
5. Estilos: tokens de src/shared/styles/_tokens.scss; nunca colores sueltos.
   Usar @use, no @import. En CSS Modules todo selector lleva una clase local.
6. Importaciones con alias @/.
7. Componentes pequeños, con JSDoc.
8. NUNCA inventar datos científicos. Sin fuente → "Sin evidencia".
9. "Sin evidencia" nunca en verde. Toda alerta: color + ícono + texto.
10. Rutas definidas una sola vez en src/content/routes.ts.
11. Textos bilingües con l("es", "en") en src/content.
12. El micrófono del asistente nunca envía solo: llena el campo de texto.
13. Música: NO implementarla (src/features/audio está apagado a propósito).
14. Secretos solo en el servidor; nunca en NEXT_PUBLIC_.

## Decisiones del equipo sobre la experiencia
- Centro de mando en una sola pantalla: 100vh, sin desplazamiento de página ni
  ventanas nuevas. Las listas largas se paginan.
- Un único mundo 3D persistente (src/features/world); las rutas solo cambian
  los paneles. Toda vista 3D se puede girar, desplazar y acercar con el ratón.
- Las gráficas se dibujan al tamaño real de su panel (hook useSize) con texto
  de 12 px o más.
- La interfaz no usa las palabras "simulación" ni "demo": los resultados del
  modelo físico se presentan con su intervalo y su nivel de evidencia.
- La mascota y asistente es Flamey: una llama que cae y se vuelve esfera.

## Antes de dar algo por terminado
npm run check (lint, typecheck, pruebas y build) y revisar la pantalla en
Chrome a 1440×900: sin errores de consola y sin desplazamiento.
