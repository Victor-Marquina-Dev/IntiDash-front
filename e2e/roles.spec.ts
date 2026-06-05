import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * Cada test de rol inicia sesión fresco (sin storageState del proyecto).
 * Necesita que el backend esté corriendo con los usuarios QA sembrados.
 */
test.describe('Roles - viewer', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('viewer no ve botones de escritura en el dashboard', async ({ page }) => {
    await login(page, 'viewer');
    // No debe haber botón de Sincronizar en el TopBar
    await expect(page.getByRole('button', { name: /sincronizar/i })).not.toBeVisible();
  });

  test('viewer no puede invitar miembros en Ajustes', async ({ page }) => {
    await login(page, 'viewer');
    await page.getByRole('button', { name: /ajustes|notion|configurac/i }).last().click();
    await page.waitForTimeout(1000);
    // El botón "+" de invitar no debe existir para viewer
    const inviteBtn = page.getByTitle(/invitar/i);
    await expect(inviteBtn).not.toBeVisible();
  });
});

test.describe('Roles - editor', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('editor ve botones de escritura en el dashboard', async ({ page }) => {
    await login(page, 'editor');
    // El botón de sincronizar sí debe estar
    await expect(page.getByRole('button', { name: /sincronizar/i })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Roles - owner', () => {
  // Usa el storageState guardado en setup
  test('owner ve la opción de eliminar workspace', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /ajustes|notion|configurac/i }).last().click();
    await page.waitForTimeout(1000);
    // Debe haber al menos un botón × de eliminar/salir
    const deleteBtn = page.locator('button[title*="Eliminar"], button[title*="Salir"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 8_000 });
  });
});
