import { test } from '@playwright/test';

test('debug page after add click', async ({ page }) => {
  const url = process.env.PW_BASE_URL ?? 'http://localhost:4173';
  await page.goto(url);
  await page.waitForSelector('button:has-text("Add")');
  await page.click('button:has-text("Add")');
  // wait briefly for client-side rendering
  await page.waitForTimeout(800);
  const html = await page.content();
  console.log('PAGE HTML AFTER CLICK (first 2000 chars):\n', html.slice(0, 2000));
  const labels = await page.evaluate(() => Array.from(document.querySelectorAll('label')).map(l => l.textContent.trim()));
  console.log('Labels on page after click:', labels);
  const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => ({type: i.type, placeholder: i.placeholder || null, name: i.name || null})).slice(0,20));
  console.log('Inputs sample:', inputs);
});
