import { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
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
  ({ width, height, onDraw, onStrokeEnd, zoom = ZOOM_CONFIG.DEFAULT, onZoomChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
          offCtx.fillRect(0, 0, CANVAS_CONFIG.BASE_WIDTH, CANVAS_CONFIG.BASE_HEIGHT);
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
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = width || rect.width;
      const canvasHeight = height || rect.height;

      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const offCanvasWidth = offCanvas.width;
      const offCanvasHeight = offCanvas.height;
      
      const scaledWidth = offCanvasWidth * zoom;
      const scaledHeight = offCanvasHeight * zoom;
      const offsetX = centerX - scaledWidth / 2;
      const offsetY = centerY - scaledHeight / 2;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);
      ctx.drawImage(offCanvas, 0, 0);
      ctx.restore();
    }, [zoom, width, height]);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getImageData: () => {
        if (offscreenCanvasRef.current) {
          const offCanvas = offscreenCanvasRef.current;
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = offCanvas.width * zoom;
          tempCanvas.height = offCanvas.height * zoom;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.scale(zoom, zoom);
            tempCtx.drawImage(offCanvas, 0, 0);
            return tempCanvas.toDataURL('image/png');
          }
          return offCanvas.toDataURL('image/png');
        }
        if (canvasRef.current) {
          return canvasRef.current.toDataURL('image/png');
        }
        return null;
      },
      getImageDataForAnalysis: () => {
        if (offscreenCanvasRef.current) {
          const offCanvas = offscreenCanvasRef.current;
          const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            return ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
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
    }), [zoom, renderCanvas]);

  useEffect(() => {
    drawingStateRef.current = { tool, color, brushSize };
  }, [tool, color, brushSize]);

  const [shouldRestore, setShouldRestore] = useState(false);
  const prevStateRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (shouldRestore && currentState && currentState !== prevStateRef.current && offscreenCanvasRef.current) {
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
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offCanvas = offscreenCanvasRef.current;
      if (!offCanvas) return null;
      
      const offCanvasWidth = offCanvas.width;
      const offCanvasHeight = offCanvas.height;
      const scaledWidth = offCanvasWidth * zoom;
      const scaledHeight = offCanvasHeight * zoom;
      const offsetX = centerX - scaledWidth / 2;
      const offsetY = centerY - scaledHeight / 2;
      
      const x = ((clientX - rect.left) - offsetX) / zoom;
      const y = ((clientY - rect.top) - offsetY) / zoom;
      
      return { x, y };
    };

    const draw = (currentPos: { x: number; y: number }) => {
      const lastPos = lastPosRef.current;
      if (!lastPos) return;

      const offCanvas = offscreenCanvasRef.current;
      if (!offCanvas) return;
      
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

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
      offCtx.moveTo(lastPos.x, lastPos.y);
      offCtx.lineTo(currentPos.x, currentPos.y);
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
  }, [onDraw, onStrokeEnd, dispatch, zoom, renderCanvas]);


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
            touchAction: 'none',
            cursor:
              drawingStateRef.current.tool === 'eraser' ? 'crosshair' : 'default',
          }}
        />
      </Box>
    );
});

Canvas.displayName = 'Canvas';
