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
  it('should render without ref', () => {
    const { container } = renderTree();
    expect(container).toBeInTheDocument();
  });

  it('should render with ref', () => {
    const ref = createRef<HTMLCanvasElement>();
    const { container } = renderTree({ ref });
    expect(container).toBeInTheDocument();
  });

  it('should pass ref to TreeCanvas', () => {
    const ref = createRef<HTMLCanvasElement>();
    renderTree({ ref });
    expect(ref).toBeDefined();
  });
});
