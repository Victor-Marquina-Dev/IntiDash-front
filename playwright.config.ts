import { defineConfig, devices } from '@playwright/test';

/**
 * Requisitos previos para correr los tests:
 *   - Backend corriendo en http://localhost:3001  (npm run dev en finanzas-1.0-back)
 *   - Frontend corriendo en http://localhost:3000  (npm run dev en finanzas-1.0-front)
 *   - Usuarios QA sembrados: npm run db:seed-permissions en el back
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,

  use: {
    baseURL:          'http://localhost:3000',
    headless:         true,
    screenshot:       'only-on-failure',
    video:            'retain-on-failure',
    actionTimeout:    8_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // Setup: guarda la sesión autenticada de cada rol en un archivo de estado
    {
      name: 'setup-owner',
      testMatch: /global\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests principales: reutilizan la sesión ya guardada
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/owner.json',
      },
      dependencies: ['setup-owner'],
      testIgnore: /global\.setup\.ts/,
    },
  ],
});
