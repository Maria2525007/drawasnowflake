import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAppSelector } from '../../hooks/useAppSelector';
import { store } from '../../store/store';
import { setTool } from '../../features/drawing/drawingSlice';

describe('useAppSelector', () => {
  it('should return selected state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () => useAppSelector((state) => state.drawing.tool),
      { wrapper }
    );
    expect(result.current).toBe('pencil');
  });

  it('should update when state changes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result, rerender } = renderHook(
      () => useAppSelector((state) => state.drawing.tool),
      { wrapper }
    );
    expect(result.current).toBe('pencil');

    act(() => {
      store.dispatch(setTool('eraser'));
    });
    rerender();

    expect(result.current).toBe('eraser');
  });
});
