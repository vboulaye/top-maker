import { test, expect } from '@playwright/test';
import { getBaseUrl } from './test-utils';

test('comparison equal inserts at same index (tie)', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);
  await page.locator('button:has-text("Add")').waitFor({ state: 'visible' });

  // Seed with one item
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  await page.getByLabel('Artist').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Artist').fill('Equal First');
  await page.getByLabel('Date').fill('2026-06-01');
  await page.getByLabel('Venue').fill('V1');
  await page.click('button:has-text("Add and Rank")');

  // Add second and choose Equal
  await page.click('button:has-text("Add")');
  await page.getByLabel('Artist').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Artist').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').fill('Equal Second');
  await page.getByLabel('Date').fill('2026-06-02');
  await page.getByLabel('Venue').fill('V2');
  await page.click('button:has-text("Add and Rank")');
  await page.click('button#btn-equal');

  const rows = page.locator('.rank-row');
  // tie returns index 0 (insert at mid), so Second should be at position 0
  await expect(rows.nth(0)).toContainText('Equal Second');
  await expect(rows.nth(1)).toContainText('Equal First');
});

test('comparison unsure inserts after compared item (unsure)', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);

  // Seed with one item
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  await page.getByLabel('Artist').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').fill('Unsure First');
  await page.getByLabel('Date').fill('2026-06-01');
  await page.getByLabel('Venue').fill('V1');
  await page.click('button:has-text("Add and Rank")');

  // Add second and choose Unsure
  await page.click('button:has-text("Add")');
  await page.locator('div.modal').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').fill('Unsure Second');
  await page.getByLabel('Date').fill('2026-06-02');
  await page.getByLabel('Venue').fill('V2');
  await page.click('button:has-text("Add and Rank")');
  await page.click('button#btn-unsure');

  const rows = page.locator('.rank-row');
  // unsure treated as lower -> inserted after compared item
  await expect(rows.nth(0)).toContainText('Unsure First');
  await expect(rows.nth(1)).toContainText('Unsure Second');
});
