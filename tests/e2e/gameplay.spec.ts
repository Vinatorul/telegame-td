import { test } from '@playwright/test';
import { waitForGameLoad, clickOnMap, performMultipleClicks, captureGameState } from './helpers';

test.describe('Tower Defense Gameplay', () => {
  test('should place tower on map', async ({ page }) => {
    await page.goto('/');

    await waitForGameLoad(page);

    await clickOnMap(page, 150, 150);
    await clickOnMap(page, 300, 300);

    await captureGameState(page);
  });

  test('should handle game interactions', async ({ page }) => {
    await page.goto('/');

    await waitForGameLoad(page);

    const positions = Array.from({ length: 5 }, (_, i) => ({
      x: 100 + i * 50,
      y: 200
    }));

    await performMultipleClicks(page, positions);

    await page.waitForTimeout(2000);

    await captureGameState(page);
  });
});
