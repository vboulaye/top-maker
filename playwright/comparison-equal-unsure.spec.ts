import { test, expect } from '@playwright/test';

test('comparison equal inserts at same index (tie)', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:5173';
  await page.goto(url);

  // Seed with one item
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Equal First');
  await page.fill('input[name="date"]', '2026-06-01');
  await page.fill('input[name="venue"]', 'V1');
  await page.click('button:has-text("Add Without Ranking")');

  // Add second and choose Equal
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Equal Second');
  await page.fill('input[name="date"]', '2026-06-02');
  await page.fill('input[name="venue"]', 'V2');
  await page.click('button:has-text("Add and Rank")');
  await page.click('button#btn-equal');

  const rows = page.locator('.rank-row');
  // tie returns index 0 (insert at mid), so Second should be at position 0
  await expect(rows.nth(0)).toContainText('Equal Second');
  await expect(rows.nth(1)).toContainText('Equal First');
});

test('comparison unsure inserts after compared item (unsure)', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:5173';
  await page.goto(url);

  // Seed with one item
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Unsure First');
  await page.fill('input[name="date"]', '2026-06-01');
  await page.fill('input[name="venue"]', 'V1');
  await page.click('button:has-text("Add Without Ranking")');

  // Add second and choose Unsure
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Unsure Second');
  await page.fill('input[name="date"]', '2026-06-02');
  await page.fill('input[name="venue"]', 'V2');
  await page.click('button:has-text("Add and Rank")');
  await page.click('button#btn-unsure');

  const rows = page.locator('.rank-row');
  // unsure treated as lower -> inserted after compared item
  await expect(rows.nth(0)).toContainText('Unsure First');
  await expect(rows.nth(1)).toContainText('Unsure Second');
});
