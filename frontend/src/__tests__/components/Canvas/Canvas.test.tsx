import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Canvas, CanvasHandle } from '../../../components/Canvas/Canvas';
import { createRef } from 'react';

const renderCanvas = (props = {}) => {
  return render(
    <Provider store={store}>
      <Canvas {...props} />
    </Provider>
  );
};

describe('Canvas', () => {
  it('should render canvas element', () => {
    const { container } = renderCanvas();
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should expose canvas handle methods', () => {
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
  });

  it('should get zoom value', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref, zoom: 1.5 });
    
    expect(ref.current?.getZoom()).toBe(1.5);
  });

  it('should clear canvas', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref });
    
    expect(() => ref.current?.clear()).not.toThrow();
  });

  it('should render with custom width and height', () => {
    const { container } = renderCanvas({ width: 800, height: 600 });
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should handle zoom prop', () => {
    const ref = createRef<CanvasHandle>();
    renderCanvas({ ref, zoom: 2.0 });
    
    expect(ref.current?.getZoom()).toBe(2.0);
  });
});

