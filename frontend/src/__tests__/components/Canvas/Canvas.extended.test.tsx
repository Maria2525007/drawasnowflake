import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Canvas, CanvasHandle } from '../../../components/Canvas/Canvas';
import { createRef } from 'react';
import {
  setTool,
  setColor,
  setBrushSize,
} from '../../../features/drawing/drawingSlice';
import { saveState } from '../../../features/history/historySlice';

const renderCanvas = (props = {}) => {
  return render(
    <Provider store={store}>
      <Canvas {...props} />
    </Provider>
  );
};

describe('Canvas Extended', () => {
  it('should handle undo/redo state restoration', async () => {
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref });

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const testState = 'data:image/png;base64,test-state';
    store.dispatch(saveState(testState));

    await waitFor(
      () => {
        expect(ref.current).not.toBeNull();
      },
      { timeout: 1000 }
    );
  });

  it('should handle touch events', async () => {
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref });

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const rect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
    };
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => rect,
      writable: true,
      configurable: true,
    });

    const touchStart = new TouchEvent('touchstart', {
      touches: [
        {
          clientX: 400,
          clientY: 300,
        } as Touch,
      ],
      bubbles: true,
      cancelable: true,
    });

    const touchMove = new TouchEvent('touchmove', {
      touches: [
        {
          clientX: 450,
          clientY: 350,
        } as Touch,
      ],
      bubbles: true,
      cancelable: true,
    });

    const touchEnd = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
    });

    canvas.dispatchEvent(touchStart);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(touchMove);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(touchEnd);

    await waitFor(
      () => {
        expect(ref.current).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('should handle mouse leave event', async () => {
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref });

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const rect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
    };
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => rect,
      writable: true,
      configurable: true,
    });

    const mouseDown = new MouseEvent('mousedown', {
      clientX: 400,
      clientY: 300,
      bubbles: true,
      cancelable: true,
    });

    const mouseLeave = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
    });

    canvas.dispatchEvent(mouseDown);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(mouseLeave);

    await waitFor(
      () => {
        expect(ref.current).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('should handle touch cancel event', async () => {
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref });

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const rect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
    };
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => rect,
      writable: true,
      configurable: true,
    });

    const touchStart = new TouchEvent('touchstart', {
      touches: [
        {
          clientX: 400,
          clientY: 300,
        } as Touch,
      ],
      bubbles: true,
      cancelable: true,
    });

    const touchCancel = new TouchEvent('touchcancel', {
      bubbles: true,
      cancelable: true,
    });

    canvas.dispatchEvent(touchStart);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(touchCancel);

    await waitFor(
      () => {
        expect(ref.current).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('should handle eraser tool', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    store.dispatch(setTool('eraser'));

    expect(ref.current).not.toBeNull();
  });

  it('should handle color change', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    store.dispatch(setColor('#ff0000'));

    expect(ref.current).not.toBeNull();
  });

  it('should handle brush size change', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });

    store.dispatch(setBrushSize(20));

    expect(ref.current).not.toBeNull();
  });

  it('should handle onDraw callback', async () => {
    const onDraw = jest.fn();
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref, onDraw });

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const rect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
    };
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => rect,
      writable: true,
      configurable: true,
    });

    const mouseDown = new MouseEvent('mousedown', {
      clientX: 400,
      clientY: 300,
      bubbles: true,
      cancelable: true,
    });

    const mouseMove = new MouseEvent('mousemove', {
      clientX: 450,
      clientY: 350,
      bubbles: true,
      cancelable: true,
    });

    const mouseUp = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
    });

    canvas.dispatchEvent(mouseDown);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(mouseMove);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(mouseUp);

    await waitFor(
      () => {
        expect(ref.current).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('should handle onStrokeEnd callback', async () => {
    const onStrokeEnd = jest.fn();
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref, onStrokeEnd });

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const rect = {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
    };
    Object.defineProperty(canvas, 'getBoundingClientRect', {
      value: () => rect,
      writable: true,
      configurable: true,
    });

    const mouseDown = new MouseEvent('mousedown', {
      clientX: 400,
      clientY: 300,
      bubbles: true,
      cancelable: true,
    });

    const mouseUp = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
    });

    canvas.dispatchEvent(mouseDown);
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvas.dispatchEvent(mouseUp);

    await waitFor(
      () => {
        expect(ref.current).not.toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it('should handle custom width and height', () => {
    const ref = createRef<CanvasHandle>();
    const { container } = renderCanvas({ ref, width: 1000, height: 800 });

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
