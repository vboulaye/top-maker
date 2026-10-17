import { test, expect } from '@playwright/test';
import { getBaseUrl } from './test-utils';

test('bulk paste preview and submission remove repeated entries within the pasted batch', async ({ page }) => {
  await page.goto(getBaseUrl());
  await page.waitForFunction(() => document.documentElement.getAttribute('data-topmaker-hydrated') === '1');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Paste multiple' }).click();
  await page.getByLabel('Paste entries (one per line)').fill(
    'Radiohead [2026-06-01 Forum]\nRADIOHEAD [2026-06-01 forum]'
  );

  await expect(page.getByRole('heading', { name: 'Parsed Entries (1)' })).toBeVisible();
  await expect(page.locator('.bulk-preview li')).toHaveCount(1);
  await expect(page.locator('.bulk-preview li')).toContainText('Radiohead');

  await page.getByRole('button', { name: 'Add and Rank All' }).click();
  await expect(page.locator('.ranked-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.ranked-table tbody')).toContainText('Radiohead');
});
