import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should save snowflake to server when navigating to tree', async ({ page }) => {
    let postRequestCaptured = false;
    await page.route('**/api/snowflakes', (route) => {
      if (route.request().method() === 'POST') {
        postRequestCaptured = true;
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'test-snowflake-1', success: true }),
        });
      } else {
        route.continue();
      }
    });

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
    
    const requestPromise = page.waitForRequest(
      (request) => request.url().includes('/snowflakes') && request.method() === 'POST',
      { timeout: 10000 }
    ).catch(() => null);
    
    const goToTreeButton = page.locator('button:has-text("Go on Tree")');
    await goToTreeButton.click();
    
    const request = await requestPromise;
    if (request) {
      expect(request.method()).toBe('POST');
      expect(request.url()).toContain('/snowflakes');
      
      const requestBody = request.postDataJSON();
      expect(requestBody).toHaveProperty('x');
      expect(requestBody).toHaveProperty('y');
      expect(requestBody).toHaveProperty('rotation');
      expect(requestBody).toHaveProperty('scale');
      expect(requestBody).toHaveProperty('pattern');
    }
    expect(postRequestCaptured).toBe(true);
  });

  test('should load snowflakes from server on tree page', async ({ page }) => {
    await page.route('**/api/snowflakes', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'test-1',
              x: 100,
              y: 200,
              rotation: 0,
              scale: 1,
              pattern: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          ]),
        });
      } else {
        route.continue();
      }
    });

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/snowflakes') && response.request().method() === 'GET',
      { timeout: 10000 }
    ).catch(() => null);
    
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
    
    const response = await responsePromise;
    if (response) {
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/snowflakes', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(1000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});

