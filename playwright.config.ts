import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  timeout: 30_000,
  expect: { timeout: 5000 },
  // Run tests serially to avoid shared application state interference (IndexedDB, file handles)
  fullyParallel: false,
  workers: 1,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chromium'] } }
  ],
  use: {
    headless: true,
    trace: 'on-first-retry'
  }
});
