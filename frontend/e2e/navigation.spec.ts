import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect from root to /draw', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/draw', { timeout: 5000 });
    expect(page.url()).toContain('/draw');
  });

  test('should navigate to draw page', async ({ page }) => {
    await page.goto('/draw');
    await expect(page.locator('h1')).toContainText('Draw a Snowflake');
  });

  test('should navigate to tree page', async ({ page }) => {
    await page.goto('/tree');
    await expect(page.locator('text=/LET IT SNOW/i')).toBeVisible();
  });

  test('should navigate from draw to tree page', async ({ page }) => {
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 50, canvasBox.y + canvasBox.height / 2 + 50);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
    
    const goToTreeButton = page.locator('button:has-text("Go on Tree")');
    await goToTreeButton.click();
    
    await page.waitForURL('**/tree', { timeout: 5000 });
    expect(page.url()).toContain('/tree');
  });

  test('should maintain state when navigating', async ({ page }) => {
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 50, canvasBox.y + canvasBox.height / 2 + 50);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
    
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Draw a Snowflake');
  });
});

