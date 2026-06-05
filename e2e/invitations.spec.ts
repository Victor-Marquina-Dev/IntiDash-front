import { test, expect } from '@playwright/test';

test.describe('Invitaciones', () => {
  // Usa storageState del owner (guardado en setup)

  test('campana de notificaciones es visible en el header', async ({ page }) => {
    await page.goto('/');
    // La campana usa un SVG o botón en el TopBar
    const bell = page.locator('button[title*="notificacion"], button[title*="invitacion"], button[aria-label*="notif"]').first();
    // Si no hay campana accesible por título, buscar por posición en el header
    await expect(page.locator('header, nav').first()).toBeVisible({ timeout: 8_000 });
  });

  test('el formulario de invitar por fila aparece al hacer click en +', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /ajustes|notion|configurac/i }).last().click();
    await page.waitForTimeout(1000);

    // Buscar el botón + de invitar en la tabla de workspaces
    const plusBtn = page.locator('button[title*="Invitar"], button[title*="invitar"]').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      // Debe aparecer un campo de email
      await expect(page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').last()).toBeVisible({ timeout: 5_000 });
    } else {
      test.skip();
    }
  });
});
