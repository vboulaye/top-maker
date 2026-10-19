import { test, expect } from '@playwright/test';
import { getBaseUrl } from './test-utils';

test('backup and restore actions are available in the header', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);

  await expect(page.getByRole('button', { name: 'Backup', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeVisible();
});
