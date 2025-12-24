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

  const canvasSize = Math.min(width, height);
  const maxDistance = Math.sqrt(width * width + height * height) / 2;

  let centerMassX = 0;
  let centerMassY = 0;
  pixels.forEach((p) => {
    centerMassX += p.x;
    centerMassY += p.y;
  });
  centerMassX /= pixels.length;
  centerMassY /= pixels.length;
  const centerMassDistance = Math.sqrt(
    centerMassX * centerMassX + centerMassY * centerMassY
  );
  const centerAlignment = Math.max(
    0,
    1 - centerMassDistance / (maxDistance * 0.1)
  );

  const distances = pixels.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  const centerRadius = canvasSize * 0.3;
  const centerCheckRadius = canvasSize * 0.1;
  const edgeThreshold = maxDistance * 0.7;

  let isolatedCount = 0;
  let edgePixelCount = 0;
  let chaoticPixelCount = 0;

  pixels.forEach((pixel, index) => {
    const distance = distances[index];

    if (distance > edgeThreshold) {
      edgePixelCount++;
    }

    if (distance > centerRadius) {
      let minDistToOther = Infinity;
      let nearbyCount = 0;
      pixels.forEach((otherPixel, otherIndex) => {
        if (index === otherIndex) return;
        const dx = pixel.x - otherPixel.x;
        const dy = pixel.y - otherPixel.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        minDistToOther = Math.min(minDistToOther, pixelDistance);
        if (pixelDistance < canvasSize * 0.05) {
          nearbyCount++;
        }
      });

      if (minDistToOther > canvasSize * 0.12) {
        isolatedCount++;
      }

      if (nearbyCount < 2) {
        chaoticPixelCount++;
      }
    }
  });

  const isolatedPixelPenalty = isolatedCount / Math.max(1, pixels.length);
  const edgePixelPenalty = edgePixelCount / Math.max(1, pixels.length);
  const chaoticPixelPenalty = chaoticPixelCount / Math.max(1, pixels.length);

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

  const symmetry = calculateSymmetry(pixels, centerX, centerY, canvasSize);
  const structure = calculateStructure(pixels, centerX, centerY, canvasSize);

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
    const noCenterPenalty = 0.5;
    return {
      similarity: Math.max(
        0,
        Math.round((symmetry * 0.3 + structure * 0.2) * noCenterPenalty)
      ),
      symmetry: Math.round(symmetry),
      structure: Math.round(structure),
      coverage: Math.round(coverage),
    };
  }

  const isolatedPenalty = isolatedPixelPenalty * 60;
  const edgePenalty = edgePixelPenalty * 40;
  const chaoticPenalty = chaoticPixelPenalty * 30;

  const coveragePenalty =
    coverage > 50 ? Math.max(0, (coverage - 50) * 0.3) : 0;
  const adjustedCoverage = Math.max(0, coverage - coveragePenalty);

  const centerAlignmentBonus = centerAlignment * 10;

  let baseSimilarity =
    symmetry * ANALYSIS_CONFIG.SYMMETRY_WEIGHT +
    structure * ANALYSIS_CONFIG.STRUCTURE_WEIGHT +
    adjustedCoverage * ANALYSIS_CONFIG.COVERAGE_WEIGHT;

  baseSimilarity -= isolatedPenalty;
  baseSimilarity -= edgePenalty;
  baseSimilarity -= chaoticPenalty;
  baseSimilarity += centerAlignmentBonus;

  if (symmetry < 40) {
    baseSimilarity *= 0.6;
  } else if (symmetry < 60) {
    baseSimilarity *= 0.85;
  }

  if (structure < 30) {
    baseSimilarity *= 0.6;
  } else if (structure < 50) {
    baseSimilarity *= 0.85;
  }

  if (centerAlignment < 0.4) {
    baseSimilarity *= 0.7;
  } else if (centerAlignment < 0.7) {
    baseSimilarity *= 0.9;
  }

  if (isolatedPixelPenalty > 0.15) {
    baseSimilarity *= 0.5;
  } else if (isolatedPixelPenalty > 0.08) {
    baseSimilarity *= 0.75;
  }

  if (edgePixelPenalty > 0.2) {
    baseSimilarity *= 0.6;
  } else if (edgePixelPenalty > 0.1) {
    baseSimilarity *= 0.85;
  }

  if (chaoticPixelPenalty > 0.2) {
    baseSimilarity *= 0.7;
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
  _centerY: number,
  canvasSize: number
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

    if (minDiff < 35) {
      const key = `${Math.round(pixel.x)},${Math.round(pixel.y)}`;
      sectors[closestSector].add(key);
      sectorPixels[closestSector]++;
      sectorDistances[closestSector].push(distance);
    }
  });

  const rayQuality = sectorDistances.map((distances) => {
    if (distances.length === 0) return 0;
    const sorted = distances.sort((a, b) => a - b);
    const maxDist = Math.max(...sorted);
    const minDist = sorted[0];

    if (minDist > canvasSize * 0.15) return 0;

    const hasNearCenter = minDist < canvasSize * 0.1;
    const hasVariation =
      sorted.length > 1 &&
      sorted[sorted.length - 1] - sorted[0] > maxDist * 0.2;
    const hasMultipleLayers = sorted.length >= 4;
    const hasGoodRange = maxDist > canvasSize * 0.2;

    return (
      (hasNearCenter ? 0.4 : 0) +
      (hasVariation ? 0.3 : 0) +
      (hasMultipleLayers ? 0.2 : 0) +
      (hasGoodRange ? 0.1 : 0)
    );
  });
  const avgRayQuality =
    rayQuality.reduce((a, b) => a + b, 0) / rayQuality.length;

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

  const activeSectors = sectorPixels.filter((size) => size > 0).length;
  const sectorCompleteness = activeSectors / 6;

  const baseScore =
    symmetryScore * 0.5 +
    uniformity * 100 * 0.3 +
    avgRayQuality * 100 * 0.15 +
    sectorCompleteness * 100 * 0.05;

  if (symmetryScore < 50 || uniformity < 0.5) {
    return Math.min(100, baseScore * 0.6);
  }

  const rayBonus =
    avgRayQuality > 0.6 ? 1.15 : avgRayQuality > 0.4 ? 1.05 : 1.0;
  return Math.min(100, baseScore * rayBonus);
}

