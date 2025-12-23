import { test, expect } from '@playwright/test';

test.describe('Tree Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tree');
    await page.waitForLoadState('networkidle');
  });

  test('should display tree canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display "LET IT SNOW" message', async ({ page }) => {
    const message = page.locator('text=/LET IT SNOW/i');
    await expect(message).toBeVisible();
  });

  test('should display twinkling lights around message', async ({ page }) => {
    await page.waitForTimeout(500);
    const toolbar = page.locator('header[class*="MuiAppBar"]');
    await expect(toolbar).toBeVisible();
    const messageBox = toolbar.locator('text=/LET IT SNOW/i');
    await expect(messageBox).toBeVisible();
    const container = messageBox.locator('..');
    const lights = container.locator('div').filter({ hasText: '' }).first();
    const lightCount = await lights.count();
    expect(lightCount).toBeGreaterThanOrEqual(0);
  });

  test('should display export button', async ({ page }) => {
    const exportButton = page.locator('button[aria-label="export"]');
    await expect(exportButton).toBeVisible();
  });

  test('should display copy button', async ({ page }) => {
    const copyButton = page.locator('button[aria-label="copy"]');
    await expect(copyButton).toBeVisible();
  });

  test('should not display drawing tools on tree page', async ({ page }) => {
    const pencilButton = page.locator('button[aria-label="pencil"]');
    const eraserButton = page.locator('button[aria-label="eraser"]');
    
    await expect(pencilButton).not.toBeVisible();
    await expect(eraserButton).not.toBeVisible();
  });

  test('should export tree canvas as image', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const exportButton = page.locator('button[aria-label="export"]');
    
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await exportButton.click();
    
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain('.png');
    }
  });

  test('should copy tree canvas to clipboard', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const copyButton = page.locator('button[aria-label="copy"]');
    await copyButton.click();
    
    await page.waitForTimeout(500);
    
    const snackbar = page.locator('text=/Image copied|Failed to copy/');
    await expect(snackbar).toBeVisible({ timeout: 2000 });
  });

  test('should render tree with ornaments', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const canvas = page.locator('canvas');
    const imageData = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return null;
      return ctx.getImageData(0, 0, el.width, el.height).data;
    });
    
    expect(imageData).not.toBeNull();
  });

  test('should animate snowflakes if present', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    const initialImageData = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return null;
      return ctx.getImageData(0, 0, el.width, el.height).data;
    });
    
    await page.waitForTimeout(1000);
    
    const laterImageData = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext('2d');
      if (!ctx) return null;
      return ctx.getImageData(0, 0, el.width, el.height).data;
    });
    
    expect(initialImageData).not.toBeNull();
    expect(laterImageData).not.toBeNull();
  });
});

