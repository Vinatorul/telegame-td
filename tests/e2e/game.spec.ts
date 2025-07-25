import { test, expect } from '@playwright/test';
import { waitForGameLoad, clickOnMap, captureGameState } from './helpers';

test.describe('Tower Defense Game', () => {
  test('should load the game', async ({ page }) => {
    await page.goto('/');

    const canvas = await waitForGameLoad(page);

    const boundingBox = await canvas.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);
  });

  test('should display game elements', async ({ page }) => {
    await page.goto('/');

    await waitForGameLoad(page);

    await captureGameState(page);
  });

  test('should respond to mouse interactions', async ({ page }) => {
    await page.goto('/');

    await waitForGameLoad(page);

    await clickOnMap(page, 100, 100);
    await clickOnMap(page, 200, 200);
  });
});
