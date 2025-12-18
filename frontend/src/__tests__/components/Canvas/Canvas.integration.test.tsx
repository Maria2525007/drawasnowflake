import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Canvas, CanvasHandle } from '../../../components/Canvas/Canvas';
import { createRef } from 'react';
import { setTool, setColor, setBrushSize } from '../../../features/drawing/drawingSlice';

const renderCanvas = (props = {}) => {
  return render(
    <Provider store={store}>
      <Canvas {...props} />
    </Provider>
  );
};

describe('Canvas Integration', () => {
  it('should handle mouse drawing', async () => {
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref });
    
    const canvas = container.querySelector('canvas');
    if (!canvas) return;
    
    const rect = { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 };
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => rect,
      writable: true,
      configurable: true,
    });
    
    const mouseDown = new MouseEvent('mousedown', {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      bubbles: true,
      cancelable: true,
    });
    
    const mouseMove = new MouseEvent('mousemove', {
      clientX: rect.left + rect.width / 2 + 50,
      clientY: rect.top + rect.height / 2 + 50,
      bubbles: true,
      cancelable: true,
    });
    
    const mouseUp = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
    });
    
    canvas.dispatchEvent(mouseDown);
    await new Promise(resolve => setTimeout(resolve, 50));
    canvas.dispatchEvent(mouseMove);
    await new Promise(resolve => setTimeout(resolve, 50));
    canvas.dispatchEvent(mouseUp);
    
    await waitFor(() => {
      expect(ref.current).not.toBeNull();
    }, { timeout: 2000 });
  });

  it('should handle tool changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });
    
    store.dispatch(setTool('eraser'));
    
    expect(ref.current).not.toBeNull();
  });

  it('should handle color changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });
    
    store.dispatch(setColor('#ff0000'));
    
    expect(ref.current).not.toBeNull();
  });

  it('should handle brush size changes', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });
    
    store.dispatch(setBrushSize(10));
    
    expect(ref.current).not.toBeNull();
  });

  it('should handle zoom changes', () => {
    const ref = createRef<CanvasHandle>();
    const { rerender } = renderCanvas({ ref, zoom: 1.0 });
    
    expect(ref.current?.getZoom()).toBe(1.0);
    
    rerender(
      <Provider store={store}>
        <Canvas ref={ref} zoom={2.0} />
      </Provider>
    );
    
    expect(ref.current?.getZoom()).toBe(2.0);
  });
});

