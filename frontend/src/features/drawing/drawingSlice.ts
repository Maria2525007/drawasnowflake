import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DrawingTool = 'pencil' | 'eraser';

interface DrawingState {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  isDrawing: boolean;
}

const initialState: DrawingState = {
  tool: 'pencil',
  color: '#ffffff',
  brushSize: 5,
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
    },
    setIsDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },
  },
});

export const { setTool, setColor, setBrushSize, setIsDrawing } =
  drawingSlice.actions;

export default drawingSlice.reducer;
