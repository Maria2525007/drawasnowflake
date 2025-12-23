import { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { animateSnowflakes } from '../../features/snowflake/snowflakeSlice';
import {
  CANVAS_CONFIG,
  SNOWFLAKE_CONFIG,
  TREE_CONFIG,
  BRUSH_CONFIG,
} from '../../config/constants';

interface TreeCanvasProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const imageCache = new Map<string, HTMLImageElement>();

const preloadImage = (src: string, onLoad?: () => void): HTMLImageElement => {
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.onload = () => {
      if (onLoad) onLoad();
    };
    img.src = src;
    imageCache.set(src, img);
  } else if (img.complete && onLoad) {
    onLoad();
  }
  return img;
};

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  canvasRef: externalRef,
}) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalRef || internalRef;
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);
  const { snowflakes, isAnimating } = useAppSelector(
    (state) => state.snowflake
  );
  const dispatch = useAppDispatch();

  const drawTree = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      animationTime: number = 0
    ) => {
      ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const treeWidth = Math.min(
        width * TREE_CONFIG.WIDTH_RATIO,
        TREE_CONFIG.MAX_WIDTH
      );
      const treeHeight = height * TREE_CONFIG.HEIGHT_RATIO;
      const treeTop = height * TREE_CONFIG.TOP_OFFSET;
      const trunkHeight = height * TREE_CONFIG.TRUNK_HEIGHT_RATIO;

      ctx.fillStyle = TREE_CONFIG.TREE_COLOR;

      ctx.beginPath();
      ctx.moveTo(centerX, treeTop + treeHeight * 0.2);
      ctx.lineTo(centerX - treeWidth * 0.15, treeTop + treeHeight * 0.35);
      ctx.lineTo(centerX - treeWidth * 0.1, treeTop + treeHeight * 0.5);
      ctx.lineTo(centerX - treeWidth * 0.15, treeTop + treeHeight * 0.65);
      ctx.lineTo(centerX - treeWidth * 0.05, treeTop + treeHeight * 0.8);
      ctx.lineTo(centerX + treeWidth * 0.05, treeTop + treeHeight * 0.8);
      ctx.lineTo(centerX + treeWidth * 0.15, treeTop + treeHeight * 0.65);
      ctx.lineTo(centerX + treeWidth * 0.1, treeTop + treeHeight * 0.5);
      ctx.lineTo(centerX + treeWidth * 0.15, treeTop + treeHeight * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, treeTop + treeHeight * 0.4);
      ctx.lineTo(centerX - treeWidth * 0.25, treeTop + treeHeight * 0.55);
      ctx.lineTo(centerX - treeWidth * 0.15, treeTop + treeHeight * 0.7);
      ctx.lineTo(centerX - treeWidth * 0.25, treeTop + treeHeight * 0.85);
      ctx.lineTo(centerX - treeWidth * 0.1, treeTop + treeHeight);
      ctx.lineTo(centerX + treeWidth * 0.1, treeTop + treeHeight);
      ctx.lineTo(centerX + treeWidth * 0.25, treeTop + treeHeight * 0.85);
      ctx.lineTo(centerX + treeWidth * 0.15, treeTop + treeHeight * 0.7);
      ctx.lineTo(centerX + treeWidth * 0.25, treeTop + treeHeight * 0.55);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, treeTop + treeHeight * 0.6);
      ctx.lineTo(centerX - treeWidth * 0.35, treeTop + treeHeight * 0.75);
      ctx.lineTo(centerX - treeWidth * 0.2, treeTop + treeHeight * 0.9);
      ctx.lineTo(centerX - treeWidth * 0.35, treeTop + treeHeight);
      ctx.lineTo(centerX - treeWidth * 0.15, treeTop + treeHeight);
      ctx.lineTo(centerX + treeWidth * 0.15, treeTop + treeHeight);
      ctx.lineTo(centerX + treeWidth * 0.35, treeTop + treeHeight);
      ctx.lineTo(centerX + treeWidth * 0.2, treeTop + treeHeight * 0.9);
      ctx.lineTo(centerX + treeWidth * 0.35, treeTop + treeHeight * 0.75);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = TREE_CONFIG.GARLAND_COLOR;
      ctx.lineWidth = TREE_CONFIG.GARLAND_WIDTH;
      ctx.beginPath();

      const garlandPoints = [
        { y: treeTop + treeHeight * 0.25, xOffset: 0.05 },
        { y: treeTop + treeHeight * 0.35, xOffset: 0.12 },
        { y: treeTop + treeHeight * 0.45, xOffset: 0.18 },
        { y: treeTop + treeHeight * 0.55, xOffset: 0.22 },
        { y: treeTop + treeHeight * 0.65, xOffset: 0.25 },
        { y: treeTop + treeHeight * 0.75, xOffset: 0.28 },
        { y: treeTop + treeHeight * 0.85, xOffset: 0.3 },
        { y: treeTop + treeHeight * 0.95, xOffset: 0.32 },
      ];

      let isLeft = true;
      garlandPoints.forEach((point, index) => {
        const x = centerX + (isLeft ? -1 : 1) * treeWidth * point.xOffset;
        if (index === 0) {
          ctx.moveTo(x, point.y);
        } else {
          ctx.lineTo(x, point.y);
        }
        isLeft = !isLeft;
      });
      ctx.stroke();

      garlandPoints.forEach((point, index) => {
        const x =
          centerX + (index % 2 === 0 ? -1 : 1) * treeWidth * point.xOffset;
        const colorIndex =
          (index +
            Math.floor(
              animationTime * TREE_CONFIG.LIGHT_ANIMATION_MULTIPLIER
            )) %
          TREE_CONFIG.LIGHT_COLORS.length;
        const baseColor = TREE_CONFIG.LIGHT_COLORS[colorIndex];

        const gradient = ctx.createRadialGradient(
          x,
          point.y,
          0,
          x,
          point.y,
          TREE_CONFIG.LIGHT_RADIUS
        );
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.5, baseColor + '80');
        gradient.addColorStop(1, baseColor + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, point.y, TREE_CONFIG.LIGHT_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, point.y, TREE_CONFIG.LIGHT_BULB_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${TREE_CONFIG.LIGHT_OPACITY})`;
        ctx.beginPath();
        ctx.arc(
          x - TREE_CONFIG.LIGHT_HIGHLIGHT_OFFSET,
          point.y - TREE_CONFIG.LIGHT_HIGHLIGHT_OFFSET,
          TREE_CONFIG.LIGHT_HIGHLIGHT_RADIUS,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      const ornaments = [
        {
          y: treeTop + treeHeight * 0.3,
          xOffset: 0.04,
          color: TREE_CONFIG.ORNAMENT_COLORS[0],
          size: TREE_CONFIG.ORNAMENT_SIZES[0],
        },
        {
          y: treeTop + treeHeight * 0.5,
          xOffset: -0.12,
          color: TREE_CONFIG.ORNAMENT_COLORS[1],
          size: TREE_CONFIG.ORNAMENT_SIZES[1],
        },
        {
          y: treeTop + treeHeight * 0.55,
          xOffset: 0.1,
          color: TREE_CONFIG.ORNAMENT_COLORS[2],
          size: TREE_CONFIG.ORNAMENT_SIZES[1],
        },
        {
          y: treeTop + treeHeight * 0.75,
          xOffset: -0.15,
          color: TREE_CONFIG.ORNAMENT_COLORS[3],
          size: TREE_CONFIG.ORNAMENT_SIZES[2],
        },
        {
          y: treeTop + treeHeight * 0.8,
          xOffset: 0.14,
          color: TREE_CONFIG.ORNAMENT_COLORS[4],
          size: TREE_CONFIG.ORNAMENT_SIZES[2],
        },
        {
          y: treeTop + treeHeight * 0.93,
          xOffset: -0.18,
          color: TREE_CONFIG.ORNAMENT_COLORS[5],
          size: TREE_CONFIG.ORNAMENT_SIZES[2],
        },
      ];

      ornaments.forEach((ornament) => {
        const x = centerX + treeWidth * ornament.xOffset;

        ctx.fillStyle = `rgba(0, 0, 0, ${TREE_CONFIG.ORNAMENT_SHADOW_OPACITY})`;
        ctx.beginPath();
        ctx.ellipse(
          x,
          ornament.y + ornament.size * TREE_CONFIG.ORNAMENT_SHADOW_RATIO,
          ornament.size * 0.6,
          ornament.size * TREE_CONFIG.ORNAMENT_HIGHLIGHT_RATIO,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        const ornamentGradient = ctx.createRadialGradient(
          x - ornament.size * TREE_CONFIG.ORNAMENT_HIGHLIGHT_RATIO,
          ornament.y - ornament.size * TREE_CONFIG.ORNAMENT_HIGHLIGHT_RATIO,
          0,
          x,
          ornament.y,
          ornament.size
        );
        ornamentGradient.addColorStop(
          TREE_CONFIG.ORNAMENT_GRADIENT_STOP_1,
          TREE_CONFIG.ORNAMENT_WHITE
        );
        ornamentGradient.addColorStop(
          TREE_CONFIG.ORNAMENT_GRADIENT_STOP_2,
          ornament.color
        );
        ornamentGradient.addColorStop(
          TREE_CONFIG.ORNAMENT_GRADIENT_STOP_3,
          TREE_CONFIG.ORNAMENT_BLACK
        );

        ctx.fillStyle = ornamentGradient;
        ctx.beginPath();
        ctx.arc(x, ornament.y, ornament.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${TREE_CONFIG.LIGHT_OPACITY})`;
        ctx.beginPath();
        ctx.arc(
          x - ornament.size * TREE_CONFIG.ORNAMENT_HIGHLIGHT_RATIO,
          ornament.y - ornament.size * TREE_CONFIG.ORNAMENT_HIGHLIGHT_RATIO,
          ornament.size * TREE_CONFIG.ORNAMENT_HIGHLIGHT_RATIO,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = TREE_CONFIG.ORNAMENT_CAP_COLOR;
        ctx.beginPath();
        ctx.arc(
          x,
          ornament.y - ornament.size,
          TREE_CONFIG.ORNAMENT_CAP_RADIUS,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillRect(
          x - TREE_CONFIG.ORNAMENT_CAP_WIDTH / 2,
          ornament.y - ornament.size - TREE_CONFIG.ORNAMENT_CAP_HEIGHT / 2,
          TREE_CONFIG.ORNAMENT_CAP_WIDTH,
          TREE_CONFIG.ORNAMENT_CAP_HEIGHT
        );
      });

      ctx.fillStyle = TREE_CONFIG.TRUNK_COLOR;
      ctx.fillRect(
        centerX - TREE_CONFIG.TRUNK_WIDTH / 2,
        treeTop + treeHeight,
        TREE_CONFIG.TRUNK_WIDTH,
        trunkHeight
      );
    },
    []
  );

  useEffect(() => {
    const totalImages = snowflakes.filter((s) => s.imageData).length;

    if (totalImages === 0) return;

    snowflakes.forEach((snowflake) => {
      if (snowflake.imageData) {
        preloadImage(snowflake.imageData);
      }
    });
  }, [snowflakes]);

  const drawSnowflake = useCallback(
    (ctx: CanvasRenderingContext2D, snowflake: (typeof snowflakes)[0]) => {
      ctx.save();
      ctx.translate(snowflake.x, snowflake.y);
      ctx.rotate((snowflake.rotation * Math.PI) / 180);
      
      const fixedSize = TREE_CONFIG.FIXED_SNOWFLAKE_SIZE_ON_TREE;

      if (snowflake.imageData) {
        const img = preloadImage(snowflake.imageData);

        if (img.complete && img.naturalWidth > 0) {
          const aspectRatio = img.width / img.height;
          let imgWidth = fixedSize;
          let imgHeight = fixedSize;

          if (img.width > img.height) {
            imgWidth = fixedSize;
            imgHeight = fixedSize / aspectRatio;
          } else {
            imgHeight = fixedSize;
            imgWidth = fixedSize * aspectRatio;
          }

          ctx.drawImage(
            img,
            -imgWidth / 2,
            -imgHeight / 2,
            imgWidth,
            imgHeight
          );
        }
      } else {
        ctx.strokeStyle = BRUSH_CONFIG.DEFAULT_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const branches = 6;
        const angleStep = (Math.PI * 2) / branches;
        const radius = fixedSize / 2;

        for (let i = 0; i < branches; i++) {
          const angle = i * angleStep;
          const endX = Math.cos(angle) * radius;
          const endY = Math.sin(angle) * radius;

          ctx.moveTo(0, 0);
          ctx.lineTo(endX, endY);

          const subRadius = radius * 0.6;
          const subAngle1 = angle + angleStep / 3;
          const subAngle2 = angle - angleStep / 3;

          ctx.moveTo(endX * 0.5, endY * 0.5);
          ctx.lineTo(
            Math.cos(subAngle1) * subRadius,
            Math.sin(subAngle1) * subRadius
          );

          ctx.moveTo(endX * 0.5, endY * 0.5);
          ctx.lineTo(
            Math.cos(subAngle2) * subRadius,
            Math.sin(subAngle2) * subRadius
          );
        }

        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    drawTree(ctx, width, height, animationTimeRef.current);

    snowflakes.forEach((snowflake) => {
      if (
        snowflake.y > -SNOWFLAKE_CONFIG.VISIBILITY_MARGIN &&
        snowflake.y < height + SNOWFLAKE_CONFIG.VISIBILITY_MARGIN
      ) {
        drawSnowflake(ctx, snowflake);
      }
    });
  }, [snowflakes, drawTree, drawSnowflake, canvasRef]);

  useEffect(() => {
    render();
  }, [render]);

  const animate = useCallback(() => {
    const now = performance.now();
    const deltaTime = lastTimeRef.current
      ? (now - lastTimeRef.current) / 1000
      : 0;
    lastTimeRef.current = now;

    animationTimeRef.current += deltaTime;
    if (animationTimeRef.current > TREE_CONFIG.ANIMATION_TIME_RESET) {
      animationTimeRef.current = 0;
    }

    if (isAnimating && deltaTime > 0) {
      const canvas = canvasRef.current;
      const canvasHeight = canvas
        ? canvas.getBoundingClientRect().height
        : window.innerHeight;
      const canvasWidth = canvas
        ? canvas.getBoundingClientRect().width
        : window.innerWidth;

      const currentTime = performance.now() / 1000;
      dispatch(
        animateSnowflakes({ deltaTime, canvasHeight, canvasWidth, currentTime })
      );
      render();
    } else {
      render();
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isAnimating, dispatch, render, canvasRef]);

  useEffect(() => {
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, animate]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};
