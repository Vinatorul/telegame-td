import { test, expect } from '@playwright/test';
import {
  waitForGameLoad,
  clickOnMap,
  performMultipleClicks,
  captureGameState,
  getPerformanceMetrics
} from './helpers';

test.describe('Tower Defense Performance', () => {
  test('should maintain performance during gameplay', async ({ page }) => {
    await page.goto('/');

    await waitForGameLoad(page);

    const metrics = [];

    for (let i = 0; i < 10; i++) {
      await clickOnMap(page, 100 + i * 30, 150 + i * 20);

      const performanceEntries = await getPerformanceMetrics(page);
      metrics.push(performanceEntries);
    }

    expect(metrics.length).toBe(10);

    await page.waitForTimeout(5000);

    const finalMetrics = await getPerformanceMetrics(page);
    expect(finalMetrics).toBeTruthy();
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('/');

    await waitForGameLoad(page);

    const positions = Array.from({ length: 20 }, () => ({
      x: 200,
      y: 200
    }));

    await performMultipleClicks(page, positions);

    await page.waitForTimeout(1000);

    await captureGameState(page);
  });
});
