"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/content/routes";
import { AssistantDock } from "@/features/assistant";
import { AudioProvider } from "@/features/audio";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, loadPrefs } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";
import { LoadingScreen } from "./LoadingScreen";
import { SideBar } from "./SideBar";
import { StageBridge } from "./StageBridge";
import { TeamPanel } from "./TeamPanel";
import { TopBar } from "./TopBar";
import styles from "./CommandShell.module.scss";

// El mundo 3D solo existe en el navegador: nunca se renderiza en el servidor.
const WorldStage = dynamic(() => import("@/features/world/components/WorldStage"), { ssr: false });

/**
 * Contenedor del centro de mando. Mantiene vivos el mundo 3D, las barras y el
 * asistente mientras las rutas cambian solo los paneles (`children`).
 * Toda la plataforma ocupa una sola pantalla (100vh) sin desplazamiento.
 */
export function CommandShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t, lang } = useLang();
  const reduceMotion = useStore(appStore, (s) => s.reduceMotion);
  const toast = useStore(appStore, (s) => s.toast);
  const noWebgl = useStore(appStore, (s) => s.noWebgl);

  useEffect(() => {
    loadPrefs();
    let alive = true;
    const ping = (): void => {
      fetch("/api/health")
        .then((r) => alive && appStore.set({ online: r.ok }))
        .catch(() => alive && appStore.set({ online: false }));
    };
    ping();
    const id = setInterval(ping, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [lang, reduceMotion]);

  // Atajos de teclado: H, M, L, G, R, T navegan; "/" abre el asistente; Esc cierra paneles.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (e.key === "Escape") {
        appStore.set({ chatOpen: false, teamOpen: false });
        return;
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        appStore.set({ chatOpen: true });
        return;
      }
      const route = ROUTES.find((r) => r.key && r.key.toLowerCase() === e.key.toLowerCase());
      if (route) router.push(route.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <AudioProvider>
      <div className={styles.shell}>
        <WorldStage />
        {noWebgl && <div className={styles.fallback} aria-hidden="true" />}
        <div className={styles.vignette} aria-hidden="true" />
        <TopBar />
        <SideBar />
        <main className={styles.content}>{children}</main>
        <Suspense fallback={null}>
          <StageBridge />
          <AssistantDock />
        </Suspense>
        <TeamPanel />
        <div className={`${styles.toast} ${toast ? styles.toastOn : ""}`} role="status" aria-live="polite">
          {toast ? t(toast) : ""}
        </div>
        <LoadingScreen />
      </div>
    </AudioProvider>
  );
}
