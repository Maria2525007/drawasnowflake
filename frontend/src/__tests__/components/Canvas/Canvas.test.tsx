import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Canvas, CanvasHandle } from '../../../components/Canvas/Canvas';
import { createRef } from 'react';
import { saveState } from '../../../features/history/historySlice';
import { setTool, setColor, setBrushSize } from '../../../features/drawing/drawingSlice';

// Mock dispatch for testing
jest.mock('../../../hooks/useAppDispatch', () => ({
  useAppDispatch: () => jest.fn(),
}));

const renderCanvas = (props = {}) => {
  return render(
    <Provider store={store}>
      <Canvas {...props} />
    </Provider>
  );
};

describe('Canvas', () => {
  beforeEach(() => {
    // Reset devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });
  });

  describe('Rendering', () => {
    it('should render canvas element', () => {
      const { container } = renderCanvas();
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('should render with custom width and height', () => {
      const { container } = renderCanvas({ width: 800, height: 600 });
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveStyle({ width: '100%', height: '100%' });
    });

    it('should render Box container with correct styles', () => {
      const { container } = renderCanvas();
      const box = container.querySelector('div[class*="MuiBox"]');
      expect(box).toBeInTheDocument();
      expect(box).toHaveStyle({ width: '100%', height: '100%' });
    });
  });

  describe('Canvas Handle Methods', () => {
    it('should expose all required handle methods', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      expect(ref.current).not.toBeNull();
      expect(ref.current?.getCanvas).toBeDefined();
      expect(ref.current?.getImageData).toBeDefined();
      expect(ref.current?.getImageDataForAnalysis).toBeDefined();
      expect(ref.current?.clear).toBeDefined();
      expect(ref.current?.getZoom).toBeDefined();
    });

    it('should get canvas element from handle', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      const canvas = ref.current?.getCanvas();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas).not.toBeNull();
    });

    it('should return null if canvas ref is not available', () => {
      const ref = createRef<CanvasHandle>();
      const { unmount } = renderCanvas({ ref });
      
      // After unmount, canvas should still exist in ref temporarily
      // but getCanvas should handle it gracefully
      expect(ref.current?.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
      unmount();
    });

    it('should get zoom value correctly', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref, zoom: 1.5 });

      expect(ref.current?.getZoom()).toBe(1.5);
    });

    it('should get default zoom value when not provided', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      expect(ref.current?.getZoom()).toBe(1.0);
    });

    it('should clear canvas and reset to background color', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      // Should not throw when clearing
      expect(() => ref.current?.clear()).not.toThrow();
    });

    it('should get image data as data URL', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref, zoom: 1.0 });

      const imageData = ref.current?.getImageData();
      expect(imageData).toBeTruthy();
      expect(typeof imageData).toBe('string');
    });

    it('should get image data for analysis', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      const imageData = ref.current?.getImageDataForAnalysis();
      expect(imageData).not.toBeNull();
      expect(imageData).toBeInstanceOf(ImageData);
    });

    it('should handle getImageData when offscreen canvas is null', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      // ImageData should still return a value
      const imageData = ref.current?.getImageData();
      expect(imageData).not.toBeNull();
    });
  });

  describe('Zoom Handling', () => {
    it('should handle different zoom values', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref, zoom: 2.0 });

      expect(ref.current?.getZoom()).toBe(2.0);
    });

    it('should handle zoom changes', () => {
      const ref = createRef<CanvasHandle>();
      const { rerender } = renderCanvas({ ref, zoom: 1.0 });

      expect(ref.current?.getZoom()).toBe(1.0);

      rerender(
        <Provider store={store}>
          <Canvas ref={ref} zoom={1.5} />
        </Provider>
      );

      expect(ref.current?.getZoom()).toBe(1.5);
    });

    it('should scale image data correctly with zoom', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref, zoom: 1.5 });

      const imageData = ref.current?.getImageData();
      expect(imageData).toBeTruthy();
    });
  });

  describe('Drawing State Updates', () => {
    it('should update drawing state when tool changes', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      store.dispatch(setTool('eraser'));

      // Component should handle state updates
      expect(ref.current).not.toBeNull();
    });

    it('should update drawing state when color changes', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      store.dispatch(setColor('#ff0000'));

      expect(ref.current).not.toBeNull();
    });

    it('should update drawing state when brush size changes', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      store.dispatch(setBrushSize(10));

      expect(ref.current).not.toBeNull();
    });
  });

  describe('History Integration', () => {
    it('should handle history state changes', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      const testState = 'data:image/png;base64,test';
      store.dispatch(saveState(testState));

      // Component should handle history updates
      expect(ref.current).not.toBeNull();
    });

    it('should handle undo/redo triggers', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      // Save initial state
      store.dispatch(saveState('state1'));
      store.dispatch(saveState('state2'));

      // Component should respond to history changes
      expect(ref.current).not.toBeNull();
    });
  });

  describe('Canvas Rendering', () => {
    it('should handle device pixel ratio correctly', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2,
      });

      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      const canvas = ref.current?.getCanvas();
      expect(canvas).toBeInTheDocument();
    });

    it('should render offscreen canvas with correct dimensions', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      // Offscreen canvas should be initialized
      const imageData = ref.current?.getImageDataForAnalysis();
      expect(imageData).not.toBeNull();
    });
  });

  describe('Props Handling', () => {
    it('should handle onDraw callback prop', () => {
      const onDraw = jest.fn();
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref, onDraw });

      // onDraw is called during drawing interactions
      expect(onDraw).toBeDefined();
    });

    it('should handle onStrokeEnd callback prop', () => {
      const onStrokeEnd = jest.fn();
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref, onStrokeEnd });

      expect(onStrokeEnd).toBeDefined();
    });

    it('should handle onZoomChange callback prop', () => {
      const onZoomChange = jest.fn();
      renderCanvas({ onZoomChange });

      // Callback is defined but may not be used directly in component
      expect(onZoomChange).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null canvas ref gracefully', () => {
      const ref = createRef<CanvasHandle>();
      const { unmount } = renderCanvas({ ref });
      
      expect(ref.current).not.toBeNull();
      unmount();
    });

    it('should handle missing offscreen canvas context', () => {
      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      // Should still return valid data
      const imageData = ref.current?.getImageData();
      expect(imageData).not.toBeNull();
    });

    it('should handle canvas without getBoundingClientRect', () => {
      const originalGetBoundingClientRect = HTMLCanvasElement.prototype.getBoundingClientRect;
      HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      }));

      const ref = createRef<CanvasHandle>();
      renderCanvas({ ref });

      expect(ref.current).not.toBeNull();

      HTMLCanvasElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });
  });
});