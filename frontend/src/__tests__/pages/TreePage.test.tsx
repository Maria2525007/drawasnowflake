import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { TreePage } from '../../pages/TreePage';
import { getAllSnowflakes } from '../../services/api';

jest.mock('../../services/api', () => ({
  getAllSnowflakes: jest.fn(),
}));

describe('TreePage', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );

  beforeEach(() => {
    (getAllSnowflakes as jest.Mock).mockClear();
  });

  it('should render tree canvas', () => {
    (getAllSnowflakes as jest.Mock).mockResolvedValue([]);
    const { container } = render(<TreePage />, { wrapper });
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should load snowflakes from server', async () => {
    const mockSnowflakes = [
      { id: '1', x: 100, y: 100, rotation: 0, scale: 1, pattern: 'custom' },
    ];
    (getAllSnowflakes as jest.Mock).mockResolvedValue(mockSnowflakes);

    render(<TreePage />, { wrapper });

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });
  });

  it('should handle empty snowflakes', async () => {
    (getAllSnowflakes as jest.Mock).mockResolvedValue([]);

    render(<TreePage />, { wrapper });

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });
  });
});
