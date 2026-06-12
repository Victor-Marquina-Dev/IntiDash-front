import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Roles - viewer', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('viewer no ve botones de escritura en el dashboard', async ({ page }) => {
    await login(page, 'viewer');
    await expect(page.getByRole('button', { name: /sincronizar/i })).not.toBeVisible();
  });

  test('viewer no puede invitar miembros en Ajustes', async ({ page }) => {
    await login(page, 'viewer');
    await page.getByRole('button', { name: /ajustes|notion|configurac/i }).last().click();
    await page.waitForTimeout(1000);
    const inviteBtn = page.getByTitle(/invitar/i);
    await expect(inviteBtn).not.toBeVisible();
  });
});

test.describe('Roles - editor', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('editor ve botones de escritura en el dashboard', async ({ page }) => {
    await login(page, 'editor');
    await expect(page.getByRole('button', { name: /sincronizar/i })).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Roles - owner', () => {
  test('owner ve la opción de eliminar workspace', async ({ page }) => {
    await page.goto('/app');
    await page.getByRole('button', { name: /ajustes|notion|configurac/i }).last().click();
    await page.waitForTimeout(1000);
    const deleteBtn = page.locator('button[title*="Eliminar"], button[title*="Salir"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 8_000 });
  });
});
