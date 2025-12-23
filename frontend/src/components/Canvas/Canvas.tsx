import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { saveState } from '../../features/history/historySlice';
import {
  CANVAS_CONFIG,
  BRUSH_CONFIG,
  ZOOM_CONFIG,
} from '../../config/constants';

interface CanvasProps {
  width?: number;
  height?: number;
  onDraw?: (x: number, y: number) => void;
  onStrokeEnd?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export interface CanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getImageData: () => string | null;
  getImageDataForAnalysis: () => ImageData | null;
  clear: () => void;
  getZoom: () => number;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  (
    {
      width,
      height,
      onDraw,
      onStrokeEnd,
      zoom = ZOOM_CONFIG.DEFAULT,
      onZoomChange: _onZoomChange,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const drawingStateRef = useRef<{
      tool: 'pencil' | 'eraser';
      color: string;
      brushSize: number;
    }>({
      tool: 'pencil',
      color: BRUSH_CONFIG.DEFAULT_COLOR,
      brushSize: BRUSH_CONFIG.DEFAULT_SIZE,
    });
    const dispatch = useAppDispatch();

    const { tool, color, brushSize } = useAppSelector((state) => state.drawing);
    const { present: currentState } = useAppSelector((state) => state.history);

    useEffect(() => {
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = CANVAS_CONFIG.BASE_WIDTH;
        offscreenCanvasRef.current.height = CANVAS_CONFIG.BASE_HEIGHT;
        const offCtx = offscreenCanvasRef.current.getContext('2d');
        if (offCtx) {
          offCtx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
          offCtx.fillRect(
            0,
            0,
            CANVAS_CONFIG.BASE_WIDTH,
            CANVAS_CONFIG.BASE_HEIGHT
          );
        }
      }
    }, []);

    const renderCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const offCanvas = offscreenCanvasRef.current;
      if (!canvas || !offCanvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const canvasWidth = width || containerRect.width;
      const canvasHeight = height || containerRect.height;

      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const offCanvasWidth = offCanvas.width;
      const offCanvasHeight = offCanvas.height;

      const referenceWidth = CANVAS_CONFIG.BASE_WIDTH;
      const referenceHeight = CANVAS_CONFIG.BASE_HEIGHT;
      const scaleX = canvasWidth / referenceWidth;
      const scaleY = canvasHeight / referenceHeight;
      const baseScale = Math.min(scaleX, scaleY);

      const finalScale = baseScale * zoom;

      const visibleWidthInCanvas = canvasWidth / finalScale;
      const visibleHeightInCanvas = canvasHeight / finalScale;

      const offCanvasCenterX = offCanvasWidth / 2;
      const offCanvasCenterY = offCanvasHeight / 2;

      const sourceX = Math.max(0, offCanvasCenterX - visibleWidthInCanvas / 2);
      const sourceY = Math.max(0, offCanvasCenterY - visibleHeightInCanvas / 2);
      const sourceEndX = Math.min(
        offCanvasWidth,
        offCanvasCenterX + visibleWidthInCanvas / 2
      );
      const sourceEndY = Math.min(
        offCanvasHeight,
        offCanvasCenterY + visibleHeightInCanvas / 2
      );
      const sourceWidth = sourceEndX - sourceX;
      const sourceHeight = sourceEndY - sourceY;

      const visibleCenterX = canvasWidth / 2;
      const visibleCenterY = canvasHeight / 2;
      const destWidth = sourceWidth * finalScale;
      const destHeight = sourceHeight * finalScale;
      const destX = visibleCenterX - destWidth / 2;
      const destY = visibleCenterY - destHeight / 2;

      ctx.save();
      if (sourceWidth > 0 && sourceHeight > 0) {
        ctx.drawImage(
          offCanvas,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          destX,
          destY,
          destWidth,
          destHeight
        );
      }
      ctx.restore();
    }, [zoom, width, height]);

