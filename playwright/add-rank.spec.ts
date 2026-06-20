import { test, expect } from '@playwright/test';

test('add and rank flow inserts new item via comparisons', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:5173';
  await page.goto(url);

  // Add first item without ranking to seed list
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'First Artist');
  await page.fill('input[name="date"]', '2026-06-01');
  await page.fill('input[name="venue"]', 'Venue One');
  // click Add Without Ranking
  await page.click('button:has-text("Add Without Ranking")');

  await expect(page.locator('text=First Artist')).toHaveCount(1);

  // Now add second item and choose to rank
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Second Artist');
  await page.fill('input[name="date"]', '2026-06-02');
  await page.fill('input[name="venue"]', 'Venue Two');
  await page.click('button:has-text("Add and Rank")');

  // Comparison modal should appear comparing Second vs First
  await expect(page.locator('text=Second Artist')).toHaveCount(1);
  await expect(page.locator('text=First Artist')).toHaveCount(1);

  // Choose that the new item is Better (click Better button)
  await page.click('button#btn-better');

  // After insertion, verify order: Second Artist above First Artist
  const rows = page.locator('.rank-row');
  await expect(rows.nth(0)).toContainText('Second Artist');
  await expect(rows.nth(1)).toContainText('First Artist');
});
