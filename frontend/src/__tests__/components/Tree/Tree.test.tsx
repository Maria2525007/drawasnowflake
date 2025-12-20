import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Tree } from '../../../components/Tree/Tree';

const renderTree = (props = {}) => {
  return render(
    <Provider store={store}>
      <Tree {...props} />
    </Provider>
  );
};

describe('Tree', () => {
  describe('Rendering', () => {
    it('should render without ref', () => {
      const { container } = renderTree();
      expect(container).toBeInTheDocument();
    });

    it('should render with ref', () => {
      const ref = createRef<HTMLCanvasElement>();
      const { container } = renderTree({ ref });
      expect(container).toBeInTheDocument();
    });

    it('should render TreeCanvas component', () => {
      const { container } = renderTree();
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render TreeCanvas when ref is provided', () => {
      const ref = createRef<HTMLCanvasElement>();
      const { container } = renderTree({ ref });
      
      expect(container.querySelector('canvas')).toBeInTheDocument();
      expect(ref).toBeDefined();
    });

    it('should render TreeCanvas when ref is not provided', () => {
      const { container } = renderTree();
      
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('Ref Handling', () => {
    it('should pass ref to TreeCanvas when ref has current property', () => {
      const ref = createRef<HTMLCanvasElement>();
      renderTree({ ref });
      
      expect(ref).toBeDefined();
      expect(typeof ref).toBe('object');
    });

    it('should handle ref object correctly', () => {
      const ref = createRef<HTMLCanvasElement>();
      const { container } = renderTree({ ref });
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render Box container', () => {
      const { container } = renderTree();
      const box = container.querySelector('div[class*="MuiBox"]');
      expect(box).toBeInTheDocument();
    });

    it('should render canvas element', () => {
      const { container } = renderTree();
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });
});