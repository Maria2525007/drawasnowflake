import { setTool, setColor, setBrushSize, setIsDrawing } from '../../../features/drawing/drawingSlice';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('drawingSlice', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.resetModules();
  });

  it('should return initial state with default brush size', () => {
    const drawingReducer = require('../../../features/drawing/drawingSlice').default;
    const state = drawingReducer(undefined, { type: 'unknown' });
    expect(state.tool).toBe('pencil');
    expect(state.color).toBe('#ffffff');
    expect(state.brushSize).toBe(20);
    expect(state.isDrawing).toBe(false);
  });

  it('should load brush size from localStorage', () => {
    localStorageMock.setItem('drawasnowflake_brushSize', '30');
    jest.resetModules();
    const drawingReducer = require('../../../features/drawing/drawingSlice').default;
    const state = drawingReducer(undefined, { type: 'unknown' });
    expect(state.brushSize).toBe(30);
  });

  it('should use default brush size if localStorage value is invalid', () => {
    localStorageMock.setItem('drawasnowflake_brushSize', 'invalid');
    jest.resetModules();
    const drawingReducer = require('../../../features/drawing/drawingSlice').default;
    const state = drawingReducer(undefined, { type: 'unknown' });
    expect(state.brushSize).toBe(20);
  });

  it('should use default brush size if localStorage value is out of range', () => {
    localStorageMock.setItem('drawasnowflake_brushSize', '100');
    jest.resetModules();
    const drawingReducer = require('../../../features/drawing/drawingSlice').default;
    const state = drawingReducer(undefined, { type: 'unknown' });
    expect(state.brushSize).toBe(20);
  });

  it('should use default brush size if localStorage value is too small', () => {
    localStorageMock.setItem('drawasnowflake_brushSize', '0');
    jest.resetModules();
    const drawingReducer = require('../../../features/drawing/drawingSlice').default;
    const state = drawingReducer(undefined, { type: 'unknown' });
    expect(state.brushSize).toBe(20);
  });

  describe('setTool', () => {
    it('should set tool to pencil', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      const state = drawingReducer(initialState, setTool('pencil'));
      expect(state.tool).toBe('pencil');
    });

    it('should set tool to eraser', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      const state = drawingReducer(initialState, setTool('eraser'));
      expect(state.tool).toBe('eraser');
    });
  });

  describe('setColor', () => {
    it('should set color', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      const state = drawingReducer(initialState, setColor('#ff0000'));
      expect(state.color).toBe('#ff0000');
    });
  });

  describe('setBrushSize', () => {
    it('should set brush size', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      const state = drawingReducer(initialState, setBrushSize(10));
      expect(state.brushSize).toBe(10);
    });

    it('should save brush size to localStorage', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      drawingReducer(initialState, setBrushSize(25));
      expect(localStorageMock.getItem('drawasnowflake_brushSize')).toBe('25');
    });
  });

  describe('setIsDrawing', () => {
    it('should set isDrawing to true', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      const state = drawingReducer(initialState, setIsDrawing(true));
      expect(state.isDrawing).toBe(true);
    });

    it('should set isDrawing to false', () => {
      jest.resetModules();
      const drawingReducer = require('../../../features/drawing/drawingSlice').default;
      const initialState = drawingReducer(undefined, { type: 'unknown' });
      const stateWithDrawing = drawingReducer(initialState, setIsDrawing(true));
      const state = drawingReducer(stateWithDrawing, setIsDrawing(false));
      expect(state.isDrawing).toBe(false);
    });
  });
});
