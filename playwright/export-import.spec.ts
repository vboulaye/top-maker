import { test, expect } from '@playwright/test';
import { getBaseUrl } from './test-utils';

test('importing an empty JSON snapshot replaces the existing state', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);

  // Add an item using the Add button and form
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  const addDialog = page.getByRole('dialog');
  await addDialog.getByLabel('Artist').waitFor({ state: 'visible', timeout: 10000 });
  await addDialog.getByLabel('Artist').fill('Playwright Artist');
  await addDialog.getByLabel('Date').fill('2026-06-20');
  await addDialog.getByLabel('Venue').fill('Test Venue');
  await addDialog.getByRole('button', { name: 'Add and Rank' }).click();

  // Ensure the item appears in the list
  await expect(page.locator('text=Playwright Artist')).toHaveCount(1);

  const emptySnapshot = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items: {}, rankings: {}, comparisons: [] }, null, 2);
  await page.locator('input[type="file"][accept="application/json"]').evaluate((input, content) => {
    const file = new File([content], 'empty-snapshot.json', { type: 'application/json' });
    const transfer = new DataTransfer();
    transfer.items.add(file);
    (input as HTMLInputElement).files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, emptySnapshot);

  // Verify the previously added item is gone (replace-all semantics)
  await expect(page.locator('text=Playwright Artist')).toHaveCount(0);
});

test('edit an item updates UI and persists', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  // open add modal and add an item
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  const addDialog = page.getByRole('dialog');
  await addDialog.getByLabel('Artist').fill('EditMe');
  await addDialog.getByLabel('Date').fill('2026-06-10');
  await addDialog.getByLabel('Venue').fill('Venue E');
  await addDialog.getByRole('button', { name: 'Add and Rank' }).click();

  // ensure item present
  await expect(page.locator('text=EditMe')).toHaveCount(1);

  const row = page.locator('.ranked-table tbody tr').filter({ hasText: 'EditMe' });
  const itemId = await row.getAttribute('data-item-id');
  const itemRow = page.locator(`tr[data-item-id="${itemId}"]`);
  await row.getByRole('button', { name: 'Edit EditMe' }).click();
  await itemRow.getByPlaceholder('Artist').fill('Edited Artist');
  await itemRow.getByRole('button', { name: 'Save' }).click();

  // verify updated text appears
  await expect(itemRow).toContainText('Edited Artist');
  await page.reload();
  await expect(page.locator('.ranked-table tbody')).toContainText('Edited Artist');
});
