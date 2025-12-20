import { Box, Typography, Button, Paper } from '@mui/material';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Directions } from '@mui/icons-material';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { Canvas, type CanvasHandle } from '../components/Canvas/Canvas';
import { Toolbar } from '../components/UI/Toolbar';
import { Header } from '../components/UI/Header';
import { addSnowflake, Snowflake } from '../features/snowflake/snowflakeSlice';
import { saveSnowflakeToServer } from '../services/api';
import { analyzeSnowflake } from '../utils/snowflakeAnalysis';
import {
  CANVAS_CONFIG,
  SNOWFLAKE_CONFIG,
  ANALYSIS_CONFIG,
  ZOOM_CONFIG,
  UI_CONFIG,
} from '../config/constants';
import { t } from '../i18n';

export const DrawPage: React.FC = () => {
  const [zoom, setZoom] = useState<number>(ZOOM_CONFIG.DEFAULT);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const drawCanvasRef = useRef<CanvasHandle>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleGoToTree = () => {
    if (!drawCanvasRef?.current) {
      return;
    }

    const canvas = drawCanvasRef.current.getCanvas();
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
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
      return;
    }

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
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = ANALYSIS_CONFIG.MIN_CANVAS_SIZE;
        tempCanvas.height = ANALYSIS_CONFIG.MIN_CANVAS_SIZE;
        return tempCanvas.toDataURL('image/png');
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

    const processedImageData = extractSnowflakeFromCanvas(canvas, ctx);

    const MIN_X = SNOWFLAKE_CONFIG.BORDER_PADDING;
    const MAX_X = canvas.width - SNOWFLAKE_CONFIG.BORDER_PADDING;

    const randomX = MIN_X + Math.random() * (MAX_X - MIN_X);

    const newSnowflake: Snowflake = {
      id: `snowflake-${Date.now()}-${Math.random()}`,
      x: randomX,
      y:
        SNOWFLAKE_CONFIG.SPAWN_Y_OFFSET -
        Math.random() * SNOWFLAKE_CONFIG.SPAWN_Y_RANDOM,
      rotation: 0,
      scale: drawCanvasRef.current.getZoom(),
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

    saveSnowflakeToServer(newSnowflake)
      .then((savedSnowflake) => {
        if (savedSnowflake?.id) {
          const updatedSnowflake = { ...newSnowflake, id: savedSnowflake.id };
          dispatch(addSnowflake(updatedSnowflake));
        } else {
          dispatch(addSnowflake(newSnowflake));
        }
        if (drawCanvasRef?.current) {
          drawCanvasRef.current.clear();
        }
        navigate('/tree');
      })
      .catch((error) => {
        console.error('Failed to save snowflake to server:', error);
        dispatch(addSnowflake(newSnowflake));
        if (drawCanvasRef?.current) {
          drawCanvasRef.current.clear();
        }
        navigate('/tree');
      });
  };

  const performAnalysis = useCallback(() => {
    try {
      if (!drawCanvasRef.current) {
        setSimilarity(null);
        return;
      }

      const imageData = drawCanvasRef.current.getImageDataForAnalysis();
      if (!imageData) {
        setSimilarity(null);
        return;
      }

      const analysis = analyzeSnowflake(
        imageData,
        ANALYSIS_CONFIG.CANVAS_WIDTH,
        ANALYSIS_CONFIG.CANVAS_HEIGHT
      );

      setSimilarity(Math.max(0, analysis.similarity));
    } catch (error) {
      console.error('Analysis error:', error);
      setSimilarity(null);
    }
  }, []);

  useEffect(() => {
    let isAnalyzing = false;

    const analyze = () => {
      if (isAnalyzing || !drawCanvasRef.current) {
        return;
      }

      isAnalyzing = true;

      const runAnalysis = () => {
        performAnalysis();
        isAnalyzing = false;
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(runAnalysis, {
          timeout: ANALYSIS_CONFIG.IDLE_TIMEOUT,
        });
      } else {
        setTimeout(runAnalysis, ANALYSIS_CONFIG.STROKE_END_DELAY);
      }
    };

    const intervalId = window.setInterval(() => {
      analyze();
    }, ANALYSIS_CONFIG.UPDATE_INTERVAL);

    const timeoutId = window.setTimeout(analyze, ANALYSIS_CONFIG.INITIAL_DELAY);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [performAnalysis]);

  const handleStrokeEnd = useCallback(() => {
    setTimeout(() => {
      performAnalysis();
    }, ANALYSIS_CONFIG.STROKE_END_DELAY);
  }, [performAnalysis]);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR,
      }}
    >
      <Header />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: { xs: 2, sm: 3, md: 4 },
          paddingBottom: { xs: 4, sm: 5, md: 6 },
          minHeight: 0,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: `${UI_CONFIG.MAX_PAPER_WIDTH}px`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a2332',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar
              drawCanvasRef={drawCanvasRef}
              currentTab={0}
              zoom={zoom}
              onZoomChange={(newZoom: number) => setZoom(newZoom)}
              hideGoToTreeButton
            />
          </Box>

          <Box
            sx={{
              width: '100%',
              height: `${UI_CONFIG.CANVAS_HEIGHT}px`,
              position: 'relative',
              backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR,
            }}
          >
            <Canvas
              ref={drawCanvasRef}
              zoom={zoom}
              onZoomChange={(newZoom: number) => setZoom(newZoom)}
              onStrokeEnd={handleStrokeEnd}
            />
          </Box>

          <Box
            sx={{
              padding: 3,
              backgroundColor: '#1a2332',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {similarity !== null && (
              <Typography
                variant="h6"
                sx={{
                  color:
                    similarity > UI_CONFIG.SIMILARITY_HIGH
                      ? UI_CONFIG.COLOR_HIGH
                      : similarity > UI_CONFIG.SIMILARITY_MEDIUM
                        ? UI_CONFIG.COLOR_MEDIUM
                        : UI_CONFIG.COLOR_LOW,
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                }}
              >
                {t('drawPage.similarity', { value: similarity.toFixed(1) })}
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Directions />}
              onClick={handleGoToTree}
              sx={{
                minWidth: UI_CONFIG.BUTTON_MIN_WIDTH,
                padding: UI_CONFIG.BUTTON_PADDING,
                fontSize: UI_CONFIG.BUTTON_FONT_SIZE,
                textTransform: 'none',
              }}
            >
              {t('drawPage.goOnTree')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