    useImperativeHandle(
      ref,
      () => ({
        getCanvas: () => canvasRef.current,
        getImageData: () => {
          if (offscreenCanvasRef.current) {
            return offscreenCanvasRef.current.toDataURL('image/png');
          }
          if (canvasRef.current) {
            return canvasRef.current.toDataURL('image/png');
          }
          return null;
        },
        getImageDataForAnalysis: () => {
          if (offscreenCanvasRef.current) {
            const offCanvas = offscreenCanvasRef.current;
            const ctx = offCanvas.getContext('2d', {
              willReadFrequently: true,
            });
            if (ctx) {
              const baseWidth = CANVAS_CONFIG.BASE_WIDTH;
              const baseHeight = CANVAS_CONFIG.BASE_HEIGHT;

              const centerX = Math.floor(offCanvas.width / 2);
              const centerY = Math.floor(offCanvas.height / 2);

              const startX = Math.max(0, centerX - baseWidth / 2);
              const startY = Math.max(0, centerY - baseHeight / 2);
              const endX = Math.min(offCanvas.width, startX + baseWidth);
              const endY = Math.min(offCanvas.height, startY + baseHeight);

              const width = endX - startX;
              const height = endY - startY;

              const imageData = ctx.getImageData(startX, startY, width, height);

              if (width === baseWidth && height === baseHeight) {
                return imageData;
              }

              const normalizedData = new ImageData(baseWidth, baseHeight);
              const scaleX = width / baseWidth;
              const scaleY = height / baseHeight;

              for (let y = 0; y < baseHeight; y++) {
                for (let x = 0; x < baseWidth; x++) {
                  const srcX = Math.floor(x * scaleX);
                  const srcY = Math.floor(y * scaleY);
                  const srcIdx = (srcY * width + srcX) * 4;
                  const dstIdx = (y * baseWidth + x) * 4;

                  normalizedData.data[dstIdx] = imageData.data[srcIdx];
                  normalizedData.data[dstIdx + 1] = imageData.data[srcIdx + 1];
                  normalizedData.data[dstIdx + 2] = imageData.data[srcIdx + 2];
                  normalizedData.data[dstIdx + 3] = imageData.data[srcIdx + 3];
                }
              }

              return normalizedData;
            }
          }
          return null;
        },
        clear: () => {
          if (offscreenCanvasRef.current) {
            const ctx = offscreenCanvasRef.current.getContext('2d');
            if (ctx) {
              const width = offscreenCanvasRef.current.width;
              const height = offscreenCanvasRef.current.height;
              ctx.clearRect(0, 0, width, height);
              ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
              ctx.fillRect(0, 0, width, height);
            }
          }
          renderCanvas();
        },
        getZoom: () => zoom,
      }),
      [zoom, renderCanvas]
    );

    useEffect(() => {
      drawingStateRef.current = { tool, color, brushSize };
    }, [tool, color, brushSize]);

    const [shouldRestore, setShouldRestore] = useState(false);
    const prevStateRef = useRef<string | null>(null);

