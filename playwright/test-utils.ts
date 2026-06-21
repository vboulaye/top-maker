// Centralized test utilities for Playwright tests
const port = process.env.PREVIEW_PORT ?? 4173;
export const BASE_URL = process.env.PW_BASE_URL ?? `http://localhost:${port}`;

// Tests run with the e2e query param so the app exposes test-only helpers (opt-in)
export const E2E_QUERY = 'e2e=1';

/**
 * Wait helper for Playwright tests when running against the dev server.
 * Tests should import BASE_URL and use it in page.goto(BASE_URL).
 */
export function getBaseUrl() {
  return `${BASE_URL}?${E2E_QUERY}`;
}
