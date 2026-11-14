"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getModule } from "@/content/modules";
import { parseScenario, toSimConfig } from "@/features/scene/lib/scenario";
import { worldCtl } from "@/features/world/controller";
import type { ViewState } from "@/features/world/engine/World";

/**
 * Traduce la ruta actual en una vista del mundo 3D y en la configuración del
 * motor físico. No dibuja nada: solo sincroniza URL → mundo.
 */
export function StageBridge() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const query = sp.toString();

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const m = parts[0] === "modulos" ? getModule(parts[1]) : undefined;
    const wide = window.innerWidth >= 1180;
    let view: ViewState = { mode: "ambient", module: null, shiftX: 0, shiftY: 0 };
    if (pathname === "/") view = { mode: "overview", module: null, shiftX: -20, shiftY: 0 };
    else if (m) {
      const s = parseScenario(m, new URLSearchParams(query));
      view =
        s.view === "cabina"
          ? { mode: "cabin", module: m.id, shiftX: wide ? -10 : 0, shiftY: wide ? 70 : 40 }
          : { mode: "focus", module: m.id, shiftX: wide ? 150 : 0, shiftY: wide ? 20 : 60 };
      worldCtl.configure(toSimConfig(m, s));
    }
    worldCtl.setView(view);
  }, [pathname, query]);

  return null;
}
