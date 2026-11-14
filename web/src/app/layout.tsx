import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { DEFAULT_LANG } from "@/content/i18n";
import "@/shared/styles/globals.scss";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Flame in Freefall · Fire Safety Command Center",
  description:
    "Mission command center that turns NASA's low-gravity combustion research into fire-safety decisions for spacecraft, stations, pressurised rovers and lunar bases.",
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
