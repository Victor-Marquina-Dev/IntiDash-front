import { test as setup } from '@playwright/test';
import { login } from './helpers/auth';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/owner.json');

setup('guardar sesión owner', async ({ page }) => {
  await login(page, 'owner');
  await page.context().storageState({ path: AUTH_FILE });
});
