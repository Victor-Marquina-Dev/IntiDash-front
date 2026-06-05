import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const USERS = {
  owner:  { email: 'owner@local.test',  password: 'LocalTest123!' },
  editor: { email: 'editor@local.test', password: 'LocalTest123!' },
  viewer: { email: 'viewer@local.test', password: 'LocalTest123!' },
} as const;

/** Inicia sesión y espera a que el dashboard esté visible. */
export async function login(page: Page, role: keyof typeof USERS) {
  const { email, password } = USERS[role];
  await page.goto('/');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  // Esperar logo/nav del dashboard
  await expect(page.getByText('Florín').first()).toBeVisible({ timeout: 12_000 });
}
