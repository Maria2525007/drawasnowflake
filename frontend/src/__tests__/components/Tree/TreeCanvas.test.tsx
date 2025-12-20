import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { TreeCanvas } from '../../../components/Tree/TreeCanvas';

describe('TreeCanvas', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('should render canvas', () => {
    const { container } = render(<TreeCanvas />, { wrapper });
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render canvas with ref', () => {
    const { container } = render(<TreeCanvas canvasRef={undefined} />, {
      wrapper,
    });
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
