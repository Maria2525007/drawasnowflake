import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { store } from '../../store/store';
import { setTool } from '../../features/drawing/drawingSlice';

describe('useAppDispatch', () => {
  it('should return dispatch function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    expect(typeof result.current).toBe('function');
  });

  it('should dispatch actions', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    result.current(setTool('eraser'));

    const state = store.getState();
    expect(state.drawing.tool).toBe('eraser');
  });
});
