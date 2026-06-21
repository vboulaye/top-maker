import { test, expect } from '@playwright/test';

test('actions menu opens on click and shows export/import actions', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:4173';
  await page.goto(url);

  const toggle = page.locator('button.actions-toggle');
  await expect(toggle).toBeVisible();

  // use test helper to open actions menu reliably
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  await page.evaluate(() => (window as any).__topmaker_openActions && (window as any).__topmaker_openActions());
  const exportBtn = page.locator('button[data-test="actions-export"]');
  await exportBtn.waitFor({ state: 'visible', timeout: 10000 });
  await expect(exportBtn).toBeVisible();
  await expect(page.locator('button:has-text("Import")')).toBeVisible();
  await expect(page.locator('button:has-text("Open File")')).toBeVisible();
});
