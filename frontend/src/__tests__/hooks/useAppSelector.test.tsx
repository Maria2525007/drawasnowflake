import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAppSelector } from '../../hooks/useAppSelector';
import { store } from '../../store/store';
import {
  setTool,
  setColor,
  setBrushSize,
} from '../../features/drawing/drawingSlice';
import { selectSnowflake } from '../../features/snowflake/snowflakeSlice';
import { clearHistory } from '../../features/history/historySlice';

describe('useAppSelector', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  beforeEach(() => {
    act(() => {
      store.dispatch(setColor('#ffffff'));
      store.dispatch(setTool('pencil'));
      store.dispatch(setBrushSize(5));
      store.dispatch(clearHistory());
    });
  });

  describe('Basic Functionality', () => {
    it('should return selected state', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing.tool),
        { wrapper }
      );
      expect(result.current).toBe('pencil');
    });

    it('should return correct initial state', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing),
        { wrapper }
      );

      expect(result.current.tool).toBe('pencil');
      expect(result.current.color).toBe('#ffffff');
      expect(result.current.brushSize).toBe(5);
    });
  });

  describe('State Updates', () => {
    it('should update when state changes', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing.tool),
        { wrapper }
      );

      expect(result.current).toBe('pencil');

      act(() => {
        store.dispatch(setTool('eraser'));
      });

      expect(result.current).toBe('eraser');
    });

    it('should update when multiple state changes occur', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing),
        { wrapper }
      );

      act(() => {
        store.dispatch(setTool('eraser'));
        store.dispatch(setColor('#ff0000'));
        store.dispatch(setBrushSize(15));
      });

      expect(result.current.tool).toBe('eraser');
      expect(result.current.color).toBe('#ff0000');
      expect(result.current.brushSize).toBe(15);
    });

    it('should not update for unrelated state changes', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing.tool),
        { wrapper }
      );

      const initialValue = result.current;

      act(() => {
        store.dispatch(selectSnowflake('some-id'));
      });

      expect(result.current).toBe(initialValue);
    });
  });

  describe('Different Selectors', () => {
    it('should select drawing state', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing),
        { wrapper }
      );

      expect(result.current).toBeDefined();
      expect(result.current.tool).toBeDefined();
      expect(result.current.color).toBeDefined();
      expect(result.current.brushSize).toBeDefined();
    });

    it('should select snowflake state', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.snowflake),
        { wrapper }
      );

      expect(result.current).toBeDefined();
      expect(result.current.snowflakes).toBeDefined();
      expect(Array.isArray(result.current.snowflakes)).toBe(true);
    });

    it('should select history state', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.history),
        { wrapper }
      );

      expect(result.current).toBeDefined();
      expect(result.current.past).toBeDefined();
      expect(result.current.present).toBeDefined();
      expect(result.current.future).toBeDefined();
    });

    it('should select nested properties', () => {
      act(() => {
        store.dispatch(setColor('#ffffff'));
      });

      const { result } = renderHook(
        () => useAppSelector((state) => state.drawing.color),
        { wrapper }
      );

      expect(result.current).toBe('#ffffff');
    });

    it('should select computed values', () => {
      const { result } = renderHook(
        () => useAppSelector((state) => state.snowflake.snowflakes.length),
        { wrapper }
      );

      expect(typeof result.current).toBe('number');
      expect(result.current).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Hooks', () => {
    it('should work with multiple selectors independently', () => {
      const { result: toolResult } = renderHook(
        () => useAppSelector((state) => state.drawing.tool),
        { wrapper }
      );

      const { result: colorResult } = renderHook(
        () => useAppSelector((state) => state.drawing.color),
        { wrapper }
      );

      act(() => {
        store.dispatch(setTool('eraser'));
        store.dispatch(setColor('#000000'));
      });

      expect(toolResult.current).toBe('eraser');
      expect(colorResult.current).toBe('#000000');
    });
  });
});
