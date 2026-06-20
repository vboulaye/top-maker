import { test, expect } from '@playwright/test';
import fs from 'fs';

test('undo reverts last insertion', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:5173';
  await page.goto(url);

  // Seed with one item
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Undo First');
  await page.fill('input[name="date"]', '2026-06-01');
  await page.fill('input[name="venue"]', 'V1');
  await page.click('button:has-text("Add Without Ranking")');

  // Add second and rank it above
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Undo Second');
  await page.fill('input[name="date"]', '2026-06-02');
  await page.fill('input[name="venue"]', 'V2');
  await page.click('button:has-text("Add and Rank")');
  await page.click('button#btn-better');

  const rows = page.locator('.rank-row');
  await expect(rows.nth(0)).toContainText('Undo Second');

  // Click Undo
  await page.click('button:has-text("Undo:")');

  // Now first item should be first again
  await expect(rows.nth(0)).toContainText('Undo First');
});
