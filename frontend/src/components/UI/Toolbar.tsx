import { useState, useRef, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Box,
  Drawer,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Brush,
  Clear,
  Palette,
  Download,
  ContentCopy,
  Undo,
  Redo,
  Directions,
  DeleteOutline,
  ArrowBack,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
  setTool,
  setColor,
  setBrushSize,
} from '../../features/drawing/drawingSlice';
import {
  addSnowflake,
  Snowflake,
  removeSnowflake,
} from '../../features/snowflake/snowflakeSlice';
import { SNOWFLAKE_CONFIG } from '../../config/constants';
import { undo, redo } from '../../features/history/historySlice';
import { ColorPicker } from './ColorPicker';
import { exportCanvasAsImage, copyCanvasToClipboard } from '../../utils/export';
import { trackImageExported, trackToolUsed } from '../../utils/analytics';
import type { CanvasHandle } from '../Canvas/Canvas';
import { Button } from '@mui/material';
import {
  CANVAS_CONFIG,
  ANALYSIS_CONFIG,
  ZOOM_CONFIG,
  BRUSH_CONFIG,
  ANIMATION_CONFIG,
  HEADER_CONFIG,
} from '../../config/constants';
import { t } from '../../i18n';

const extractSnowflakeFromCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): string => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (
        a > 0 &&
        !(
          Math.abs(r - CANVAS_CONFIG.BACKGROUND_R) <
            ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL &&
          Math.abs(g - CANVAS_CONFIG.BACKGROUND_G) <
            ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL &&
          Math.abs(b - CANVAS_CONFIG.BACKGROUND_B) <
            ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL
        )
      ) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  minX = Math.max(0, minX - ANALYSIS_CONFIG.EXTRACT_PADDING);
  minY = Math.max(0, minY - ANALYSIS_CONFIG.EXTRACT_PADDING);
  maxX = Math.min(canvas.width, maxX + ANALYSIS_CONFIG.EXTRACT_PADDING);
  maxY = Math.min(canvas.height, maxY + ANALYSIS_CONFIG.EXTRACT_PADDING);

  const width = maxX - minX;
  const height = maxY - minY;

  if (width <= 0 || height <= 0) {
    return canvas.toDataURL('image/png');
  }

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    return canvas.toDataURL('image/png');
  }

  tempCtx.clearRect(0, 0, width, height);

  const sourceImageData = ctx.getImageData(minX, minY, width, height);
  const sourceData = sourceImageData.data;

  for (let i = 0; i < sourceData.length; i += 4) {
    const r = sourceData[i];
    const g = sourceData[i + 1];
    const b = sourceData[i + 2];

    if (
      Math.abs(r - CANVAS_CONFIG.BACKGROUND_R) <
        ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL &&
      Math.abs(g - CANVAS_CONFIG.BACKGROUND_G) <
        ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL &&
      Math.abs(b - CANVAS_CONFIG.BACKGROUND_B) <
        ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL
    ) {
      sourceData[i + 3] = 0;
    }
  }

  tempCtx.putImageData(sourceImageData, 0, 0);

  return tempCanvas.toDataURL('image/png');
};

