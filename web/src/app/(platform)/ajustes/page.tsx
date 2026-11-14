import type { Metadata } from "next";
import { SettingsView } from "@/features/preferences/components/SettingsView";

export const metadata: Metadata = { title: "Settings · Flame in Freefall" };

/** Ajustes: idioma, unidades, calidad del 3D, movimiento y rol de uso. */
export default function SettingsPage() {
  return <SettingsView />;
}
