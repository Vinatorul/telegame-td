import { Page, expect } from '@playwright/test';

export async function waitForGameLoad(page: Page) {
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);
  return canvas;
}

export async function clickOnMap(page: Page, x: number, y: number) {
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x, y } });
  await page.waitForTimeout(300);
}

export async function performMultipleClicks(
  page: Page,
  positions: Array<{ x: number; y: number }>
) {
  for (const position of positions) {
    await clickOnMap(page, position.x, position.y);
  }
}

export async function captureGameState(page: Page) {
  const screenshot = await page.screenshot();
  expect(screenshot).toBeTruthy();
  return screenshot;
}

export async function getPerformanceMetrics(page: Page) {
  return page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('measure'));
  });
}