interface ToolbarProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  drawCanvasRef?: React.RefObject<CanvasHandle>;
  onGoToTree?: () => void;
  currentTab?: number;
  zoom?: number;
  hideGoToTreeButton?: boolean;
  onBackToDraw?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  canvasRef,
  drawCanvasRef,
  onGoToTree,
  currentTab = 0,
  zoom: zoomProp = ZOOM_CONFIG.DEFAULT,
  hideGoToTreeButton = false,
  onBackToDraw,
}) => {
  const dispatch = useAppDispatch();
  const { tool, color, brushSize } = useAppSelector((state) => state.drawing);
  const { past, future } = useAppSelector((state) => state.history);
  const snowflakes = useAppSelector((state) => state.snowflake.snowflakes);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [zoom, setZoom] = useState(zoomProp);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDrawTab = currentTab === 0;
  const isTreeTab = currentTab === 1;

  useEffect(() => {
    if (zoomProp !== zoom) {
      setZoom(zoomProp);
    }
  }, [zoomProp, zoom]);

  const handleToolChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTool: string | null
  ) => {
    if (newTool !== null) {
      dispatch(setTool(newTool as 'pencil' | 'eraser'));
      trackToolUsed(newTool);
    }
  };

  const handleColorChange = (newColor: string) => {
    dispatch(setColor(newColor));
  };

  const handleBrushSizeChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
    dispatch(setBrushSize(newValue as number));
  };

  const handleExport = () => {
    if (canvasRef?.current) {
      exportCanvasAsImage(canvasRef.current);
      trackImageExported();
      setSnackbarMessage(t('toolbar.imageExported'));
      setSnackbarOpen(true);
    }
  };

  const handleCopy = async () => {
    if (canvasRef?.current) {
      const success = await copyCanvasToClipboard(canvasRef.current);
      if (success) {
        setSnackbarMessage(t('toolbar.imageCopied'));
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(t('toolbar.copyFailed'));
        setSnackbarOpen(true);
      }
    }
  };

  const handleUndo = () => {
    if (past.length > 0) {
      dispatch(undo());
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      dispatch(redo());
    }
  };

  const handleClearCanvas = () => {
    if (drawCanvasRef?.current) {
      drawCanvasRef.current.clear();
    }
  };

  const handleGoToTreeClick = () => {
    if (onGoToTree) {
      onGoToTree();
      return;
    }

    if (!drawCanvasRef?.current) {
      setSnackbarMessage(t('toolbar.noCanvas'));
      setSnackbarOpen(true);
      return;
    }

    const imageData = drawCanvasRef.current.getImageData();
    if (!imageData) {
      setSnackbarMessage(t('toolbar.canvasEmpty'));
      setSnackbarOpen(true);
      return;
    }

    const canvas = drawCanvasRef.current.getCanvas();
    if (!canvas) {
      setSnackbarMessage(t('toolbar.canvasNotFound'));
      setSnackbarOpen(true);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setSnackbarMessage(t('toolbar.contextNotFound'));
      setSnackbarOpen(true);
      return;
    }

    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataObj.data;
    let hasContent = false;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (
        a > 0 &&
        !(
          r === CANVAS_CONFIG.BACKGROUND_R &&
          g === CANVAS_CONFIG.BACKGROUND_G &&
          b === CANVAS_CONFIG.BACKGROUND_B
        )
      ) {
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      setSnackbarMessage(t('toolbar.pleaseDraw'));
      setSnackbarOpen(true);
      return;
    }

    const imageDataWithZoom = drawCanvasRef.current.getImageData();
    if (!imageDataWithZoom) {
      setSnackbarMessage(t('toolbar.failedToGetImage'));
      setSnackbarOpen(true);
      return;
    }

    const tempImg = new Image();
    tempImg.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tempImg.width;
      tempCanvas.height = tempImg.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        setSnackbarMessage(t('toolbar.failedToProcess'));
        setSnackbarOpen(true);
        return;
      }
      tempCtx.drawImage(tempImg, 0, 0);
      const processedImageData = extractSnowflakeFromCanvas(
        tempCanvas,
        tempCtx
      );

      createSnowflakeFromImage(processedImageData);
    };
    tempImg.src = imageDataWithZoom;
  };

  const createSnowflakeFromImage = async (processedImageData: string) => {
    const randomX =
      Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;

    const newSnowflake: Snowflake = {
      id: `snowflake-${Date.now()}-${Math.random()}`,
      x: randomX,
      y:
        SNOWFLAKE_CONFIG.SPAWN_Y_OFFSET -
        Math.random() * SNOWFLAKE_CONFIG.SPAWN_Y_RANDOM,
      rotation: 0,
      scale: 0.3,
      pattern: 'custom',
      data: null,
      imageData: processedImageData,
      fallSpeed:
        SNOWFLAKE_CONFIG.MIN_FALL_SPEED +
        Math.random() *
          (SNOWFLAKE_CONFIG.MAX_FALL_SPEED - SNOWFLAKE_CONFIG.MIN_FALL_SPEED),
      isFalling: true,
      driftSpeed:
        (Math.random() - 0.5) *
        (SNOWFLAKE_CONFIG.MAX_DRIFT_SPEED - SNOWFLAKE_CONFIG.MIN_DRIFT_SPEED),
      driftPhase: Math.random() * SNOWFLAKE_CONFIG.PI_MULTIPLIER,
      timeOffset: Math.random() * 20,
      startDelay: Math.random() * 3,
    };

    if (snowflakes.length >= SNOWFLAKE_CONFIG.MAX_SNOWFLAKES_ON_TREE) {
      const oldestSnowflake = snowflakes[snowflakes.length - 1];
      if (oldestSnowflake?.id) {
        const { deleteSnowflakeFromServer } =
          await import('../../services/api');
        deleteSnowflakeFromServer(oldestSnowflake.id).catch(() => {});
        dispatch(removeSnowflake(oldestSnowflake.id));
      }
    }

    try {
      const { saveSnowflakeToServer } = await import('../../services/api');
      const savedSnowflake = await saveSnowflakeToServer(newSnowflake);
      if (savedSnowflake?.id) {
        const updatedSnowflake = { ...newSnowflake, id: savedSnowflake.id };
        dispatch(addSnowflake(updatedSnowflake));
      } else {
        dispatch(addSnowflake(newSnowflake));
      }
      if (drawCanvasRef?.current) {
        drawCanvasRef.current.clear();
      }
      if (onGoToTree) {
        onGoToTree();
      }
      setSnackbarMessage(t('toolbar.snowflakeAdded'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to save snowflake to server:', error);
      dispatch(addSnowflake(newSnowflake));
      if (drawCanvasRef?.current) {
        drawCanvasRef.current.clear();
      }
      if (onGoToTree) {
        onGoToTree();
      }
      setSnackbarMessage(t('toolbar.snowflakeAdded'));
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <MuiToolbar>
          {isTreeTab && (
            <>
              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.backToDraw')}
                onClick={() => {
                  if (onBackToDraw) {
                    onBackToDraw();
                  } else if (typeof window !== 'undefined') {
                    window.location.href = '/draw';
                  }
                }}
                sx={{ mr: 1 }}
              >
                <ArrowBack />
              </IconButton>
            </>
          )}

          {isDrawTab && (
            <>
              <ToggleButtonGroup
                value={tool}
                exclusive
                onChange={handleToolChange}
                aria-label={t('toolbar.ariaLabels.drawingTool')}
                size="small"
              >
                <ToggleButton
                  value="pencil"
                  aria-label={t('toolbar.ariaLabels.pencil')}
                >
                  <Brush />
                </ToggleButton>
                <ToggleButton
                  value="eraser"
                  aria-label={t('toolbar.ariaLabels.eraser')}
                >
                  <Clear />
                </ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ width: 150, mx: 2 }}>
                <Slider
                  value={brushSize}
                  onChange={handleBrushSizeChange}
                  min={BRUSH_CONFIG.MIN_SIZE}
                  max={BRUSH_CONFIG.MAX_SIZE}
                  aria-label={t('toolbar.ariaLabels.brushSize')}
                  size="small"
                />
              </Box>

              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.colorPicker')}
                onClick={() => setDrawerOpen(true)}
              >
                <Palette />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.undo')}
                onClick={handleUndo}
                disabled={past.length === 0}
              >
                <Undo />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.redo')}
                onClick={handleRedo}
                disabled={future.length === 0}
              >
                <Redo />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.clearCanvas')}
                onClick={handleClearCanvas}
              >
                <DeleteOutline />
              </IconButton>

              {drawCanvasRef && !hideGoToTreeButton && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Directions />}
                  onClick={handleGoToTreeClick}
                  sx={{
                    ml: 2,
                    textTransform: 'none',
                  }}
                >
                  {t('toolbar.goOnTree')}
                </Button>
              )}
            </>
          )}

          {isTreeTab && (
            <>
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {[...Array(3)].map((_, i) => {
                    const delay = i * 0.2;

                    const twinkle = keyframes`
                      0%, 100% {
                        opacity: 0.3;
                        transform: scale(0.8);
                      }
                      50% {
                        opacity: 1;
                        transform: scale(1.2);
                      }
                    `;

                    return (
                      <Box
                        key={`left-${i}`}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          boxShadow:
                            '0 0 10px #FFFFFF, 0 0 20px rgba(255, 255, 255, 0.8)',
                          animation: `${twinkle} ${ANIMATION_CONFIG.LIGHT_ANIMATION_DURATION}s ease-in-out infinite`,
                          animationDelay: `${delay}s`,
                        }}
                      />
                    );
                  })}
                </Box>

                <Box
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    background: `linear-gradient(45deg, ${HEADER_CONFIG.TEXT_GRADIENT_START} 30%, ${HEADER_CONFIG.TEXT_GRADIENT_MID} 60%, ${HEADER_CONFIG.TEXT_GRADIENT_END} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow:
                      '0 0 15px rgba(129, 212, 250, 0.7), 0 0 25px rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {t('toolbar.letsItSnow')}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {[...Array(3)].map((_, i) => {
                    const delay = i * 0.2;

                    const twinkle = keyframes`
                      0%, 100% {
                        opacity: 0.3;
                        transform: scale(0.8);
                      }
                      50% {
                        opacity: 1;
                        transform: scale(1.2);
                      }
                    `;

                    return (
                      <Box
                        key={`right-${i}`}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          boxShadow:
                            '0 0 10px #FFFFFF, 0 0 20px rgba(255, 255, 255, 0.8)',
                          animation: `${twinkle} ${ANIMATION_CONFIG.LIGHT_ANIMATION_DURATION}s ease-in-out infinite`,
                          animationDelay: `${delay}s`,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.export')}
                onClick={handleExport}
              >
                <Download />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label={t('toolbar.ariaLabels.copy')}
                onClick={handleCopy}
              >
                <ContentCopy />
              </IconButton>
            </>
          )}
        </MuiToolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <ColorPicker color={color} onColorChange={handleColorChange} />
        </Box>
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
      />
    </>
  );
};
