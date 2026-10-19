import { test, expect } from '@playwright/test';
import { getBaseUrl } from './test-utils';

test('inline edit can be cancelled or saved from the ranked table', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);
  await page.waitForSelector('[data-topmaker-hydrated="1"]');

  // Add item reliably
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  const addDialog = page.getByRole('dialog');
  await addDialog.getByLabel('Artist').fill('InlineTest');
  await addDialog.getByLabel('Date').fill('2026-06-11');
  await addDialog.getByLabel('Venue').fill('Venue I');
  await page.click('button:has-text("Add and Rank")');
  await expect(page.locator('text=InlineTest')).toHaveCount(1);

  const row = page.locator('.ranked-table tbody tr').filter({ hasText: 'InlineTest' });
  const itemId = await row.getAttribute('data-item-id');
  const itemRow = page.locator(`tr[data-item-id="${itemId}"]`);
  await itemRow.getByRole('button', { name: 'Edit InlineTest' }).click();

  const artistInput = itemRow.getByPlaceholder('Artist');
  await expect(artistInput).toHaveValue('InlineTest');
  await artistInput.fill('Cancelled Edit');
  await itemRow.getByRole('button', { name: 'Cancel' }).click();
  await expect(itemRow).toContainText('InlineTest');
  await expect(itemRow).not.toContainText('Cancelled Edit');

  await itemRow.getByRole('button', { name: 'Edit InlineTest' }).click();
  await itemRow.getByPlaceholder('Artist').fill('InlineTestEdited');
  await itemRow.getByRole('button', { name: 'Save' }).click();
  await expect(itemRow).toContainText('InlineTestEdited');
});
