import { analyzeSnowflake } from '../../utils/snowflakeAnalysis';
import { CANVAS_CONFIG } from '../../config/constants';

describe('snowflakeAnalysis', () => {
  const createImageData = (
    width: number,
    height: number,
    pixelFn?: (
      _x: number,
      _y: number
    ) => { r: number; g: number; b: number; a: number }
  ): ImageData => {
    const data = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (pixelFn) {
          const pixel = pixelFn(x, y);
          data[idx] = pixel.r;
          data[idx + 1] = pixel.g;
          data[idx + 2] = pixel.b;
          data[idx + 3] = pixel.a;
        } else {
          data[idx] = CANVAS_CONFIG.BACKGROUND_R;
          data[idx + 1] = CANVAS_CONFIG.BACKGROUND_G;
          data[idx + 2] = CANVAS_CONFIG.BACKGROUND_B;
          data[idx + 3] = 255;
        }
      }
    }

    return new ImageData(data, width, height);
  };

  describe('analyzeSnowflake', () => {
    it('should return zero analysis for empty canvas', () => {
      const imageData = createImageData(100, 100);
      const result = analyzeSnowflake(imageData, 100, 100);

      expect(result).toEqual({
        similarity: 0,
        symmetry: 0,
        structure: 0,
        coverage: 0,
      });
    });

    it('should calculate similarity for symmetric pattern', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        const centerX = 100;
        const centerY = 100;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        const angle = Math.atan2(y - centerY, x - centerX);

        if (dist < 50 && dist > 20) {
          const sector = Math.floor((angle + Math.PI) / (Math.PI / 3)) % 6;
          if (sector % 2 === 0) {
            return { r: 255, g: 255, b: 255, a: 255 };
          }
        }

        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.similarity).toBeGreaterThan(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
      expect(result.symmetry).toBeGreaterThan(0);
      expect(result.structure).toBeGreaterThan(0);
      expect(result.coverage).toBeGreaterThan(0);
    });

    it('should handle small canvas correctly', () => {
      const imageData = createImageData(100, 100, (x, y) => {
        const centerX = 50;
        const centerY = 50;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (dist < 30) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 100, 100);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
    });

    it('should handle large canvas with sampling', () => {
      const width = 1500;
      const height = 1500;
      const imageData = createImageData(width, height, (x, y) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (dist < 100) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, width, height);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
    });

    it('should filter out background pixels', () => {
      const imageData = createImageData(200, 200, () => {
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.coverage).toBe(0);
      expect(result.similarity).toBe(0);
    });

    it('should handle pixels with low alpha', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        const centerX = 100;
        const centerY = 100;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (dist < 50) {
          return { r: 255, g: 255, b: 255, a: 5 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.coverage).toBe(0);
    });

    it('should calculate coverage correctly', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        if (x < 100 && y < 100) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.coverage).toBeGreaterThan(0);
      expect(result.coverage).toBeLessThanOrEqual(100);
    });

    it('should return values in valid ranges', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        const centerX = 100;
        const centerY = 100;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (dist < 50) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
      expect(result.symmetry).toBeGreaterThanOrEqual(0);
      expect(result.symmetry).toBeLessThanOrEqual(100);
      expect(result.structure).toBeGreaterThanOrEqual(0);
      expect(result.structure).toBeLessThanOrEqual(100);
      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeLessThanOrEqual(100);
    });

    it('should handle asymmetric pattern', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        if (x > 100 && x < 150 && y > 50 && y < 150) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
      expect(result.symmetry).toBeLessThan(100);
    });

    it('should handle high brightness pixels', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        const centerX = 100;
        const centerY = 100;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (dist < 50) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.similarity).toBeGreaterThanOrEqual(0);
    });

    it('should handle background colors within tolerance', () => {
      const imageData = createImageData(200, 200, () => {
        return {
          r: CANVAS_CONFIG.BACKGROUND_R + 5,
          g: CANVAS_CONFIG.BACKGROUND_G + 5,
          b: CANVAS_CONFIG.BACKGROUND_B + 5,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.coverage).toBe(0);
    });

    it('should round similarity, symmetry, structure, and coverage', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        const centerX = 100;
        const centerY = 100;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (dist < 50) {
          return { r: 255, g: 255, b: 255, a: 255 };
        }
        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(Number.isInteger(result.similarity)).toBe(true);
      expect(Number.isInteger(result.symmetry)).toBe(true);
      expect(Number.isInteger(result.structure)).toBe(true);
      expect(Number.isInteger(result.coverage)).toBe(true);
    });

    it('should cap similarity at 100', () => {
      const imageData = createImageData(200, 200, (x, y) => {
        const centerX = 100;
        const centerY = 100;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        const angle = Math.atan2(y - centerY, x - centerX);

        if (dist < 80) {
          const sector = Math.floor((angle + Math.PI) / (Math.PI / 3)) % 6;
          if (dist > 20 || sector % 2 === 0) {
            return { r: 255, g: 255, b: 255, a: 255 };
          }
        }

        return {
          r: CANVAS_CONFIG.BACKGROUND_R,
          g: CANVAS_CONFIG.BACKGROUND_G,
          b: CANVAS_CONFIG.BACKGROUND_B,
          a: 255,
        };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.similarity).toBeLessThanOrEqual(100);
    });

    it('should cap coverage at 100', () => {
      const imageData = createImageData(200, 200, () => {
        return { r: 255, g: 255, b: 255, a: 255 };
      });

      const result = analyzeSnowflake(imageData, 200, 200);

      expect(result.coverage).toBeLessThanOrEqual(100);
    });

    it('should handle different canvas sizes', () => {
      const sizes = [
        { w: 100, h: 100 },
        { w: 500, h: 500 },
        { w: 1000, h: 1000 },
        { w: 2000, h: 2000 },
      ];

      sizes.forEach(({ w, h }) => {
        const imageData = createImageData(w, h, (x, y) => {
          const centerX = w / 2;
          const centerY = h / 2;
          const dist = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          if (dist < w / 4) {
            return { r: 255, g: 255, b: 255, a: 255 };
          }
          return {
            r: CANVAS_CONFIG.BACKGROUND_R,
            g: CANVAS_CONFIG.BACKGROUND_G,
            b: CANVAS_CONFIG.BACKGROUND_B,
            a: 255,
          };
        });

        const result = analyzeSnowflake(imageData, w, h);

        expect(result.similarity).toBeGreaterThanOrEqual(0);
        expect(result.similarity).toBeLessThanOrEqual(100);
      });
    });
  });
});
