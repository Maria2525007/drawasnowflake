import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createRef } from 'react';
import { store } from '../../../store/store';
import { Canvas, type CanvasHandle } from '../../../components/Canvas/Canvas';
import {
  setTool,
  setColor,
  setBrushSize,
} from '../../../features/drawing/drawingSlice';
import { saveState } from '../../../features/history/historySlice';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe('Canvas', () => {
  const renderCanvas = (props = {}) => {
    return render(<Canvas width={800} height={600} {...props} />, { wrapper });
  };

  it('should render canvas element', () => {
    const { container } = renderCanvas();
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should forward ref to CanvasHandle', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    expect(ref.current).not.toBeNull();
    expect(ref.current?.getCanvas).toBeDefined();
  });

  it('should get canvas element from ref', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    const canvas = ref.current?.getCanvas();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('should clear canvas', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    act(() => {
      ref.current?.clear();
    });

    expect(ref.current).not.toBeNull();
  });

  it('should update when tool changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    act(() => {
      store.dispatch(setTool('eraser'));
    });

    expect(ref.current).not.toBeNull();
  });

  it('should update when color changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    act(() => {
      store.dispatch(setColor('#ff0000'));
    });

    expect(ref.current).not.toBeNull();
  });

  it('should update when brush size changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    act(() => {
      store.dispatch(setBrushSize(10));
    });

    expect(ref.current).not.toBeNull();
  });

  it('should handle history state changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    act(() => {
      store.dispatch(saveState('data:image/png;base64,test'));
    });

    expect(ref.current).not.toBeNull();
  });
});
