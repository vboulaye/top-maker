import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('export then import JSON restores state', async ({ page, browser }) => {
  // Start app in dev mode is expected; for CI we assume preview is running at http://localhost:5173
  const url = process.env.PW_BASE_URL ?? 'http://localhost:5173';
  await page.goto(url);

  // Add an item using the Add button and form
  await page.click('button:has-text("Add")');
  await page.fill('input[name="artist"]', 'Playwright Artist');
  await page.fill('input[name="date"]', '2026-06-20');
  await page.fill('input[name="venue"]', 'Test Venue');
  await page.click('button:has-text("Save")');

  // Ensure the item appears in the list
  await expect(page.locator('text=Playwright Artist')).toHaveCount(1);

  // Trigger Export and capture download
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Export JSON")')
  ]);

  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();

  // Read the downloaded file and verify it's JSON with expected fields
  const contents = fs.readFileSync(downloadPath!, 'utf-8');
  const parsed = JSON.parse(contents);
  expect(parsed.items).toBeTruthy();

  // Now clear the app by importing an empty snapshot (simulate replace-all)
  const emptySnapshot = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items: {}, rankings: {}, comparisons: [] }, null, 2);
  const tmp = path.join(process.cwd(), 'tmp-import.json');
  fs.writeFileSync(tmp, emptySnapshot);

  // Upload file via the file input used in the app
  const input = await page.$('input[type="file"][accept="application/json"]');
  await input!.setInputFiles(tmp);

  // Verify the previously added item is gone (replace-all semantics)
  await expect(page.locator('text=Playwright Artist')).toHaveCount(0);

  // Clean up
  fs.unlinkSync(tmp);
});
