import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chromium'] } }
  ],
  use: {
    headless: true,
    trace: 'on-first-retry'
  }
});
