import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { TreePage } from '../../pages/TreePage';

jest.mock('../../services/api', () => ({
  getAllSnowflakes: jest.fn().mockResolvedValue([]),
}));

const renderTreePage = () => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <TreePage />
      </MemoryRouter>
    </Provider>
  );
};

describe('TreePage', () => {
  it('should render tree canvas', () => {
    const { container } = renderTreePage();
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render toolbar', () => {
    renderTreePage();
    expect(screen.getByLabelText('export')).toBeInTheDocument();
  });

  it('should display "LET\'S IT SNOW" message', () => {
    renderTreePage();
    expect(screen.getByText(/LET'S IT SNOW/i)).toBeInTheDocument();
  });

  it('should not render drawing tools', () => {
    renderTreePage();
    expect(screen.queryByLabelText('pencil')).not.toBeInTheDocument();
  });

  it('should have correct page structure', () => {
    const { container } = renderTreePage();
    const box = container.querySelector('div');
    expect(box).toBeInTheDocument();
  });
});

