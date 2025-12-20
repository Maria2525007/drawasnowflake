import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe('Toolbar', () => {
  it('should render toolbar for draw tab', () => {
    render(<Toolbar currentTab={0} />, { wrapper });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('should render toolbar for tree tab', () => {
    render(<Toolbar currentTab={1} />, { wrapper });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('should render pencil tool button on draw tab', () => {
    render(<Toolbar currentTab={0} />, { wrapper });
    const pencilButton = screen.getByLabelText('pencil');
    expect(pencilButton).toBeInTheDocument();
  });

  it('should render eraser tool button on draw tab', () => {
    render(<Toolbar currentTab={0} />, { wrapper });
    const eraserButton = screen.getByLabelText('eraser');
    expect(eraserButton).toBeInTheDocument();
  });
});
