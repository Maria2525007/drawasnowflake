import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should be mobile-friendly on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    const header = page.locator('h1');
    await expect(header).toBeVisible();
  });

  test('should be tablet-friendly on medium screens', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should be desktop-friendly on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('should work on tree page on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    const message = page.locator('text=/LET\'S IT SNOW/i');
    await expect(message).toBeVisible();
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      await page.touchscreen.tap(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.waitForTimeout(300);
    }
    
    await expect(canvas).toBeVisible();
  });
});

