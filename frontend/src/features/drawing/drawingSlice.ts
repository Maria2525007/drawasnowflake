import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BRUSH_CONFIG } from '../../config/constants';

export type DrawingTool = 'pencil' | 'eraser';

interface DrawingState {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  isDrawing: boolean;
}

const BRUSH_SIZE_STORAGE_KEY = 'drawasnowflake_brushSize';

const getInitialBrushSize = (): number => {
  if (typeof window === 'undefined') {
    return BRUSH_CONFIG.DEFAULT_SIZE;
  }
  
  const saved = localStorage.getItem(BRUSH_SIZE_STORAGE_KEY);
  if (saved !== null) {
    const parsed = Number(saved);
    if (!isNaN(parsed) && parsed >= BRUSH_CONFIG.MIN_SIZE && parsed <= BRUSH_CONFIG.MAX_SIZE) {
      return parsed;
    }
  }
  
  return BRUSH_CONFIG.DEFAULT_SIZE;
};

const initialState: DrawingState = {
  tool: 'pencil',
  color: '#ffffff',
  brushSize: getInitialBrushSize(),
  isDrawing: false,
};

const drawingSlice = createSlice({
  name: 'drawing',
  initialState,
  reducers: {
    setTool: (state, action: PayloadAction<DrawingTool>) => {
      state.tool = action.payload;
    },
    setColor: (state, action: PayloadAction<string>) => {
      state.color = action.payload;
    },
    setBrushSize: (state, action: PayloadAction<number>) => {
      state.brushSize = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(BRUSH_SIZE_STORAGE_KEY, String(action.payload));
      }
    },
    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
  },
});

export const { setTool, setColor, setBrushSize, setIsDrawing } =
  drawingSlice.actions;

export default drawingSlice.reducer;
