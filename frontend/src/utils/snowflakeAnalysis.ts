import {
  CANVAS_CONFIG,
  ANALYSIS_CONFIG,
} from '../config/constants';

export interface SnowflakeAnalysis {
  similarity: number;
  symmetry: number;
  structure: number;
  coverage: number;
}

export function analyzeSnowflake(
  imageData: ImageData,
  width: number,
  height: number
): SnowflakeAnalysis {
  const data = imageData.data;
  const centerX = width / 2;
  const centerY = height / 2;
  
  let pixelCount = 0;
  let totalBrightness = 0;
  const pixels: Array<{ x: number; y: number; brightness: number }> = [];
  const sampleStep = width > ANALYSIS_CONFIG.LARGE_CANVAS_THRESHOLD 
    ? ANALYSIS_CONFIG.SAMPLE_STEP_LARGE 
    : ANALYSIS_CONFIG.SAMPLE_STEP_SMALL;
  
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const isBackground = 
        Math.abs(r - CANVAS_CONFIG.BACKGROUND_R) <= CANVAS_CONFIG.BACKGROUND_TOLERANCE &&
        Math.abs(g - CANVAS_CONFIG.BACKGROUND_G) <= CANVAS_CONFIG.BACKGROUND_TOLERANCE &&
        Math.abs(b - CANVAS_CONFIG.BACKGROUND_B) <= CANVAS_CONFIG.BACKGROUND_TOLERANCE;
      
      if (alpha > CANVAS_CONFIG.MIN_ALPHA && !isBackground) {
        const brightness = (r + g + b) / 3;
        
        pixels.push({
          x: x - centerX,
          y: y - centerY,
          brightness,
        });
        
        pixelCount++;
        totalBrightness += brightness;
      }
    }
  }
  
  if (pixelCount === 0) {
    return {
      similarity: 0,
      symmetry: 0,
      structure: 0,
      coverage: 0,
    };
  }
  
  const totalSampledPixels = Math.floor((width / sampleStep) * (height / sampleStep));
  const coverage = Math.min(100, (pixelCount / totalSampledPixels) * ANALYSIS_CONFIG.COVERAGE_MULTIPLIER);
  
  const symmetry = calculateSymmetry(pixels, centerX, centerY);
  const structure = calculateStructure(pixels, centerX, centerY);
  
  const similarity = Math.round(
    symmetry * ANALYSIS_CONFIG.SYMMETRY_WEIGHT + 
    structure * ANALYSIS_CONFIG.STRUCTURE_WEIGHT + 
    coverage * ANALYSIS_CONFIG.COVERAGE_WEIGHT + 
    (totalBrightness / pixelCount > ANALYSIS_CONFIG.BRIGHTNESS_THRESHOLD ? ANALYSIS_CONFIG.BRIGHTNESS_BONUS : 0)
  );
  
  return {
    similarity: Math.min(100, Math.max(0, similarity)),
    symmetry: Math.round(symmetry),
    structure: Math.round(structure),
    coverage: Math.round(coverage),
  };
}

function calculateSymmetry(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  centerX: number,
  centerY: number
): number {
  if (pixels.length === 0) return 0;
  
  const angles = [0, 60, 120, 180, 240, 300];
  const sectors = angles.map(() => new Set<string>());
  
  pixels.forEach((pixel) => {
    const angle = (Math.atan2(pixel.y, pixel.x) * 180) / Math.PI;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    let minDiff = Infinity;
    let closestSector = 0;
    angles.forEach((sectorAngle, idx) => {
      let diff = Math.abs(normalizedAngle - sectorAngle);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closestSector = idx;
      }
    });
    
    const key = `${Math.round(pixel.x)},${Math.round(pixel.y)}`;
    sectors[closestSector].add(key);
  });
  
  let symmetryScore = 0;
  for (let i = 0; i < 3; i++) {
    const sector1 = sectors[i].size;
    const sector2 = sectors[i + 3].size;
    const total = sector1 + sector2;
    if (total > 0) {
      const balance = 1 - Math.abs(sector1 - sector2) / total;
      symmetryScore += balance;
    }
  }
  
  return (symmetryScore / 3) * 100;
}

function calculateStructure(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  centerX: number,
  centerY: number
): number {
  if (pixels.length < 10) return 0;
  
  const distances = pixels.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  const maxDistance = distances.reduce((max, dist) => Math.max(max, dist), 0);
  
  if (maxDistance === 0) return 0;
  
  const radiusBins = 10;
  const bins = new Array(radiusBins).fill(0);
  
  distances.forEach((dist) => {
    const bin = Math.min(radiusBins - 1, Math.floor((dist / maxDistance) * radiusBins));
    bins[bin]++;
  });
  
  const avg = bins.reduce((a, b) => a + b, 0) / bins.length;
  const variance =
    bins.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / bins.length;
  
  const structureScore = Math.min(100, (variance / (avg + 1)) * 50);
  
  return structureScore;
}
