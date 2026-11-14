import { expect, test, type Page } from "@playwright/test";

/** Espera a que termine la pantalla de carga (motor 3D y modelos listos). */
async function booted(page: Page): Promise<void> {
  await expect(page.locator("[role=status][aria-label*='%']")).toHaveCount(0, { timeout: 60_000 });
}

/** La página nunca se desplaza: todo cabe en una sola pantalla. */
async function expectNoScroll(page: Page): Promise<void> {
  const [sh, ih, sw, iw] = await page.evaluate(() => [document.documentElement.scrollHeight, innerHeight, document.documentElement.scrollWidth, innerWidth]);
  expect(sh).toBeLessThanOrEqual(ih);
  expect(sw).toBeLessThanOrEqual(iw);
}

const ROUTES = ["/", "/modulos", "/modulos/nave", "/modulos/estacion", "/modulos/rover", "/modulos/base", "/modulos/base?view=cabina", "/laboratorio", "/laboratorio?tab=droplet", "/laboratorio?tab=smoke", "/laboratorio?tab=cabin", "/guia", "/guia?tab=ranking", "/guia?tab=compare", "/guia?tab=coverage", "/guia?tab=history", "/radar", "/radar?tab=gaps", "/tierra", "/referencias", "/ajustes", "/mapa"];

test("todas las rutas cargan sin errores de consola ni desplazamiento", async ({ page }) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`${page.url()} · ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => problems.push(`${page.url()} · ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
  for (const route of ROUTES) {
    await page.goto(route);
    await booted(page);
    await page.waitForTimeout(700);
    await expectNoScroll(page);
  }
  expect(problems).toEqual([]);
});

test("recorrido de la demo: inicio → base lunar → cabina → fuego → laboratorio → asistente", async ({ page }) => {
  await page.goto("/");
  await booted(page);

  // Inicio → módulo (navegación sin recargar el centro de mando)
  // Fila del tablero de ambientes (la etiqueta sobre el 3D lleva al mismo sitio).
  await page.getByRole("link", { name: /SPX-004/ }).last().click();
  await expect(page).toHaveURL(/\/modulos\/base/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Base lunar|Lunar base/);

  // Entrar a la cabina y encender la muestra
  await page.getByRole("button", { name: /ENTRAR A LA CABINA|ENTER THE CABIN/i }).click();
  await expect(page).toHaveURL(/view=cabina/);
  await page.getByRole("button", { name: /ENCENDER|IGNITE/i }).click();
  await expect(page.getByText(/EN LLAMA|BURNING/i).first()).toBeVisible({ timeout: 20_000 });
  // La gravedad parcial siempre avisa de la falta de datos directos (ALR-04).
  await expect(page.getByText("ALR-04").first()).toBeVisible();

  // Laboratorio con el escenario lunar en la URL
  await page.goto("/laboratorio?env=base&mat=pmma&o2=34&p=56.5&flow=10");
  await booted(page);
  await expect(page.getByText("ALR-03").first()).toBeVisible();
  await expect(page.getByText("ALR-04").first()).toBeVisible();

  // Asistente: una pregunta preparada responde con su origen
  await page.keyboard.press("/");
  await page.getByRole("button", { name: /esférica|spherical/i }).click();
  await expect(page.getByText(/difusión|diffusion/i).first()).toBeVisible({ timeout: 15_000 });
});

test("una ruta inexistente muestra el aviso dentro del centro de mando", async ({ page }) => {
  const res = await page.goto("/no-existe");
  expect(res?.status()).toBe(404);
  await booted(page);
  await expect(page.getByRole("alert").filter({ hasText: "404" })).toBeVisible();
  await expect(page.getByRole("link", { name: /inicio|home/i }).first()).toBeVisible();
});
