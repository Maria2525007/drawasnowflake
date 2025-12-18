import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { TreeCanvas } from '../../../components/Tree/TreeCanvas';
import { createRef } from 'react';

const renderTreeCanvas = (props = {}) => {
  return render(
    <Provider store={store}>
      <TreeCanvas {...props} />
    </Provider>
  );
};

describe('TreeCanvas', () => {
  it('should render canvas element', () => {
    const { container } = renderTreeCanvas();

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render with external ref', () => {
    const ref = createRef<HTMLCanvasElement>();
    const { container } = renderTreeCanvas({ canvasRef: ref });

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render without external ref', () => {
    const { container } = renderTreeCanvas();

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should have correct container structure', () => {
    const { container } = renderTreeCanvas();
    const box = container.querySelector('div');
    expect(box).toBeInTheDocument();
  });
});
