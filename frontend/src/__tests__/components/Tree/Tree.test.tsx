import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Tree } from '../../../components/Tree/Tree';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe('Tree', () => {
  it('should render TreeCanvas', () => {
    const { container } = render(<Tree />, { wrapper });
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render TreeCanvas with ref', () => {
    const ref = createRef<HTMLCanvasElement>();
    const { container } = render(<Tree ref={ref} />, { wrapper });
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render without ref', () => {
    const { container } = render(<Tree />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
