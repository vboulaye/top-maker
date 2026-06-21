// Centralized test utilities for Playwright tests
export const BASE_URL = process.env.PW_BASE_URL ?? `http://localhost:${process.env.PREVIEW_PORT ?? 4173}`;

/**
 * Wait helper for Playwright tests when running against the dev server.
 * Tests should import BASE_URL and use it in page.goto(BASE_URL).
 */
export function getBaseUrl() {
  return BASE_URL;
}
