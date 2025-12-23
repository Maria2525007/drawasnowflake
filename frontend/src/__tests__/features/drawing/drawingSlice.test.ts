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

  it('should return initial state', () => {
    const state = drawingReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
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
  });

  describe('setColor', () => {
    it('should set color', () => {
      const state = drawingReducer(initialState, setColor('#ff0000'));
      expect(state.color).toBe('#ff0000');
    });
  });

  describe('setBrushSize', () => {
    it('should set brush size', () => {
      const state = drawingReducer(initialState, setBrushSize(10));
      expect(state.brushSize).toBe(10);
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
  });
});
