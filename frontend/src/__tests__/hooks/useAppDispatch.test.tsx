import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { store } from '../../store/store';
import {
  setTool,
  setColor,
  setBrushSize,
} from '../../features/drawing/drawingSlice';

describe('useAppDispatch', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  describe('Basic Functionality', () => {
    it('should return dispatch function', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });
      expect(typeof result.current).toBe('function');
    });

    it('should return the same dispatch function on re-render', () => {
      const { result, rerender } = renderHook(() => useAppDispatch(), {
        wrapper,
      });
      const firstDispatch = result.current;

      rerender();

      expect(result.current).toBe(firstDispatch);
    });
  });

  describe('Action Dispatching', () => {
    it('should dispatch actions correctly', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      result.current(setTool('eraser'));

      const state = store.getState();
      expect(state.drawing.tool).toBe('eraser');
    });

    it('should dispatch multiple actions', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      result.current(setTool('pencil'));
      result.current(setColor('#ff0000'));
      result.current(setBrushSize(10));

      const state = store.getState();
      expect(state.drawing.tool).toBe('pencil');
      expect(state.drawing.color).toBe('#ff0000');
      expect(state.drawing.brushSize).toBe(10);
    });

    it('should handle action creators correctly', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      const action = setTool('eraser');
      result.current(action);

      const state = store.getState();
      expect(state.drawing.tool).toBe('eraser');
    });
  });

  describe('Type Safety', () => {
    it('should accept AppDispatch type', () => {
      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      expect(typeof result.current).toBe('function');
      expect(() => result.current(setTool('pencil'))).not.toThrow();
    });
  });
});
