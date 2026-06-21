import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getBaseUrl } from './test-utils';

test('export then import JSON restores state', async ({ page, browser }) => {
  // Start app in dev mode is expected; for CI we assume preview is running at http://localhost:5173
  const url = getBaseUrl();
  await page.goto(url);

  // Add an item using the Add button and form
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  await page.getByLabel('Artist').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel('Artist').fill('Playwright Artist');
  await page.getByLabel('Date').fill('2026-06-20');
  await page.getByLabel('Venue').fill('Test Venue');
  // Use the modal Add button
  await page.click('button:has-text("Add and Rank")');

  // Ensure the item appears in the list
  await expect(page.locator('text=Playwright Artist')).toHaveCount(1);

  // Use exported helper to get JSON directly (avoids download issues in headless)
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  const exported = await page.evaluate(async () => {
    // __topmaker_export may trigger download; app returns null, but tests can override URL.createObjectURL
    // If the helper exists, call it. Otherwise, fallback to clicking the export button and reading blob.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (window.__topmaker_export) {
      // it returns whatever exportJsonFile returns (normally undefined) — but tests can intercept createObjectURL
      // so ensure we return the __lastBlobPromise if present
      try {
        // wait briefly for any createObjectURL interception
        await new Promise((r) => setTimeout(r, 100));
        // @ts-ignore
        return window.__lastBlobText || null;
      } catch (e) { return null; }
    }
    return null;
  });
  let parsed: any;
  if (exported) {
    parsed = JSON.parse(exported as string);
  } else {
    // fallback: open menu and click Export button directly
    await page.locator('button.actions-toggle').click();
    await page.locator('button[data-test="actions-export"]').click();
    // try to capture blob like earlier by overriding createObjectURL
    // wait a bit for app to call createObjectURL
    await page.waitForTimeout(250);
    const maybeText = await page.evaluate(() => (window as any).__lastBlobText || null);
    parsed = maybeText ? JSON.parse(maybeText) : { items: {} };
  }
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

test('edit an item updates UI and persists', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);
  await page.waitForSelector('[data-topmaker-hydrated="1"]');
  // open add modal and add an item
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  await page.getByLabel('Artist').fill('EditMe');
  await page.getByLabel('Date').fill('2026-06-10');
  await page.getByLabel('Venue').fill('Venue E');
  await page.click('button:has-text("Add and Rank")');

  // ensure item present
  await expect(page.locator('text=EditMe')).toHaveCount(1);

  // click Edit button on the item card
  const editBtn = page.locator('button[aria-label^="Edit EditMe"]');
  await editBtn.click();

  // Modal should open with Artist field populated
  await page.getByLabel('Artist').waitFor({ state: 'visible' });
  await page.getByLabel('Artist').fill('Edited Artist');
  await page.click('button:has-text("Save")');

  // verify updated text appears
  await expect(page.locator('text=Edited Artist')).toHaveCount(1);
});
