import type { NextConfig } from "next";

/**
 * Configuración de Next.js.
 * Se usa el modelo clásico del App Router (sin Cache Components): las páginas
 * que leen `searchParams` se renderizan en el servidor en cada petición (SSR).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  sassOptions: {
    // Permite `@use "tokens"` / `@use "mixins"` desde cualquier módulo SCSS.
    loadPaths: ["./src/shared/styles"],
  },
};

export default nextConfig;
