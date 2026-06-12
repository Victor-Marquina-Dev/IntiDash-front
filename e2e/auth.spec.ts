import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Autenticación', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // sin sesión previa

  test('login correcto muestra el dashboard', async ({ page }) => {
    await login(page, 'owner');
    await expect(page.getByText('Dashboard').first()).toBeVisible();
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('noexiste@test.com');
    await page.locator('input[type="password"]').fill('WrongPass123!');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('form')).toContainText(/credencial|incorrecto|inválid/i, { timeout: 8_000 });
  });

  test('logout devuelve a la pantalla de login', async ({ page }) => {
    await login(page, 'owner');
    await page.getByRole('button', { name: /cerrar sesión|salir|logout/i }).click();
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8_000 });
  });

  test('visitar /app sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
