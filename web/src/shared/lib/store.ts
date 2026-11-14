"use client";

import { useSyncExternalStore } from "react";

/**
 * Almacén mínimo de estado (sin dependencias) compatible con React 19.
 * Lo comparten la interfaz (React) y el motor 3D (three.js, fuera de React).
 *
 * Regla: los selectores deben devolver primitivas o referencias estables del
 * estado (nunca objetos creados en el momento), para no provocar renders en bucle.
 */
export interface Store<T> {
  /** Estado actual. */
  get: () => T;
  /** Estado inicial (el mismo que usó el servidor al renderizar). */
  initial: () => T;
  /** Mezcla un parche con el estado y avisa a los suscriptores. */
  set: (patch: Partial<T> | ((s: T) => Partial<T>)) => void;
  /** Se suscribe a cualquier cambio; devuelve la función para cancelar. */
  subscribe: (fn: () => void) => () => void;
}

/** Crea un almacén con el estado inicial indicado. */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    initial: () => initial,
    set: (patch) => {
      const next = typeof patch === "function" ? patch(state) : patch;
      state = { ...state, ...next };
      subs.forEach((fn) => fn());
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

/** Lee una porción del almacén y vuelve a renderizar cuando cambia. */
export function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    // Durante la hidratación se usa el estado inicial, igual que en el servidor;
    // React actualiza después con el valor real. Evita desajustes de hidratación.
    () => selector(store.initial()),
  );
}
