import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                       // tests must pass in any order and in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,           // retry in CI only
  timeout: 60_000,                           // public shared server, checkout has 4 steps
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',            // the app uses data-test, not data-testid
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
