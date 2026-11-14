"use client";

import { useCallback } from "react";
import type { L, Lang } from "@/content/i18n";
import { appStore } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";

/**
 * Idioma activo y traductor de textos bilingües.
 * @returns `lang` y `t(texto)`, que devuelve la versión del idioma activo.
 */
export function useLang(): { lang: Lang; t: (v: L) => string } {
  const lang = useStore(appStore, (s) => s.lang);
  const t = useCallback((v: L) => v[lang], [lang]);
  return { lang, t };
}
