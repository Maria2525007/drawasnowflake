import { CANVAS_CONFIG, ANALYSIS_CONFIG } from '../config/constants';

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
  const sampleStep =
    width > ANALYSIS_CONFIG.LARGE_CANVAS_THRESHOLD
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
        Math.abs(r - CANVAS_CONFIG.BACKGROUND_R) <=
          CANVAS_CONFIG.BACKGROUND_TOLERANCE &&
        Math.abs(g - CANVAS_CONFIG.BACKGROUND_G) <=
          CANVAS_CONFIG.BACKGROUND_TOLERANCE &&
        Math.abs(b - CANVAS_CONFIG.BACKGROUND_B) <=
          CANVAS_CONFIG.BACKGROUND_TOLERANCE;

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

  let centerMassX = 0;
  let centerMassY = 0;
  pixels.forEach((p) => {
    centerMassX += p.x;
    centerMassY += p.y;
  });
  centerMassX /= pixels.length;
  centerMassY /= pixels.length;
  const centerMassDistance = Math.sqrt(centerMassX * centerMassX + centerMassY * centerMassY);
  const maxCanvasDistance = Math.sqrt(width * width + height * height) / 2;
  const centerAlignment = Math.max(0, 1 - (centerMassDistance / (maxCanvasDistance * 0.1)));

  const distances = pixels.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  const canvasSize = Math.min(width, height);
  const centerRadius = canvasSize * 0.3;
  const centerCheckRadius = canvasSize * 0.1;
  
  let isolatedCount = 0;
  pixels.forEach((pixel, index) => {
    const distance = distances[index];
    if (distance > centerRadius) {
      let minDistToOther = Infinity;
      pixels.forEach((otherPixel, otherIndex) => {
        if (index === otherIndex) return;
        const dx = pixel.x - otherPixel.x;
        const dy = pixel.y - otherPixel.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        minDistToOther = Math.min(minDistToOther, pixelDistance);
      });
      
      if (minDistToOther > canvasSize * 0.15) {
        isolatedCount++;
      }
    }
  });
  
  const isolatedPixelPenalty = isolatedCount / Math.max(1, pixels.length);

  const centerPixels = pixels.filter(
    (p) => Math.sqrt(p.x * p.x + p.y * p.y) < centerCheckRadius
  );
  const hasCenter = centerPixels.length > pixels.length * 0.05;

  const totalSampledPixels = Math.floor(
    (width / sampleStep) * (height / sampleStep)
  );
  const coverage = Math.min(
    100,
    (pixels.length / totalSampledPixels) * ANALYSIS_CONFIG.COVERAGE_MULTIPLIER
  );

  const symmetry = calculateSymmetry(pixels, centerX, centerY);
  const structure = calculateStructure(pixels, centerX, centerY);

  const minPixels = ANALYSIS_CONFIG.MIN_MEANINGFUL_PIXELS * 5;
  if (pixels.length < minPixels) {
    return {
      similarity: 0,
      symmetry: Math.round(symmetry),
      structure: Math.round(structure),
      coverage: Math.round(coverage),
    };
  }

  if (!hasCenter) {
    return {
      similarity: Math.max(0, Math.round(symmetry * 0.3 + structure * 0.2)),
      symmetry: Math.round(symmetry),
      structure: Math.round(structure),
      coverage: Math.round(coverage),
    };
  }

  const isolatedPenalty = isolatedPixelPenalty * 50;

  const coveragePenalty =
    coverage > 50 ? Math.max(0, (coverage - 50) * 0.3) : 0;
  const adjustedCoverage = Math.max(0, coverage - coveragePenalty);

  const centerAlignmentBonus = centerAlignment * 10;

  let baseSimilarity =
    symmetry * ANALYSIS_CONFIG.SYMMETRY_WEIGHT +
    structure * ANALYSIS_CONFIG.STRUCTURE_WEIGHT +
    adjustedCoverage * ANALYSIS_CONFIG.COVERAGE_WEIGHT;

  baseSimilarity -= isolatedPenalty;
  baseSimilarity += centerAlignmentBonus;

  if (symmetry < 30) {
    baseSimilarity *= 0.7;
  } else if (symmetry < 50) {
    baseSimilarity *= 0.9;
  }

  if (structure < 20) {
    baseSimilarity *= 0.7;
  } else if (structure < 40) {
    baseSimilarity *= 0.9;
  }

  if (centerAlignment < 0.3) {
    baseSimilarity *= 0.8;
  } else if (centerAlignment < 0.6) {
    baseSimilarity *= 0.95;
  }

  const brightnessBonus =
    totalBrightness / pixels.length > ANALYSIS_CONFIG.BRIGHTNESS_THRESHOLD
      ? ANALYSIS_CONFIG.BRIGHTNESS_BONUS
      : 0;

  const similarity = Math.round(baseSimilarity + brightnessBonus);

  return {
    similarity: Math.min(100, Math.max(0, similarity)),
    symmetry: Math.round(symmetry),
    structure: Math.round(structure),
    coverage: Math.round(coverage),
  };
}

