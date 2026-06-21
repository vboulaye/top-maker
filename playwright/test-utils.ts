// Centralized test utilities for Playwright tests
const port = process.env.PREVIEW_PORT ?? 4173;
export const BASE_URL = process.env.PW_BASE_URL ?? `http://localhost:${port}`;

/**
 * Return base URL for tests. If VITE_E2E or PREVIEW_E2E is set, don't append query param.
 * Otherwise append ?e2e=1 for backwards compatibility.
 */
export function getBaseUrl() {
  const preferEnv = process.env.VITE_E2E === '1' || process.env.VITE_E2E === 'true' || process.env.PREVIEW_E2E === '1';
  if (preferEnv) return BASE_URL;
  return `${BASE_URL}?e2e=1`;
}
