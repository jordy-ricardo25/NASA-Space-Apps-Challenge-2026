import type { Metadata } from "next";
import { SiteMapView } from "@/features/sitemap/components/SiteMapView";

export const metadata: Metadata = { title: "Site map · Flame in Freefall" };

/** Mapa del sitio: secciones por objetivo del reto y atajos de teclado. */
export default function SiteMapPage() {
  return <SiteMapView />;
}
