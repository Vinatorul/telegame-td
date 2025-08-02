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

export async function simulateTouchStart(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(100);
}

export async function simulateTouchMove(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.waitForTimeout(50);
}

export async function simulateTouchEnd(page: Page, x: number, y: number) {
  await page.mouse.move(x, y);
  await page.mouse.up();
  await page.waitForTimeout(100);
}

export async function simulateTouchDrag(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  steps = 5
) {
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(100);

  const stepX = (endX - startX) / steps;
  const stepY = (endY - startY) / steps;

  for (let i = 1; i <= steps; i++) {
    const x = startX + stepX * i;
    const y = startY + stepY * i;
    await page.mouse.move(x, y);
    await page.waitForTimeout(50);
  }

  await page.mouse.up();
  await page.waitForTimeout(100);
}

export async function simulateMultiTouch(
  page: Page,
  touches: Array<{ startX: number; startY: number; endX: number; endY: number }>
) {
  for (const touch of touches) {
    await page.mouse.click(touch.startX, touch.startY);
    await page.waitForTimeout(100);
  }
}
