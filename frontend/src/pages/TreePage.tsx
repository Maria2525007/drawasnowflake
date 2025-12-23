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
          dispatch(loadSnowflakes([]));
          return;
        }

        const canvasWidth = window.innerWidth;
        const MIN_X = SNOWFLAKE_CONFIG.BORDER_PADDING;
        const MAX_X = canvasWidth - SNOWFLAKE_CONFIG.BORDER_PADDING;

        const sortedServerSnowflakes = [...serverSnowflakes].sort((a, b) => {
          const aId = a.id || '';
          const bId = b.id || '';
          return bId.localeCompare(aId);
        });

        const limitedServerSnowflakes = sortedServerSnowflakes.slice(
          0,
          SNOWFLAKE_CONFIG.MAX_SNOWFLAKES_ON_TREE
        );

        const availableWidth = MAX_X - MIN_X;
        const snowflakes: Snowflake[] = limitedServerSnowflakes.map((s, index) => {
          const totalSnowflakes = limitedServerSnowflakes.length;
          const basePosition = totalSnowflakes > 1 
            ? MIN_X + (index / (totalSnowflakes - 1)) * availableWidth
            : MIN_X + availableWidth / 2;
          
          const randomOffset = (Math.random() - 0.5) * (availableWidth / totalSnowflakes) * 0.5;
          let distributedX = basePosition + randomOffset;
          
          if (distributedX < MIN_X) {
            distributedX = MIN_X;
          } else if (distributedX > MAX_X) {
            distributedX = MAX_X;
          }

          const initialY =
            SNOWFLAKE_CONFIG.SPAWN_Y_OFFSET -
            Math.random() * SNOWFLAKE_CONFIG.SPAWN_Y_RANDOM;

          return {
            id: s.id || `snowflake-${Date.now()}-${Math.random()}`,
            x: distributedX,
            y: initialY,
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

        const limitedSnowflakes = snowflakes;
        
        dispatch(loadSnowflakes(limitedSnowflakes));
      } catch (error) {
        console.error('Failed to load snowflakes from server:', error);
        // Still dispatch empty array to clear any stale state
        dispatch(loadSnowflakes([]));
      }
    };

    // Load only once when component mounts
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
