# Módulo de audio (música ambiental) — estructura lista, sin implementar

Este módulo está **apagado** (`NEXT_PUBLIC_ENABLE_MUSIC=false`). Con el flag apagado no se
muestra ningún botón ni se carga ningún audio. Ninguna otra feature importa nada de aquí salvo
el shell (`AudioProvider`).

## Cómo implementarlo después

| Paso | Qué hacer |
|---|---|
| 1. Pista | Elegir música ambiental con licencia libre (dominio público, sonidos públicos de NASA o CC0). Comprimirla (≤ 2 MB, `.mp3` u `.ogg`) y guardarla en `public/audio/`. Registrar origen y licencia en `/referencias`. |
| 2. Reproducción | En `useAmbientAudio`, crear un único `HTMLAudioElement` en bucle, **solo después de que el usuario pulse el botón** (los navegadores bloquean el audio automático). |
| 3. Preferencia | Guardar activada/silenciada y el volumen en `localStorage` (con `try/catch`). Música apagada en la primera visita. |
| 4. Bajar volumen | Exponer `duck()` y `unduck()` en el contexto. El asistente llama a `duck()` cuando habla o cuando el micrófono escucha. |
| 5. Ajustes | Agregar en `/ajustes` el interruptor y el control de volumen, leyendo del mismo contexto. |
| 6. Accesibilidad | Botón con `aria-pressed` y etiqueta "Music on/off". |
| 7. Sonidos de interfaz (opcional) | Clic al navegar y tono al aparecer una alerta, con el mismo interruptor. |
| 8. Activar | Cambiar `NEXT_PUBLIC_ENABLE_MUSIC=true` y volver a desplegar. |