    const ensureCanvasSize = useCallback((x: number, y: number) => {
      const offCanvas = offscreenCanvasRef.current;
      if (!offCanvas) return;

      const currentWidth = offCanvas.width;
      const currentHeight = offCanvas.height;
      const centerX = currentWidth / 2;
      const centerY = currentHeight / 2;

      const relativeX = x - centerX;
      const relativeY = y - centerY;

      let needsResize = false;
      let newWidth = currentWidth;
      let newHeight = currentHeight;

      const margin = 1000;
      const maxDistX = Math.abs(relativeX) + margin;
      const maxDistY = Math.abs(relativeY) + margin;

      if (maxDistX > centerX) {
        newWidth = Math.max(newWidth, Math.ceil(maxDistX * 2));
        needsResize = true;
      }
      if (maxDistY > centerY) {
        newHeight = Math.max(newHeight, Math.ceil(maxDistY * 2));
        needsResize = true;
      }

      if (needsResize) {
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          const newCanvas = document.createElement('canvas');
          newCanvas.width = newWidth;
          newCanvas.height = newHeight;
          const newCtx = newCanvas.getContext('2d');
          if (newCtx) {
            newCtx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
            newCtx.fillRect(0, 0, newWidth, newHeight);

            const newCenterX = newWidth / 2;
            const newCenterY = newHeight / 2;
            const offsetX = newCenterX - centerX;
            const offsetY = newCenterY - centerY;
            newCtx.drawImage(offCanvas, offsetX, offsetY);

            offscreenCanvasRef.current = newCanvas;
          }
        }
      }
    }, []);

    useEffect(() => {
      if (
        shouldRestore &&
        currentState &&
        currentState !== prevStateRef.current &&
        offscreenCanvasRef.current
      ) {
        const img = new Image();
        img.onload = () => {
          const offCanvas = offscreenCanvasRef.current;
          if (offCanvas) {
            const offCtx = offCanvas.getContext('2d');
            if (offCtx) {
              offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
              offCtx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
              offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
              offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
              renderCanvas();
            }
          }
        };
        img.src = currentState;
        prevStateRef.current = currentState;
        setShouldRestore(false);
      }
    }, [currentState, shouldRestore, renderCanvas]);

    const { past, future } = useAppSelector((state) => state.history);
    useEffect(() => {
      if (past.length > 0 || future.length > 0) {
        setShouldRestore(true);
      }
    }, [past.length, future.length]);

    useEffect(() => {
      const handleResize = () => {
        renderCanvas();
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [renderCanvas]);

    useEffect(() => {
      renderCanvas();
    }, [renderCanvas]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const getCoordinates = (
        e: MouseEvent | TouchEvent
      ): { x: number; y: number } | null => {
        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
          clientX = e.clientX;
          clientY = e.clientY;
        } else {
          return null;
        }

        const offCanvas = offscreenCanvasRef.current;
        if (!offCanvas) return null;

        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        const canvasWidth = rect.width;
        const canvasHeight = rect.height;

        const referenceWidth = CANVAS_CONFIG.BASE_WIDTH;
        const referenceHeight = CANVAS_CONFIG.BASE_HEIGHT;
        const scaleX = canvasWidth / referenceWidth;
        const scaleY = canvasHeight / referenceHeight;
        const baseScale = Math.min(scaleX, scaleY);
        const finalScale = baseScale * zoom;

        const visibleCenterX = canvasWidth / 2;
        const visibleCenterY = canvasHeight / 2;

        const relativeX = canvasX - visibleCenterX;
        const relativeY = canvasY - visibleCenterY;

        const offCanvasCenterX = offCanvas.width / 2;
        const offCanvasCenterY = offCanvas.height / 2;

        const x = offCanvasCenterX + relativeX / finalScale;
        const y = offCanvasCenterY + relativeY / finalScale;

        ensureCanvasSize(x, y);

        const updatedOffCanvas = offscreenCanvasRef.current;
        if (updatedOffCanvas) {
          const updatedCenterX = updatedOffCanvas.width / 2;
          const updatedCenterY = updatedOffCanvas.height / 2;
          const updatedX = updatedCenterX + relativeX / finalScale;
          const updatedY = updatedCenterY + relativeY / finalScale;
          return { x: updatedX, y: updatedY };
        }

        return { x, y };
      };

      const draw = (currentPos: { x: number; y: number }) => {
        const lastPos = lastPosRef.current;
        if (!lastPos) return;

        const offCanvas = offscreenCanvasRef.current;
        if (!offCanvas) return;

        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) return;

        const canvasX = currentPos.x;
        const canvasY = currentPos.y;
        const lastCanvasX = lastPos.x;
        const lastCanvasY = lastPos.y;

        offCtx.save();

        const state = drawingStateRef.current;
        offCtx.lineWidth = state.brushSize;
        offCtx.lineCap = 'round';
        offCtx.lineJoin = 'round';

        if (state.tool === 'eraser') {
          offCtx.globalCompositeOperation = 'destination-out';
        } else {
          offCtx.globalCompositeOperation = 'source-over';
          offCtx.strokeStyle = state.color;
        }

        offCtx.beginPath();
        offCtx.moveTo(lastCanvasX, lastCanvasY);
        offCtx.lineTo(canvasX, canvasY);
        offCtx.stroke();

        offCtx.restore();

        lastPosRef.current = currentPos;

        renderCanvas();

        if (onDraw) {
          onDraw(currentPos.x, currentPos.y);
        }
      };

      const handleStart = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        const pos = getCoordinates(e);
        if (pos) {
          isDrawingRef.current = true;
          lastPosRef.current = pos;
        }
      };

      const handleMove = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        if (!isDrawingRef.current) return;

        const pos = getCoordinates(e);
        if (pos) {
          draw(pos);
        }
      };

      const handleEnd = () => {
        if (isDrawingRef.current) {
          const offCanvas = offscreenCanvasRef.current;
          if (offCanvas) {
            const imageData = offCanvas.toDataURL('image/png');
            dispatch(saveState(imageData));
          }
          if (onStrokeEnd) {
            onStrokeEnd();
          }
        }
        isDrawingRef.current = false;
        lastPosRef.current = null;
      };

      canvas.addEventListener('mousedown', handleStart);
      canvas.addEventListener('mousemove', handleMove);
      canvas.addEventListener('mouseup', handleEnd);
      canvas.addEventListener('mouseleave', handleEnd);

      canvas.addEventListener('touchstart', handleStart, { passive: false });
      canvas.addEventListener('touchmove', handleMove, { passive: false });
      canvas.addEventListener('touchend', handleEnd);
      canvas.addEventListener('touchcancel', handleEnd);

      return () => {
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('mouseup', handleEnd);
        canvas.removeEventListener('mouseleave', handleEnd);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('touchend', handleEnd);
        canvas.removeEventListener('touchcancel', handleEnd);
      };
    }, [onDraw, onStrokeEnd, dispatch, zoom, renderCanvas, ensureCanvasSize]);

    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor:
              drawingStateRef.current.tool === 'eraser'
                ? 'crosshair'
                : 'default',
            display: 'block',
          }}
        />
      </Box>
    );
  }
);

Canvas.displayName = 'Canvas';
