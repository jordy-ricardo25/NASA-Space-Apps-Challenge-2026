import { defineConfig } from "@playwright/test";

/**
 * Recorrido de la demo (pautas §13.3). Usa el Chrome instalado y levanta la
 * plataforma compilada: `npm run build && npm run e2e`.
 */
// Puerto configurable (E2E_PORT) por si el 3000 ya lo ocupa el servidor de desarrollo.
const PORT = process.env.E2E_PORT ?? "3000";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  timeout: 90_000,
  retries: 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ["--enable-gpu", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
