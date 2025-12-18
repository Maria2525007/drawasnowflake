import { analyzeSnowflake } from '../../utils/snowflakeAnalysis';

describe('snowflakeAnalysis', () => {
  const createImageData = (
    width: number,
    height: number,
    fillColor: { r: number; g: number; b: number; a: number }
  ): ImageData => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    ctx.fillStyle = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${fillColor.a / 255})`;
    ctx.fillRect(0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  };

  it('should return zero similarity for empty canvas', () => {
    const imageData = createImageData(2000, 2000, {
      r: 10,
      g: 25,
      b: 41,
      a: 255,
    });
    const result = analyzeSnowflake(imageData, 2000, 2000);
    expect(result.similarity).toBe(0);
    expect(result.symmetry).toBe(0);
    expect(result.structure).toBe(0);
    expect(result.coverage).toBe(0);
  });

  it('should analyze snowflake with white pixels', () => {
    const imageData = createImageData(2000, 2000, {
      r: 10,
      g: 25,
      b: 41,
      a: 255,
    });
    const data = imageData.data;

    for (let i = 0; i < 1000; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const result = analyzeSnowflake(imageData, 2000, 2000);
    expect(result.similarity).toBeGreaterThanOrEqual(0);
    expect(result.similarity).toBeLessThanOrEqual(100);
    expect(result.symmetry).toBeGreaterThanOrEqual(0);
    expect(result.structure).toBeGreaterThanOrEqual(0);
    expect(result.coverage).toBeGreaterThanOrEqual(0);
  });

  it('should return valid analysis structure', () => {
    const imageData = createImageData(2000, 2000, {
      r: 10,
      g: 25,
      b: 41,
      a: 255,
    });
    const result = analyzeSnowflake(imageData, 2000, 2000);
    expect(result).toHaveProperty('similarity');
    expect(result).toHaveProperty('symmetry');
    expect(result).toHaveProperty('structure');
    expect(result).toHaveProperty('coverage');
    expect(typeof result.similarity).toBe('number');
    expect(typeof result.symmetry).toBe('number');
    expect(typeof result.structure).toBe('number');
    expect(typeof result.coverage).toBe('number');
  });
});
