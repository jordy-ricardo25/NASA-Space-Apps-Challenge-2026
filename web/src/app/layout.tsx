import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { DEFAULT_LANG } from "@/content/i18n";
import "@/shared/styles/globals.scss";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

const TITLE = "Flame in Freefall · Fire Safety Command Center";
const DESCRIPTION =
  "Mission command center that turns NASA's low-gravity combustion research into fire-safety decisions for spacecraft, stations, pressurised rovers, EVA suits and bases on the Moon and Mars.";

/** URL pública del sitio: la configurada, la de producción en Vercel o la local. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

// La imagen de la vista previa (opengraph-image.jpg y twitter-image.jpg) y el
// ícono (icon.png) se toman de los archivos de esta carpeta.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Flame in Freefall",
  authors: [{ name: "Andora Labs" }],
  keywords: ["NASA Space Apps Challenge 2026", "Flame in Freefall", "microgravity combustion", "spacecraft fire safety", "Andora Labs"],
  openGraph: {
    type: "website",
    siteName: "Flame in Freefall",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#071525", width: "device-width", initialScale: 1 };

/** Layout raíz: fuentes del sistema de diseño e idioma por defecto. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={DEFAULT_LANG} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
