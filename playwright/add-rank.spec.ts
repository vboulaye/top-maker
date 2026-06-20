import { test, expect } from '@playwright/test';

test('add and rank flow inserts new item via comparisons', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:5173';
  await page.goto(url);
  // wait for app to render the Add button
  await page.locator('button:has-text("Add")').waitFor({ state: 'visible' });

  // Add first item without ranking to seed list
  await page.click('button:has-text("Add")');
  await page.locator('div.modal').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').fill('First Artist');
  await page.getByLabel('Date').fill('2026-06-01');
  await page.getByLabel('Venue').fill('Venue One');
  // click Add and Rank to add the first item (rankings start empty so it will be inserted)
  await page.click('button:has-text("Add and Rank")');

  await expect(page.locator('text=First Artist')).toHaveCount(1);

  // Now add second item and choose to rank
  await page.click('button:has-text("Add")');
  await page.locator('div.modal').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').fill('Second Artist');
  await page.getByLabel('Date').fill('2026-06-02');
  await page.getByLabel('Venue').fill('Venue Two');
  await page.click('button:has-text("Add and Rank")');

  // Comparison modal should appear comparing Second vs First
  const dialog = page.locator('div[role="dialog"]');
  await expect(dialog.locator('text=Second Artist')).toHaveCount(1);
  await expect(dialog.locator('text=First Artist')).toHaveCount(1);

  // Choose that the new item is Better (click Better button)
  await page.click('button#btn-better');

  // After insertion, verify order: Second Artist above First Artist
  const rows = page.locator('.rank-row');
  await expect(rows.nth(0)).toContainText('Second Artist');
  await expect(rows.nth(1)).toContainText('First Artist');
});
