import { test } from '@playwright/test';

declare global {
  interface Window {
    game: any;
  }
}
import {
  waitForGameLoad,
  captureGameState,
  simulateTouchStart,
  simulateTouchEnd,
  simulateTouchDrag,
  simulateMultiTouch
} from './helpers';

test.describe('Touch Interaction', () => {
  test('should respond to touch tap', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateTouchStart(page, 150, 150);
    await simulateTouchEnd(page, 150, 150);

    await page.waitForTimeout(500);

    await captureGameState(page);
  });

  test('should respond to touch drag', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateTouchDrag(page, 200, 200, 300, 300);

    await page.waitForTimeout(500);

    await captureGameState(page);
  });

  test('should handle multi-touch interaction', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateMultiTouch(page, [
      { startX: 100, startY: 100, endX: 150, endY: 150 },
      { startX: 200, startY: 200, endX: 250, endY: 250 }
    ]);

    await page.waitForTimeout(500);
    await captureGameState(page);

    await page
      .evaluate(() => {
        const touchDebugText = document.querySelector('text');
        return touchDebugText ? touchDebugText.textContent : null;
      })
      .then(text => {
        console.log('Touch debug text:', text);
      });

    await simulateMultiTouch(page, [
      { startX: 150, startY: 150, endX: 250, endY: 250 },
      { startX: 300, startY: 300, endX: 200, endY: 200 },
      { startX: 400, startY: 150, endX: 400, endY: 250 }
    ]);

    await page.waitForTimeout(500);
    await captureGameState(page);

    await page
      .evaluate(() => {
        const touchDebugText = document.querySelector('text');
        return touchDebugText ? touchDebugText.textContent : null;
      })
      .then(text => {
        console.log('Touch debug text after second multi-touch:', text);
      });
  });

  test('should track multiple touch points simultaneously', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateTouchStart(page, 100, 100);
    await page.waitForTimeout(100);

    await simulateTouchStart(page, 200, 200);
    await page.waitForTimeout(100);

    await simulateTouchStart(page, 300, 300);
    await page.waitForTimeout(500);

    await captureGameState(page);

    await simulateTouchEnd(page, 100, 100);
    await simulateTouchEnd(page, 200, 200);
    await simulateTouchEnd(page, 300, 300);

    await page.waitForTimeout(500);
  });

  test('should handle pinch-to-zoom gesture', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    const centerX = 200;
    const centerY = 200;
    const distance = 50;

    await simulateMultiTouch(page, [
      {
        startX: centerX - distance,
        startY: centerY - distance,
        endX: centerX - distance * 2,
        endY: centerY - distance * 2
      },
      {
        startX: centerX + distance,
        startY: centerY + distance,
        endX: centerX + distance * 2,
        endY: centerY + distance * 2
      }
    ]);

    await page.waitForTimeout(500);
    await captureGameState(page);
  });

  test('should handle rotation gesture', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    const centerX = 200;
    const centerY = 200;
    const radius = 50;

    await simulateMultiTouch(page, [
      { startX: centerX - radius, startY: centerY, endX: centerX, endY: centerY - radius },
      { startX: centerX + radius, startY: centerY, endX: centerX, endY: centerY + radius }
    ]);

    await page.waitForTimeout(500);
    await captureGameState(page);
  });

  test('should select tile with touch', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateTouchStart(page, 150, 150);
    await simulateTouchEnd(page, 150, 150);

    await page.waitForTimeout(500);

    await simulateTouchStart(page, 50, 550);
    await simulateTouchEnd(page, 50, 550);

    await page.waitForTimeout(500);

    await captureGameState(page);
  });

  test('should drag game field with touch', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateTouchDrag(page, 200, 200, 100, 100);

    await page.waitForTimeout(500);

    await captureGameState(page);

    await simulateTouchDrag(page, 100, 100, 200, 200);

    await page.waitForTimeout(500);

    await captureGameState(page);
  });

  test('should handle long touch press', async ({ page }) => {
    await page.goto('/');
    await waitForGameLoad(page);

    await simulateTouchStart(page, 150, 150);

    await page.waitForTimeout(600);

    await simulateTouchEnd(page, 150, 150);

    await page.waitForTimeout(500);

    await captureGameState(page);
  });
});
