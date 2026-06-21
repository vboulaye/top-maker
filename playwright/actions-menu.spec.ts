import { test, expect } from '@playwright/test';

test('actions menu opens on click and shows export/import actions', async ({ page }) => {
  await page.goto('http://localhost:4173');

  const toggle = page.locator('button.actions-toggle');
  await expect(toggle).toBeVisible();

  await toggle.click();

  const menu = page.locator('.actions-menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Export' })).toBeVisible();
  await expect(menu.getByText('Import')).toBeVisible();
});
