# Flamey con el modelo del equipo en Ollama

Guía para conectar el front de Flame in Freefall (`web/`, rama `dev/juan`) con
el modelo que corre en Ollama. El front no cambia: solo se configura el servidor
de Next.js con variables de entorno.

## Cómo queda conectado

```
Navegador ──POST /api/asistente/chat──> Next.js (servidor) ──POST /api/chat──> Ollama
```

- El navegador nunca habla con Ollama. Lo hace el servidor de Next.js, así que
  no hace falta CORS ni exponer nada al público salvo que el sitio esté en Vercel.
- Flamey envía instrucciones cortas en el idioma de la pregunta (español o
  inglés) y los datos ya calculados (fichas verificadas, resultado del motor
  físico o hallazgo de NASA PSI). El modelo solo los redacta: no calcula cifras.
- Los ajustes son los del proyecto `flameynasa`: temperatura 0, respuesta
  corta, el modelo queda cargado 15 minutos, se prefiere `qwen2.5` y una
  negativa del modelo ("Lo siento…") se descarta.
- La voz no cambia: el micrófono llena la pregunta y la respuesta se lee en voz
  alta igual, venga de Ollama, de Gemini o de una ficha.
- Orden de proveedores: Ollama → Gemini (si hay `GEMINI_API_KEY`) → fichas
  verificadas. Si Ollama está apagado, el chat sigue respondiendo.

Código: `src/features/assistant/server/ollama.ts` (cliente) y
`src/features/assistant/server/assistant.service.ts` (`askModel`).

## Pasos en la máquina que tiene el modelo

1. Traer el front:

   ```bash
   git fetch origin
   git checkout dev/juan
   cd web
   npm install
   ```

2. Comprobar que Ollama responde y ver el nombre exacto del modelo:

   ```bash
   ollama list
   curl http://localhost:11434/api/tags
   ```

3. Crear `web/.env.local` (copiar `.env.example`) y poner:

   ```
   OLLAMA_BASE_URL=http://localhost:11434
   ```

   Con eso basta: el modelo se elige solo entre los instalados (`qwen2.5`
   primero). Opcionales: `OLLAMA_MODEL` (para fijar uno), `OLLAMA_TIMEOUT_MS`
   (25000), `OLLAMA_NUM_CTX` (2048), `OLLAMA_NUM_PREDICT` (260) y
   `OLLAMA_API_KEY` (si hay un proxy con Bearer delante).

4. Levantar y probar:

   ```bash
   npm run dev
   ```

   - `http://localhost:3000/api/health` debe mostrar `"assistant": { ..., "model": "ollama" }`.
   - En el chat de Flamey, preguntar algo que no sea una pregunta preparada
     (por ejemplo: "¿Qué midió BASS-II y qué limitación tiene?").
   - La terminal de Next.js escribe una línea `[asistente] ... modelo=ollama:<modelo>`
     y otra con el tiempo de respuesta, o el error si falló.

## Qué pregunta llega al modelo y cuál no

| Caso | ¿Llama a Ollama? |
| --- | --- |
| Pregunta preparada (botones rápidos, FAQ) | No: respuesta aprobada al instante |
| "¿Arde el PMMA aquí?" con escenario activo | No: cifra del motor físico |
| "Explícame este resultado" (pestaña de materiales) | Sí, con el resultado del motor |
| Pregunta sobre un hallazgo de PSI fijado en la Guía | Sí, con factores y filas del CSV |
| Pregunta libre con fichas relacionadas | Sí, con una o dos fichas como datos |
| Pregunta sin ninguna ficha relacionada | No: "Sin evidencia" |

Ollama no tiene el buscador de documentos (File Search) de Gemini. Con Ollama
el contexto son las fichas de `src/content/knowledge.ts` y las de investigaciones.

## Requisitos del modelo

- Recibe las instrucciones en el idioma de la pregunta (español o inglés) y
  responde en ese idioma con una sola petición.
- Debe responder en menos de 25 s (el chat corta a los 30 s). En CPU conviene un
  modelo pequeño o cuantizado; la primera respuesta tarda más porque carga el modelo.
- Si el modelo trae su propio `SYSTEM` en el Modelfile, el mensaje de sistema
  que envía Flamey lo sustituye en cada petición.
- Si no encuentra la respuesta, las instrucciones le piden empezar con
  `[NO_EVIDENCE]`; Flamey entonces muestra la ficha verificada o "Sin evidencia".

## Diferencias con el proyecto flameynasa

| | flameynasa | Flame in Freefall |
| --- | --- | --- |
| Quién llama a Ollama | El navegador (`NEXT_PUBLIC_OLLAMA_URL`) | El servidor de Next.js (`OLLAMA_BASE_URL`) |
| Respuesta | Por fragmentos (streaming) | Completa, y después se lee en voz alta |
| Cifras de materiales | Tabla LOI propia del widget | Motor físico de la plataforma, con fuentes |
| Si Ollama falla | Texto fijo del widget | Gemini y, después, fichas verificadas |

Como el servidor hace la llamada, la dirección del modelo no queda expuesta en
el navegador y el sitio funciona en cualquier equipo, no solo en el que tiene Ollama.

## Para producción (Vercel)

Vercel no alcanza `localhost` de nadie. Hace falta una URL pública con HTTPS:

1. Subir Ollama a un servidor (o abrir un túnel, por ejemplo Cloudflare Tunnel)
   con `OLLAMA_HOST=0.0.0.0`.
2. Poner delante un proxy inverso que exija `Authorization: Bearer <clave>`;
   Ollama no trae autenticación propia.
3. En Vercel → Settings → Environment Variables: `OLLAMA_BASE_URL`,
   `OLLAMA_MODEL` y `OLLAMA_API_KEY`. Nunca con el prefijo `NEXT_PUBLIC_`.
4. Volver a desplegar y revisar `/api/health`.

Mientras eso no exista, producción sigue con Gemini: basta con dejar
`OLLAMA_BASE_URL` vacío.

## La sección "Analista PSI" (`/flamey`)

Es la pantalla que recrea el proyecto `flameynasa` dentro de la plataforma, sin
tocar el Flamey general (que sigue con Gemini primero y Ollama de respaldo).

- **Ambientes** (izquierda): los cinco del backend, con gravedad, oxígeno y presión.
- **Ranking PSI** (derecha): hallazgos por RPI con los factores que más aportan
  y el botón "Interpretar".
- **Flamey** (centro), con tres pestañas: la conversación (texto o voz, con
  memoria de los últimos 6 turnos), "Variar parámetros" (motor físico de la
  plataforma) y "Mitos y hechos".
- **Quién responde** (arriba): "Rápido (sin modelo)" o cualquiera de los
  modelos instalados en Ollama. Si Ollama no responde, queda el modo rápido.

Rutas: `POST /api/asistente/local` (chat; `engine: "local" | "fast"` y `model`),
`GET /api/asistente/local` (modelos instalados) y
`GET /api/asistente/conocimiento` (la base de conocimiento en JSON: fichas,
investigaciones, mitos y preguntas con respuesta aprobada, cada una con su fuente).

Controles sobre lo que escribe el modelo. Si falla alguno, se muestra la
respuesta calculada y se marca como "Cifras calculadas, sin modelo":

1. Una negativa ("Lo siento…") se descarta.
2. Una cifra que no estaba en los datos descarta la respuesta.
3. La explicación de un hallazgo debe citar al menos una cifra de los datos.
