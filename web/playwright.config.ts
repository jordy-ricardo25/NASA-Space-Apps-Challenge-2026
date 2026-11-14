import { defineConfig } from "@playwright/test";

/**
 * Recorrido de la demo (pautas §13.3). Usa el Chrome instalado y levanta la
 * plataforma compilada: `npm run build && npm run e2e`.
 */
export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  timeout: 90_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ["--enable-gpu", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
