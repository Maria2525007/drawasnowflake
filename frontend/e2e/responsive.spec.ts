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
    
    const message = page.locator('text=/LET IT SNOW/i');
    await expect(message).toBeVisible();
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/draw');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();
    
    if (canvasBox) {
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;
      
      await page.evaluate(({ x, y }) => {
        const touch = new Touch({
          identifier: 1,
          target: document.elementFromPoint(x, y) || document.body,
          clientX: x,
          clientY: y,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 0,
          force: 0.5,
        });
        const touchEvent = new TouchEvent('touchstart', {
          cancelable: true,
          bubbles: true,
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
        });
        document.elementFromPoint(x, y)?.dispatchEvent(touchEvent);
      }, { x: centerX, y: centerY });
      
      await page.waitForTimeout(300);
    }
    
    await expect(canvas).toBeVisible();
  });
});

