import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SNOWFLAKE_CONFIG, ANIMATION_CONFIG } from '../../config/constants';

export interface Snowflake {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  pattern: string;
  data: unknown;
  imageData?: string;
  fallSpeed?: number;
  isFalling?: boolean;
  driftSpeed?: number;
  driftPhase?: number;
  timeOffset?: number;
  startDelay?: number;
}

interface SnowflakeState {
  snowflakes: Snowflake[];
  selectedId: string | null;
  animationSpeed: number;
  isAnimating: boolean;
}

const initialState: SnowflakeState = {
  snowflakes: [],
  selectedId: null,
  animationSpeed: ANIMATION_CONFIG.DEFAULT_SPEED,
  isAnimating: true,
};

const snowflakeSlice = createSlice({
  name: 'snowflake',
  initialState,
  reducers: {
    addSnowflake: (state, action: PayloadAction<Snowflake>) => {
      state.snowflakes.push(action.payload);
    },
    removeSnowflake: (state, action: PayloadAction<string>) => {
      state.snowflakes = state.snowflakes.filter(
        (s) => s.id !== action.payload
      );
    },
    updateSnowflake: (
      state,
      action: PayloadAction<Partial<Snowflake> & { id: string }>
    ) => {
      const index = state.snowflakes.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.snowflakes[index] = {
          ...state.snowflakes[index],
          ...action.payload,
        };
      }
    },
    selectSnowflake: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    clearSnowflakes: (state) => {
      state.snowflakes = [];
      state.selectedId = null;
    },
    setAnimationSpeed: (state, action: PayloadAction<number>) => {
      state.animationSpeed = Math.max(
        ANIMATION_CONFIG.MIN_SPEED,
        Math.min(ANIMATION_CONFIG.MAX_SPEED, action.payload)
      );
    },
    toggleAnimation: (state) => {
      state.isAnimating = !state.isAnimating;
    },
    loadSnowflakes: (state, action: PayloadAction<Snowflake[]>) => {
      state.snowflakes = action.payload;
    },
    animateSnowflakes: (
      state,
      action: PayloadAction<{
        deltaTime: number;
        canvasHeight: number;
        canvasWidth: number;
        currentTime?: number;
      }>
    ) => {
      const { deltaTime, canvasHeight, canvasWidth, currentTime } =
        action.payload;
      const globalTime = currentTime ?? Date.now() / 1000;

      const MIN_X = SNOWFLAKE_CONFIG.BORDER_PADDING;
      const MAX_X = canvasWidth - SNOWFLAKE_CONFIG.BORDER_PADDING;

      state.snowflakes.forEach((snowflake) => {
        const startDelay = snowflake.startDelay ?? 0;
        const effectiveGlobalTime = globalTime - startDelay;
        const canAnimate = effectiveGlobalTime >= 0;

        snowflake.rotation +=
          deltaTime * state.animationSpeed * SNOWFLAKE_CONFIG.ROTATION_SPEED;
        if (snowflake.rotation >= SNOWFLAKE_CONFIG.FULL_ROTATION) {
          snowflake.rotation -= SNOWFLAKE_CONFIG.FULL_ROTATION;
        }

        if (snowflake.isFalling && snowflake.fallSpeed && canAnimate) {
          snowflake.y += snowflake.fallSpeed * deltaTime;

          if (
            snowflake.driftSpeed !== undefined &&
            snowflake.driftPhase !== undefined
          ) {
            const timeOffset = snowflake.timeOffset ?? Math.random() * 20;
            snowflake.timeOffset = timeOffset;
            const time = effectiveGlobalTime + timeOffset;
            const phaseOffset = snowflake.driftPhase;
            const drift =
              Math.sin(
                time * SNOWFLAKE_CONFIG.DRIFT_FREQUENCY * 0.5 + phaseOffset
              ) *
              snowflake.driftSpeed *
              deltaTime;
            snowflake.x += drift;

            if (snowflake.x < MIN_X) {
              snowflake.x = MIN_X;
            } else if (snowflake.x > MAX_X) {
              snowflake.x = MAX_X;
            }
          }

          if (
            snowflake.y >
            canvasHeight + SNOWFLAKE_CONFIG.RESET_BOTTOM_OFFSET
          ) {
            snowflake.y =
              SNOWFLAKE_CONFIG.RESET_Y_OFFSET -
              Math.random() * SNOWFLAKE_CONFIG.RESET_Y_RANDOM;
            snowflake.x = MIN_X + Math.random() * (MAX_X - MIN_X);
            if (snowflake.driftPhase !== undefined) {
              snowflake.driftPhase =
                Math.random() * SNOWFLAKE_CONFIG.PI_MULTIPLIER;
            }
            if (snowflake.timeOffset === undefined) {
              snowflake.timeOffset = Math.random() * 20;
            }
          }
        }
      });
    },
  },
});

export const {
  addSnowflake,
  removeSnowflake,
  updateSnowflake,
  selectSnowflake,
  clearSnowflakes,
  setAnimationSpeed,
  toggleAnimation,
  loadSnowflakes,
  animateSnowflakes,
} = snowflakeSlice.actions;

export default snowflakeSlice.reducer;
