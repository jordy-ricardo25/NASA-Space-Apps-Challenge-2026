"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { useActiveEnv, type ActiveEnv } from "@/features/shell/hooks/useActiveEnv";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, setPrefs } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";
import { ChatPanel } from "./ChatPanel";
import { Fuego } from "./Fuego";
import styles from "./AssistantDock.module.scss";

const TIPS: Record<Exclude<ActiveEnv["section"], "module" | "cabin">, L> = {
  home: l("¡Bienvenido al centro de mando! Selecciona uno de los módulos para iniciar tu recorrido.", "Welcome to the command centre! Select one of the modules to begin your tour."),
  modules: l("Cada módulo es un ambiente habitable del reto. Entra a su cabina para ver cómo arde el fuego allí.", "Each module is one of the challenge's habitable environments. Enter its cabin to see how fire burns there."),
  lab: l("Mueve el oxígeno y el flujo: verás si tu cabina queda dentro o fuera de la zona de fuego, y con qué margen.", "Move oxygen and flow: you'll see whether your cabin falls inside or outside the fire zone, and by what margin."),
  guide: l("Aquí están las investigaciones de NASA ordenadas según tu ambiente. Cada dato lleva su fuente.", "Here are NASA's investigations ranked for your environment. Every figure carries its source."),
  radar: l("De la evidencia a la tecnología: cada brecha tiene una misión que la cerrará.", "From evidence to technology: every gap has a mission that will close it."),
  earth: l("En la Tierra vuelvo a ser una gota amarilla: la flotabilidad me estira hacia arriba.", "On Earth I'm a yellow teardrop again: buoyancy stretches me upward."),
  refs: l("Todo número de la plataforma sale de una de estas fuentes.", "Every number on the platform comes from one of these sources."),
  settings: l("Puedes cambiar idioma, unidades y calidad del 3D. Todo se guarda solo en tu navegador.", "You can change language, units and 3D quality. Everything is stored only in your browser."),
  map: l("Con H, M, L, G, R y T saltas entre secciones; con / me abres a mí.", "Use H, M, L, G, R and T to jump between sections; / opens me."),
  other: l("¿Te ayudo a volver al centro de mando?", "Shall I help you back to the command centre?"),
};

/**
 * Puesto del asistente: la mascota FUEGO con su mensaje contextual y el chat.
 * FUEGO cambia de forma con la gravedad del ambiente activo. En las vistas 3D
 * flota abajo a la izquierda; en las pantallas de trabajo se acopla a la barra lateral.
 */
export function AssistantDock() {
  const env = useActiveEnv();
  const { t } = useLang();
  const booted = useStore(appStore, (s) => s.booted);
  const chatOpen = useStore(appStore, (s) => s.chatOpen);
  const welcomed = useStore(appStore, (s) => s.welcomed);
  const floating = env.section === "home" || env.section === "module";
  const key = `${env.section}:${env.module?.id ?? ""}`;
  // Sección cuyo mensaje ya se recogió y sección cuyo mensaje se pidió con un clic.
  const [hiddenKey, setHiddenKey] = useState<string | null>(null);
  const [askedKey, setAskedKey] = useState<string | null>(null);
  const [introDone, setIntroDone] = useState(false);
  // En las vistas 3D el mensaje aparece solo; en las pantallas de trabajo
  // espera a que pulsen la mascota, para no tapar controles ni gráficas.
  const auto = floating || env.section === "cabin";
  const bubble = askedKey === key || (auto && hiddenKey !== key);
  const intro = booted && !introDone;

  // La entrada (la llama cae y se vuelve esfera) se reproduce al terminar la carga.
  useEffect(() => {
    if (!booted) return;
    const id = setTimeout(() => setIntroDone(true), 2400);
    return () => clearTimeout(id);
  }, [booted]);

  // Cada sección trae un mensaje nuevo, que se recoge solo tras unos segundos.
  useEffect(() => {
    if (!booted || (env.section === "home" && !welcomed)) return;
    const id = setTimeout(() => {
      setHiddenKey(key);
      setAskedKey(null);
    }, env.section === "home" ? 12000 : 9000);
    return () => clearTimeout(id);
  }, [key, env.section, welcomed, booted, askedKey]);

  if (!booted) return null;
  const message = env.section === "module" ? env.module!.guide : env.section === "cabin" ? env.module!.cabinGuide : TIPS[env.section];
  const dismiss = (): void => {
    setHiddenKey(key);
    setAskedKey(null);
    if (env.section === "home") setPrefs({ welcomed: true });
  };
  const open = (): void => appStore.set({ chatOpen: true });

  return (
    <>
      <div className={`${styles.dock} ${floating ? styles.floating : styles.docked} ${env.section === "cabin" ? styles.cabin : ""}`}>
        <button type="button" className={styles.mascot} onClick={() => (bubble ? open() : setAskedKey(key))} aria-label={t(l("Asistente FUEGO", "FUEGO assistant"))}>
          <Fuego gravity={env.g} size={floating ? (env.section === "home" ? 92 : 68) : 44} intro={intro} mood={chatOpen ? "happy" : "idle"} />
        </button>
        {bubble && !chatOpen && (
          <div className={styles.bubble} role="status">
            <span className={styles.who}>FUEGO</span>
            <p>{t(message)}</p>
            <div className={styles.actions}>
              <button type="button" onClick={open}>
                <MessageCircle size={13} />
                {t(l("Pregúntame", "Ask me"))}
              </button>
            </div>
            <button type="button" className={styles.close} onClick={dismiss} aria-label={t(l("Cerrar mensaje", "Dismiss message"))}>
              <X size={13} />
            </button>
          </div>
        )}
      </div>
      {chatOpen && <ChatPanel env={env} />}
    </>
  );
}
