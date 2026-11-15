"use client";

/**
 * Conversación con Flamey. Vive fuera del componente del chat para que no se
 * pierda al cerrarlo o al cambiar de pantalla: la persona vuelve y sigue
 * donde estaba. Solo existe en la memoria de la pestaña; al recargar empieza
 * de nuevo (la plataforma no guarda conversaciones).
 */
import type { Lang } from "@/content/i18n";
import { createStore } from "@/shared/lib/store";
import type { EvidenceLevel } from "@/shared/types/api";

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  origin?: "prepared" | "analysis" | "documents" | "psi" | "none";
  citations?: { id: string; short: string; url: string }[];
  evidence?: EvidenceLevel;
  /** Filas del CSV de NASA PSI que respaldan la respuesta. */
  rows?: { file: string; row: number; quality: number }[];
}

export type ChatTab = "chat" | "material";

interface ChatState {
  /** Pestaña del panel: la conversación o la prueba de materiales. */
  tab: ChatTab;
  /** La pestaña de materiales ya se abrió: se mantiene montada para no perder lo elegido. */
  materialSeen: boolean;
  messages: ChatMessage[];
  /** Idioma de la conversación: el de la primera respuesta. */
  lang: Lang | null;
}

/** Mensajes que se conservan; los más antiguos se descartan. */
const MAX_MESSAGES = 60;

export const chatStore = createStore<ChatState>({ tab: "chat", materialSeen: false, messages: [], lang: null });

/** Añade un mensaje al final de la conversación. */
export function pushMessage(message: ChatMessage): void {
  chatStore.set((s) => ({ messages: [...s.messages, message].slice(-MAX_MESSAGES) }));
}

/** Cambia de pestaña en el panel del asistente. */
export function showTab(tab: ChatTab): void {
  chatStore.set(tab === "material" ? { tab, materialSeen: true } : { tab });
}

/** Empieza una conversación nueva. */
export function clearChat(): void {
  chatStore.set({ messages: [], lang: null });
}
