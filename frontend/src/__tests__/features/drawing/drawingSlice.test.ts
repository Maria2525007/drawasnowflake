import drawingReducer, {
  setTool,
  setColor,
  setBrushSize,
  setIsDrawing,
} from '../../../features/drawing/drawingSlice';

describe('drawingSlice', () => {
  const initialState = {
    tool: 'pencil' as const,
    color: '#ffffff',
    brushSize: 5,
    isDrawing: false,
  };

  describe('Initial State', () => {
    it('should return initial state', () => {
      expect(drawingReducer(undefined, { type: 'unknown' })).toEqual({
        tool: 'pencil',
        color: '#ffffff',
        brushSize: 5,
        isDrawing: false,
      });
    });
  });

  describe('setTool', () => {
    it('should set tool to pencil', () => {
      const state = drawingReducer(initialState, setTool('pencil'));
      expect(state.tool).toBe('pencil');
    });

    it('should set tool to eraser', () => {
      const state = drawingReducer(initialState, setTool('eraser'));
      expect(state.tool).toBe('eraser');
    });

    it('should preserve other state when setting tool', () => {
      const state = drawingReducer(initialState, setTool('eraser'));
      expect(state.color).toBe('#ffffff');
      expect(state.brushSize).toBe(5);
      expect(state.isDrawing).toBe(false);
    });
  });

  describe('setColor', () => {
    it('should set color to a hex value', () => {
      const state = drawingReducer(initialState, setColor('#ff0000'));
      expect(state.color).toBe('#ff0000');
    });

    it('should set color to rgb value', () => {
      const state = drawingReducer(initialState, setColor('rgb(255, 0, 0)'));
      expect(state.color).toBe('rgb(255, 0, 0)');
    });

    it('should preserve other state when setting color', () => {
      const state = drawingReducer(initialState, setColor('#00ff00'));
      expect(state.tool).toBe('pencil');
      expect(state.brushSize).toBe(5);
      expect(state.isDrawing).toBe(false);
    });
  });

  describe('setBrushSize', () => {
    it('should set brush size to a positive number', () => {
      const state = drawingReducer(initialState, setBrushSize(10));
      expect(state.brushSize).toBe(10);
    });

    it('should set brush size to minimum value', () => {
      const state = drawingReducer(initialState, setBrushSize(1));
      expect(state.brushSize).toBe(1);
    });

    it('should set brush size to large value', () => {
      const state = drawingReducer(initialState, setBrushSize(50));
      expect(state.brushSize).toBe(50);
    });

    it('should preserve other state when setting brush size', () => {
      const state = drawingReducer(initialState, setBrushSize(15));
      expect(state.tool).toBe('pencil');
      expect(state.color).toBe('#ffffff');
      expect(state.isDrawing).toBe(false);
    });
  });

  describe('setIsDrawing', () => {
    it('should set isDrawing to true', () => {
      const state = drawingReducer(initialState, setIsDrawing(true));
      expect(state.isDrawing).toBe(true);
    });

    it('should set isDrawing to false', () => {
      const stateWithDrawing = { ...initialState, isDrawing: true };
      const state = drawingReducer(stateWithDrawing, setIsDrawing(false));
      expect(state.isDrawing).toBe(false);
    });

    it('should preserve other state when setting isDrawing', () => {
      const state = drawingReducer(initialState, setIsDrawing(true));
      expect(state.tool).toBe('pencil');
      expect(state.color).toBe('#ffffff');
      expect(state.brushSize).toBe(5);
    });
  });

  describe('Multiple Actions', () => {
    it('should handle multiple state changes', () => {
      let state = drawingReducer(initialState, setTool('eraser'));
      state = drawingReducer(state, setColor('#000000'));
      state = drawingReducer(state, setBrushSize(20));
      state = drawingReducer(state, setIsDrawing(true));

      expect(state.tool).toBe('eraser');
      expect(state.color).toBe('#000000');
      expect(state.brushSize).toBe(20);
      expect(state.isDrawing).toBe(true);
    });

    it('should handle rapid state changes', () => {
      let state = drawingReducer(undefined, { type: 'unknown' });
      for (let i = 0; i < 10; i++) {
        state = drawingReducer(state, setBrushSize(i));
        state = drawingReducer(state, setColor(`#${i.toString(16).repeat(6)}`));
      }

      expect(state.brushSize).toBe(9);
      expect(state.color).toBe('#999999');
    });
  });
});
