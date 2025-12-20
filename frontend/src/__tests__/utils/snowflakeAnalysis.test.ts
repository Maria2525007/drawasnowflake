import { analyzeSnowflake } from '../../utils/snowflakeAnalysis';
import { CANVAS_CONFIG } from '../../config/constants';

describe('snowflakeAnalysis', () => {
  const createImageData = (
    width: number,
    height: number,
    pixelFn?: (
      x: number,
      y: number
    ) => {
      r: number;
      g: number;
      b: number;
      a: number;
    }
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

      expect(result.similarity).toBe(0);
      expect(result.symmetry).toBe(0);
      expect(result.structure).toBe(0);
      expect(result.coverage).toBe(0);
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

      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
      expect(result.symmetry).toBeGreaterThanOrEqual(0);
      expect(result.structure).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeGreaterThanOrEqual(0);
    });

    it('should handle small canvas correctly', () => {
      const imageData = createImageData(50, 50, (x, y) => {
        const centerX = 25;
        const centerY = 25;
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

      const result = analyzeSnowflake(imageData, 50, 50);

      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeLessThanOrEqual(100);
    });

    it('should filter out background pixels', () => {
      const imageData = createImageData(100, 100);
      const result = analyzeSnowflake(imageData, 100, 100);

      expect(result.coverage).toBe(0);
    });

    it('should handle pixels with low alpha', () => {
      const imageData = createImageData(100, 100, (x, y) => {
        const centerX = 50;
        const centerY = 50;
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

      const result = analyzeSnowflake(imageData, 100, 100);

      expect(result.coverage).toBe(0);
    });
  });
});
