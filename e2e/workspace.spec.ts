import { test, expect } from '@playwright/test';

test.describe('Workspace', () => {
  test('el selector de workspace es visible en el header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTitle('Cambiar espacio de trabajo')).toBeVisible();
  });

  test('abrir el selector muestra la lista de espacios', async ({ page }) => {
    await page.goto('/');
    await page.getByTitle('Cambiar espacio de trabajo').click();
    // Debe aparecer el encabezado del panel
    await expect(page.getByText(/espacios de trabajo/i).first()).toBeVisible();
  });

  test('cambiar workspace NO recarga la página completa', async ({ page }) => {
    await page.goto('/');
    // Contar navigations: un reload incrementa el contador
    let navigationCount = 0;
    page.on('framenavigated', () => { navigationCount++; });

    await page.getByTitle('Cambiar espacio de trabajo').click();
    const items = page.locator('button').filter({ hasText: /.+/ }).nth(2);
    // Si solo hay un workspace, skip
    const count = await page.getByTitle('Cambiar espacio de trabajo')
      .locator('..').locator('button').count();
    if (count <= 1) {
      test.skip();
      return;
    }
    await items.click();
    // No debe haber una navegación completa (reload = nav a la misma URL)
    await page.waitForTimeout(800);
    expect(navigationCount).toBe(1); // solo la carga inicial
  });

  test('navegar a Ajustes muestra WorkspaceMembersCard', async ({ page }) => {
    await page.goto('/');
    // Hacer click en el ícono de ajustes
    await page.getByRole('button', { name: /ajustes|notion|configurac/i }).last().click();
    await expect(page.getByText(/espacios de trabajo/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
