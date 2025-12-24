import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Directions, Add, Remove } from '@mui/icons-material';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { Canvas, type CanvasHandle } from '../components/Canvas/Canvas';
import { Toolbar } from '../components/UI/Toolbar';
import { Header } from '../components/UI/Header';
import {
  addSnowflake,
  Snowflake,
  removeSnowflake,
} from '../features/snowflake/snowflakeSlice';
import {
  saveSnowflakeToServer,
  deleteSnowflakeFromServer,
} from '../services/api';
import { useAppSelector } from '../hooks/useAppSelector';
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
  const location = useLocation();
  const dispatch = useAppDispatch();
  const snowflakes = useAppSelector((state) => state.snowflake.snowflakes);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleGoToTree = () => {
    if (!drawCanvasRef?.current) {
      return;
    }

    const imageDataObj = drawCanvasRef.current.getImageDataForAnalysis();
    if (!imageDataObj) {
      return;
    }

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

    const extractSnowflakeFromImageData = (imageData: ImageData): string => {
      const data = imageData.data;
      const imgWidth = imageData.width;
      const imgHeight = imageData.height;

      let minX = imgWidth;
      let minY = imgHeight;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < imgHeight; y++) {
        for (let x = 0; x < imgWidth; x++) {
          const idx = (y * imgWidth + x) * 4;
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
      maxX = Math.min(imgWidth, maxX + ANALYSIS_CONFIG.EXTRACT_PADDING);
      maxY = Math.min(imgHeight, maxY + ANALYSIS_CONFIG.EXTRACT_PADDING);

      const width = maxX - minX;
      const height = maxY - minY;

      if (width <= 0 || height <= 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = ANALYSIS_CONFIG.MIN_CANVAS_SIZE;
        tempCanvas.height = ANALYSIS_CONFIG.MIN_CANVAS_SIZE;
        return tempCanvas.toDataURL('image/png');
      }

      const extractWidth = maxX - minX;
      const extractHeight = maxY - minY;
      const extractData = new Uint8ClampedArray(
        extractWidth * extractHeight * 4
      );

      for (let y = 0; y < extractHeight; y++) {
        for (let x = 0; x < extractWidth; x++) {
          const srcIdx = ((minY + y) * imgWidth + (minX + x)) * 4;
          const dstIdx = (y * extractWidth + x) * 4;
          extractData[dstIdx] = data[srcIdx];
          extractData[dstIdx + 1] = data[srcIdx + 1];
          extractData[dstIdx + 2] = data[srcIdx + 2];
          extractData[dstIdx + 3] = data[srcIdx + 3];
        }
      }

      const extractImageData = new ImageData(
        extractData,
        extractWidth,
        extractHeight
      );
      const extractDataArray = extractImageData.data;

      for (let i = 0; i < extractDataArray.length; i += 4) {
        const r = extractDataArray[i];
        const g = extractDataArray[i + 1];
        const b = extractDataArray[i + 2];

        if (
          Math.abs(r - CANVAS_CONFIG.BACKGROUND_R) <
            ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL &&
          Math.abs(g - CANVAS_CONFIG.BACKGROUND_G) <
            ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL &&
          Math.abs(b - CANVAS_CONFIG.BACKGROUND_B) <
            ANALYSIS_CONFIG.BACKGROUND_TOLERANCE_SMALL
        ) {
          extractDataArray[i + 3] = 0;
        }
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = extractWidth;
      tempCanvas.height = extractHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        return tempCanvas.toDataURL('image/png');
      }

      tempCtx.putImageData(extractImageData, 0, 0);
      return tempCanvas.toDataURL('image/png');
    };

    const processedImageData = extractSnowflakeFromImageData(imageDataObj);

    const canvasWidth = window.innerWidth;
    const MIN_X = SNOWFLAKE_CONFIG.BORDER_PADDING;
    const MAX_X = canvasWidth - SNOWFLAKE_CONFIG.BORDER_PADDING;

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

    if (snowflakes.length >= SNOWFLAKE_CONFIG.MAX_SNOWFLAKES_ON_TREE) {
      const oldestSnowflake = snowflakes[snowflakes.length - 1];
      if (oldestSnowflake?.id) {
        deleteSnowflakeFromServer(oldestSnowflake.id).catch(() => {});
        dispatch(removeSnowflake(oldestSnowflake.id));
      }
    }

    saveSnowflakeToServer(newSnowflake)
      .then(() => {
        if (drawCanvasRef?.current) {
          drawCanvasRef.current.clear();
        }
        navigate('/tree');
      })
      .catch((error) => {
        console.error('Failed to save snowflake to server:', error);
        alert(
          'Не удалось сохранить снежинку на сервер. Она будет видна только до перезагрузки страницы.'
        );
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
        imageData.width,
        imageData.height
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

  useEffect(() => {
    const shouldAutoCenter =
      (location.state as { fromTree?: boolean })?.fromTree === true;

    if (!shouldAutoCenter) {
      setZoom(ZOOM_CONFIG.DEFAULT);
      return;
    }

    if (isMobile && drawCanvasRef.current && location.pathname === '/draw') {
      const timeoutId = setTimeout(() => {
        const canvas = drawCanvasRef.current?.getCanvas();
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const canvasWidth = rect.width;
          const canvasHeight = rect.height;
          const baseWidth = CANVAS_CONFIG.BASE_WIDTH;
          const baseHeight = CANVAS_CONFIG.BASE_HEIGHT;

          const scaleX = canvasWidth / baseWidth;
          const scaleY = canvasHeight / baseHeight;
          const optimalZoom = Math.min(scaleX, scaleY) * 0.9;

          const clampedZoom = Math.max(
            ZOOM_CONFIG.MIN,
            Math.min(ZOOM_CONFIG.MAX, optimalZoom)
          );

          setZoom(clampedZoom);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isMobile, location.pathname, location.state]);

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
              onStrokeEnd={handleStrokeEnd}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                padding: '4px 8px',
                borderRadius: 2,
                boxShadow: 2,
                maxWidth: 'calc(100% - 16px)',
              }}
            >
              <IconButton
                size="small"
                onClick={() => {
                  const newZoom = Math.max(
                    ZOOM_CONFIG.MIN,
                    zoom - ZOOM_CONFIG.STEP
                  );
                  setZoom(newZoom);
                }}
                disabled={zoom <= ZOOM_CONFIG.MIN}
                sx={{
                  color:
                    zoom <= ZOOM_CONFIG.MIN
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'white',
                  padding: '4px',
                  minWidth: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Box
                sx={{
                  fontSize: '0.75rem',
                  color: 'white',
                  fontWeight: 500,
                  minWidth: 36,
                  textAlign: 'center',
                  userSelect: 'none',
                }}
              >
                {Math.round(zoom * 100)}%
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  const newZoom = Math.min(
                    ZOOM_CONFIG.MAX,
                    zoom + ZOOM_CONFIG.STEP
                  );
                  setZoom(newZoom);
                }}
                disabled={zoom >= ZOOM_CONFIG.MAX}
                sx={{
                  color:
                    zoom >= ZOOM_CONFIG.MAX
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'white',
                  padding: '4px',
                  minWidth: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
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
