import { defineConfig, devices } from '@playwright/test';

// All CI behaviour is switched on by one variable. GitHub Actions sets CI=true automatically.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                       // --shard splits individual tests, not whole files
  forbidOnly: isCI,                          // a forgotten test.only fails CI instead of silently running one test
  retries: isCI ? 2 : 0,                     // a flaky test is reported as flaky, not red
  workers: isCI ? 2 : undefined,             // GitHub-hosted runners have 2–4 vCPUs
  timeout: 60_000,                           // public shared server, checkout has 4 steps
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [
        ['list'],
        ['blob'],                                          // per-shard file, merged by the merge-reports job
        ['junit', { outputFile: 'reports/junit.xml' }],    // machine-readable results
      ]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    // `||`, not `??`: in GitHub Actions an unset `${{ vars.BASE_URL }}` arrives as an empty string
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',            // the app uses data-test, not data-testid
    trace: 'on-first-retry',                 // trace of exactly the attempt that failed
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // No webServer: the tests target an external site (practicesoftwaretesting.com), not an app in this repo.
});
