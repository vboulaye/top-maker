import { test, expect } from '@playwright/test';
import { getBaseUrl } from './test-utils';

test('inline edit: click card opens editor, inputs keep focus, Escape cancels and focus returns, save persists', async ({ page }) => {
  const url = getBaseUrl();
  await page.goto(url);
  await page.waitForSelector('[data-topmaker-hydrated="1"]');

  // Add item reliably
  await page.evaluate(() => (window as any).__topmaker_openAdd && (window as any).__topmaker_openAdd());
  await page.getByLabel('Artist').fill('InlineTest');
  await page.getByLabel('Date').fill('2026-06-11');
  await page.getByLabel('Venue').fill('Venue I');
  await page.click('button:has-text("Add and Rank")');
  await expect(page.locator('text=InlineTest')).toHaveCount(1);

  // Click the card to open inline editor
  const card = page.locator('[data-item-id]').filter({ hasText: 'InlineTest' }).first();
  await card.click();

  // Artist input should be focused
  await expect(page.getByLabel('Artist')).toBeFocused();

  // Click inside other input should not cancel
  await page.getByLabel('Venue').click();
  await expect(page.getByLabel('Venue')).toBeFocused();

  // Press Escape to cancel edit -> editor disappears, card regains focus
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();

  // Re-open, edit artist, Save
  await card.click();
  await page.getByLabel('Artist').fill('InlineTestEdited');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=InlineTestEdited')).toHaveCount(1);
});
