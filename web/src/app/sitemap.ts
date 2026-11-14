import type { MetadataRoute } from "next";
import { MODULES } from "@/content/modules";
import { MODULE_ROUTE, ROUTES } from "@/content/routes";

/** sitemap.xml generado a partir de la lista única de rutas. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = [...ROUTES.map((r) => r.href), ...MODULES.map((m) => MODULE_ROUTE(m.id))];
  return paths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 }));
}
