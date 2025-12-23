import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load application and display header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Draw a Snowflake');
  });

  test('should have working canvas', async ({ page }) => {
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should have navigation between pages', async ({ page }) => {
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 30, canvasBox.y + canvasBox.height / 2 + 30);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
    
    const goToTreeButton = page.locator('button:has-text("Go on Tree")');
    await goToTreeButton.click();
    
    await page.waitForURL('**/tree', { timeout: 5000 });
    expect(page.url()).toContain('/tree');
  });
});
