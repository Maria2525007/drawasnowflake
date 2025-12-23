import { Box } from '@mui/material';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree } from '../components/Tree/Tree';
import { Toolbar } from '../components/UI/Toolbar';
import { useAppDispatch } from '../hooks/useAppDispatch';
import {
  loadSnowflakes,
  Snowflake,
} from '../features/snowflake/snowflakeSlice';
import { getAllSnowflakes } from '../services/api';
import { SNOWFLAKE_CONFIG, UI_CONFIG } from '../config/constants';

export const TreePage: React.FC = () => {
  const treeCanvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSnowflakesFromServer = async () => {
      try {
        const serverSnowflakes = await getAllSnowflakes();

        if (!serverSnowflakes || serverSnowflakes.length === 0) {
          return;
        }

        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const MIN_X = SNOWFLAKE_CONFIG.BORDER_PADDING;
        const MAX_X = canvasWidth - SNOWFLAKE_CONFIG.BORDER_PADDING;
        const MIN_Y =
          SNOWFLAKE_CONFIG.SPAWN_Y_OFFSET -
          SNOWFLAKE_CONFIG.SPAWN_Y_RANDOM -
          SNOWFLAKE_CONFIG.VISIBILITY_MARGIN;
        const MAX_Y = canvasHeight + SNOWFLAKE_CONFIG.VISIBILITY_MARGIN;

        const snowflakes: Snowflake[] = serverSnowflakes.map((s) => {
          let clampedX = s.x;
          if (clampedX < MIN_X) {
            clampedX = MIN_X;
          } else if (clampedX > MAX_X) {
            clampedX = MAX_X;
          }

          let clampedY = s.y;
          if (clampedY < MIN_Y) {
            clampedY = MIN_Y;
          } else if (clampedY > MAX_Y) {
            clampedY = MAX_Y;
          }

          return {
            id: s.id || `snowflake-${Date.now()}-${Math.random()}`,
            x: clampedX,
            y: clampedY,
            rotation: s.rotation || 0,
            scale: s.scale || 1,
            pattern: s.pattern || 'custom',
            data: null,
            imageData: s.imageData || undefined,
            fallSpeed:
              s.fallSpeed ||
              SNOWFLAKE_CONFIG.MIN_FALL_SPEED +
                Math.random() *
                  (SNOWFLAKE_CONFIG.MAX_FALL_SPEED -
                    SNOWFLAKE_CONFIG.MIN_FALL_SPEED),
            isFalling: s.isFalling !== undefined ? s.isFalling : true,
            driftSpeed:
              s.driftSpeed ||
              (Math.random() - 0.5) *
                (SNOWFLAKE_CONFIG.MAX_DRIFT_SPEED -
                  SNOWFLAKE_CONFIG.MIN_DRIFT_SPEED),
            driftPhase:
              s.driftPhase !== undefined
                ? s.driftPhase
                : Math.random() * SNOWFLAKE_CONFIG.PI_MULTIPLIER,
            timeOffset: Math.random() * 20,
            startDelay: Math.random() * 3,
          };
        });

        const limitedSnowflakes = snowflakes.slice(
          0,
          SNOWFLAKE_CONFIG.MAX_SNOWFLAKES_ON_TREE
        );
        dispatch(loadSnowflakes(limitedSnowflakes));
      } catch (error) {
        console.error('Failed to load snowflakes from server:', error);
      }
    };

    loadSnowflakesFromServer();
  }, [dispatch]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: UI_CONFIG.APP_BACKGROUND_COLOR,
        overflow: 'hidden',
      }}
    >
      <Toolbar
        canvasRef={treeCanvasRef}
        currentTab={UI_CONFIG.TREE_TAB_INDEX}
        onBackToDraw={() => navigate('/draw')}
      />
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Tree ref={treeCanvasRef} />
      </Box>
    </Box>
  );
};
