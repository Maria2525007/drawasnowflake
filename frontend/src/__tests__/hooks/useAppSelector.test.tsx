import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAppSelector } from '../../hooks/useAppSelector';
import { store } from '../../store/store';
import { setTool } from '../../features/drawing/drawingSlice';

describe('useAppSelector', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('should select state', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.drawing.tool),
      { wrapper }
    );
    expect(result.current).toBe('pencil');
  });

  it('should update when state changes', () => {
    const { result } = renderHook(
      () => useAppSelector((state) => state.drawing),
      { wrapper }
    );

    expect(result.current.tool).toBe('pencil');

    act(() => {
      store.dispatch(setTool('eraser'));
    });

    expect(result.current.tool).toBe('eraser');
  });
});
