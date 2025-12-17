import drawingReducer, {
  setTool,
  setColor,
  setBrushSize,
  setIsDrawing,
} from '../../../features/drawing/drawingSlice';

describe('drawingSlice', () => {
  it('should set tool', () => {
    const state = drawingReducer(undefined, setTool('eraser'));
    expect(state.tool).toBe('eraser');
  });

  it('should set color', () => {
    const state = drawingReducer(undefined, setColor('#ff0000'));
    expect(state.color).toBe('#ff0000');
  });

  it('should set brush size', () => {
    const state = drawingReducer(undefined, setBrushSize(10));
    expect(state.brushSize).toBe(10);
  });

  it('should set is drawing', () => {
    const state = drawingReducer(undefined, setIsDrawing(true));
    expect(state.isDrawing).toBe(true);
  });
});

