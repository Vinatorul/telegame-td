import { test } from '@playwright/test';
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