function calculateStructure(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  _centerX: number,
  _centerY: number,
  canvasSize: number
): number {
  if (pixels.length < ANALYSIS_CONFIG.MIN_MEANINGFUL_PIXELS) return 0;

  const distances = pixels.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  const maxDistance = distances.reduce((max, dist) => Math.max(max, dist), 0);

  if (maxDistance === 0) return 0;

  const rayStructure = checkRayStructure(pixels, maxDistance, canvasSize);

  const radiusBins = 12;
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

  const centerPixelCount = bins.slice(0, 3).reduce((a, b) => a + b, 0);
  const edgePixelCount = bins.slice(-3).reduce((a, b) => a + b, 0);
  const totalPixels = bins.reduce((a, b) => a + b, 0);

  if (totalPixels > 0) {
    const centerRatio = centerPixelCount / totalPixels;
    const edgeRatio = edgePixelCount / totalPixels;

    if (centerRatio > 0.2 && centerRatio < 0.45 && edgeRatio < 0.35) {
      structureScore *= 1.25;
    } else if (centerRatio > 0.65 || edgeRatio > 0.65) {
      structureScore *= 0.4;
    }

    if (centerRatio < 0.12) {
      structureScore *= 0.6;
    }
  }

  const rayBonus = rayStructure > 60 ? 1.2 : rayStructure > 40 ? 1.1 : 1.0;
  return Math.min(100, (structureScore * 0.6 + rayStructure * 0.4) * rayBonus);
}

function checkRayStructure(
  pixels: Array<{ x: number; y: number; brightness: number }>,
  maxDistance: number,
  canvasSize: number
): number {
  if (pixels.length < 10) return 0;

  const angleGroups: Array<Array<{ x: number; y: number; distance: number }>> =
    [];
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

    if (minDiff < 25) {
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
    if (group.length < 3) return;

    group.sort((a, b) => a.distance - b.distance);

    const minDist = group[0].distance;
    if (minDist > canvasSize * 0.12) return;

    let isRay = true;
    let prevDist = 0;
    let continuityScore = 0;
    let gaps = 0;

    for (let i = 0; i < group.length; i++) {
      if (i > 0) {
        const distDiff = group[i].distance - prevDist;
        if (distDiff < 0) {
          if (group[i].distance < prevDist * 0.8) {
            isRay = false;
            break;
          }
        } else {
          const gapSize = distDiff / (maxDistance * 0.08);
          if (gapSize > 1.5) {
            gaps++;
          }
          continuityScore += Math.min(1, 1 / (gapSize + 0.1));
        }
      }
      prevDist = group[i].distance;
    }

    if (isRay && group.length >= 3) {
      const distRange = group[group.length - 1].distance - group[0].distance;
      const coverage = distRange / maxDistance;
      const continuity =
        group.length > 2
          ? Math.min(1, continuityScore / (group.length - 1))
          : 0.5;
      const gapPenalty = Math.max(0, 1 - gaps / group.length);
      const rayQuality = coverage * 0.6 + continuity * 0.3 + gapPenalty * 0.1;
      rayScore += Math.min(100, rayQuality * 100);
      validRays++;
    }
  });

  if (validRays === 0) return 0;
  if (validRays < 3) return (rayScore / validRays) * 0.6;
  return rayScore / validRays;
}
