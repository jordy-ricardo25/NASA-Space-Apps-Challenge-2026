/**
 * Textos del estado del micrófono y de los errores del reconocimiento de voz.
 * Las claves son los códigos de la Web Speech API y los propios de useDictation.
 */
import { l, type L } from "@/content/i18n";

export const DICTATION_NOTICE: Record<string, L> = {
  "not-allowed": l("Permiso del micrófono denegado. Actívalo en el candado de la barra de direcciones y vuelve a pulsar el micrófono.", "Microphone permission denied. Allow it from the padlock in the address bar and press the microphone again."),
  "service-not-allowed": l("El navegador no permite el dictado en esta página. Usa Chrome o Edge.", "The browser does not allow dictation on this page. Use Chrome or Edge."),
  "audio-capture": l("No se encontró ningún micrófono. Conecta uno y vuelve a intentarlo.", "No microphone was found. Connect one and try again."),
  network: l("El servicio de dictado del navegador no respondió. Necesita internet y funciona en Chrome o Edge.", "The browser dictation service did not respond. It needs internet and works in Chrome or Edge."),
  // Brave desactiva el servicio de dictado de Chromium: el error llega como "network".
  "network-brave": l("Brave bloquea el dictado del navegador. Para dictar usa Chrome o Edge; aquí puedes escribir la pregunta.", "Brave blocks the browser dictation service. Use Chrome or Edge to dictate; here you can type the question."),
  "no-speech": l("No se oyó ninguna voz. Acércate al micrófono y vuelve a pulsarlo.", "No speech was heard. Move closer to the microphone and press it again."),
  "language-not-supported": l("El reconocimiento no admite este idioma de escucha.", "Recognition does not support this listening language."),
  "ended-early": l("El reconocimiento se cerró nada más abrirse. Revisa el permiso y el micrófono elegido en el navegador.", "Recognition closed as soon as it opened. Check the permission and the microphone selected in the browser."),
  "start-failed": l("No se pudo abrir el micrófono. Vuelve a pulsarlo.", "The microphone could not be opened. Press it again."),
  timeout: l("La escucha se apagó sola a los 30 s. Revisa el texto y pulsa Enviar.", "Listening stopped by itself after 30 s. Check the text and press Send."),
  stopped: l("Escucha detenida. Revisa el texto y pulsa Enviar.", "Listening stopped. Check the text and press Send."),
  "stopped-empty": l("Escucha detenida: no llegó ningún texto.", "Listening stopped: no text was received."),
};

export const DICTATION_UNKNOWN = l("El reconocimiento de voz falló.", "Speech recognition failed.");

export const DICTATION_PHASE = {
  starting: l("Abriendo el micrófono…", "Opening the microphone…"),
  waiting: l("Micrófono abierto: esperando tu voz…", "Microphone open: waiting for your voice…"),
  hearing: l("Te escucho: el texto aparece en el campo…", "Listening: the text appears in the field…"),
} as const;

export const VOICE_TEXT = {
  ready: l("Micrófono listo. Llena el campo; tú pulsas Enviar.", "Microphone ready. It fills the field; you press Send."),
  readyAuto: l("Micrófono listo. Al terminar de hablar, la pregunta se envía sola.", "Microphone ready. When you stop talking, the question is sent automatically."),
  autoSend: l("Envío automático", "Auto-send"),
  autoSendOn: l("Envío automático activado: la pregunta se envía al terminar de hablar", "Auto-send is on: the question is sent when you stop talking"),
  autoSendOff: l("Envío automático apagado: el dictado solo llena el campo", "Auto-send is off: dictation only fills the field"),
  brave: l("En Brave el dictado no funciona: usa Chrome o Edge, o escribe la pregunta.", "Dictation does not work in Brave: use Chrome or Edge, or type the question."),
  unsupported: l("Este navegador no ofrece dictado: escribe tu pregunta. Funciona en Chrome y Edge.", "This browser has no dictation: type your question. It works in Chrome and Edge."),
  speaking: l("Leyendo la respuesta. El micrófono se activa al terminar.", "Reading the answer aloud. The microphone is available when it ends."),
  stop: l("Detener", "Stop"),
  stopVoice: l("Detener la voz", "Stop the voice"),
  listenLang: l("Idioma del dictado por voz (no traduce las respuestas)", "Voice dictation language (it does not translate answers)"),
  listenShort: l("Dictado en", "Dictate in"),
  autoRead: l("Lectura automática", "Read aloud"),
  autoOn: l("Lectura automática activada: pulsa para silenciarla", "Read aloud is on: press to mute it"),
  autoOff: l("Lectura automática silenciada: pulsa para activarla", "Read aloud is muted: press to turn it on"),
  aiVoice: l("Voz generada con IA (Fish Audio)", "AI-generated voice (Fish Audio)"),
} as const;