function calculateSymmetry(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  _centerX: number,
  _centerY: number
): number {
  if (pixels.length === 0) return 0;

  const angles = [0, 60, 120, 180, 240, 300];
  const sectors = angles.map(() => new Set<string>());
  const sectorPixels = angles.map(() => 0);
  const sectorDistances: number[][] = angles.map(() => []);

  pixels.forEach((pixel) => {
    const distance = Math.sqrt(pixel.x * pixel.x + pixel.y * pixel.y);
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
    sectorPixels[closestSector]++;
    sectorDistances[closestSector].push(distance);
  });

  const rayQuality = sectorDistances.map((distances) => {
    if (distances.length === 0) return 0;
    const sorted = distances.sort((a, b) => a - b);
    const maxDist = Math.max(...sorted);
    const hasNearCenter = sorted[0] < maxDist * 0.4;
    const hasVariation = sorted.length > 1 && (sorted[sorted.length - 1] - sorted[0]) > maxDist * 0.15;
    const hasMultipleLayers = sorted.length >= 3;
    return (hasNearCenter ? 0.5 : 0) + (hasVariation ? 0.3 : 0) + (hasMultipleLayers ? 0.2 : 0);
  });
  const avgRayQuality = rayQuality.reduce((a, b) => a + b, 0) / rayQuality.length;

  const avgSectorSize = sectorPixels.reduce((a, b) => a + b, 0) / 6;
  let symmetryScore = 0;
  let pairBalanceSum = 0;
  let validPairs = 0;

  for (let i = 0; i < 3; i++) {
    const sector1 = sectors[i].size;
    const sector2 = sectors[i + 3].size;
    const total = sector1 + sector2;
    if (total > 0) {
      const balance = 1 - Math.abs(sector1 - sector2) / total;
      pairBalanceSum += balance;
      validPairs++;
    }
  }

  if (validPairs > 0) {
    symmetryScore = (pairBalanceSum / validPairs) * 100;
  }

  const sectorVariance =
    sectorPixels.reduce((sum, size) => {
      return sum + Math.pow(size - avgSectorSize, 2);
    }, 0) / 6;

  const maxVariance = Math.pow(avgSectorSize, 2);
  const uniformity =
    maxVariance > 0 ? 1 - Math.min(1, sectorVariance / maxVariance) : 0;

  const baseScore = symmetryScore * 0.6 + uniformity * 100 * 0.25 + avgRayQuality * 100 * 0.15;
  
  const rayBonus = avgRayQuality > 0.5 ? 1.1 : 1.0;
  return Math.min(100, baseScore * (0.75 + avgRayQuality * 0.25) * rayBonus);
}

function calculateStructure(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  _centerX: number,
  _centerY: number
): number {
  if (pixels.length < ANALYSIS_CONFIG.MIN_MEANINGFUL_PIXELS) return 0;

  const distances = pixels.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  const maxDistance = distances.reduce((max, dist) => Math.max(max, dist), 0);

  if (maxDistance === 0) return 0;

  const rayStructure = checkRayStructure(pixels, maxDistance);

  const radiusBins = 10;
  const bins = new Array(radiusBins).fill(0);

  distances.forEach((dist) => {
    const bin = Math.min(
      radiusBins - 1,
      Math.floor((dist / maxDistance) * radiusBins)
    );
    bins[bin]++;
  });

  const avg = bins.reduce((a, b) => a + b, 0) / bins.length;
  const variance =
    bins.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / bins.length;

  let structureScore = Math.min(100, (variance / (avg + 1)) * 50);

  const centerPixelCount = bins.slice(0, 2).reduce((a, b) => a + b, 0);
  const edgePixelCount = bins.slice(-2).reduce((a, b) => a + b, 0);
  const totalPixels = bins.reduce((a, b) => a + b, 0);

  if (totalPixels > 0) {
    const centerRatio = centerPixelCount / totalPixels;
    const edgeRatio = edgePixelCount / totalPixels;

    if (centerRatio > 0.15 && centerRatio < 0.4 && edgeRatio < 0.4) {
      structureScore *= 1.2;
    } else if (centerRatio > 0.7 || edgeRatio > 0.7) {
      structureScore *= 0.5;
    }

    if (centerRatio < 0.1) {
      structureScore *= 0.7;
    }
  }

  const rayBonus = rayStructure > 50 ? 1.15 : 1.0;
  return Math.min(100, (structureScore * 0.65 + rayStructure * 0.35) * rayBonus);
}

function checkRayStructure(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  maxDistance: number
): number {
  if (pixels.length < 10) return 0;

  const angleGroups: Array<Array<{ x: number; y: number; distance: number }>> = [];
  const angles = [0, 60, 120, 180, 240, 300];

  angles.forEach(() => {
    angleGroups.push([]);
  });

  pixels.forEach((pixel) => {
    const distance = Math.sqrt(pixel.x * pixel.x + pixel.y * pixel.y);
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

    if (minDiff < 30) {
      angleGroups[closestSector].push({
        x: pixel.x,
        y: pixel.y,
        distance,
      });
    }
  });

  let rayScore = 0;
  let validRays = 0;

  angleGroups.forEach((group) => {
    if (group.length < 2) return;

    group.sort((a, b) => a.distance - b.distance);

    let isRay = true;
    let prevDist = 0;
    let continuityScore = 0;
    for (let i = 0; i < group.length; i++) {
      if (i > 0) {
        const distDiff = group[i].distance - prevDist;
        if (distDiff < 0) {
          if (group[i].distance < prevDist * 0.7) {
            isRay = false;
            break;
          }
        } else {
          continuityScore += Math.min(1, distDiff / (maxDistance * 0.1));
        }
      }
      prevDist = group[i].distance;
    }

    if (isRay && group.length >= 2) {
      const distRange = group[group.length - 1].distance - group[0].distance;
      const coverage = distRange / maxDistance;
      const continuity = group.length > 2 ? Math.min(1, continuityScore / (group.length - 1)) : 0.5;
      const rayQuality = coverage * 0.7 + continuity * 0.3;
      rayScore += Math.min(100, rayQuality * 100);
      validRays++;
    }
  });

  if (validRays === 0) return 0;
  return rayScore / validRays;
}

