"use client";

/**
 * Puente entre la interfaz (React) y el mundo 3D (three.js).
 * Los componentes nunca importan three.js: envían órdenes a través de este
 * controlador, que las reenvía al mundo cuando existe.
 */
import type { ModuleId } from "@/content/modules";
import type { ActionKey, SimConfig } from "@/features/fire/engine/sim";
import { createStore } from "@/shared/lib/store";
import type { ViewState, World } from "./engine/World";

let world: World | null = null;
let pendingView: ViewState | null = null;
let pendingCfg: SimConfig | null = null;

/** Estado visible del mundo 3D para la interfaz. */
export const worldStore = createStore<{ hovered: ModuleId | null; rotating: boolean; tracers: boolean }>({
  hovered: null,
  rotating: true,
  tracers: true,
});

/** Registra (o libera) la instancia del mundo. */
export function bindWorld(w: World | null): void {
  world = w;
  if (w) {
    if (pendingView) w.setView(pendingView);
    if (pendingCfg) w.configure(pendingCfg);
  }
}

export const worldCtl = {
  setView(v: ViewState): void {
    pendingView = v;
    world?.setView(v);
  },
  configure(cfg: SimConfig): void {
    pendingCfg = cfg;
    world?.configure(cfg);
  },
  hover: (id: ModuleId | null): void => world?.setHover(id),
  zoom: (dir: 1 | -1): void => world?.zoom(dir),
  resetCamera: (): void => world?.resetCamera(),
  toggleRotate(): void {
    if (world) worldStore.set({ rotating: world.toggleRotate() });
  },
  toggleTracers(): void {
    const tracers = !worldStore.get().tracers;
    worldStore.set({ tracers });
    world?.setTracers(tracers);
  },
  ignite: (): boolean => world?.ignite() ?? false,
  action: (key: ActionKey): void => world?.action(key),
  resetFire: (): void => world?.resetFire(),
};
