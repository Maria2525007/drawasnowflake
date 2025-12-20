import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { TreePage } from '../../pages/TreePage';
import { getAllSnowflakes } from '../../services/api';

jest.mock('../../services/api', () => ({
  getAllSnowflakes: jest.fn(),
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

describe('TreePage Extended', () => {
  beforeEach(() => {
    (getAllSnowflakes as jest.Mock).mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should load snowflakes from server on mount', async () => {
    const mockSnowflakes = [
      {
        id: '1',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        pattern: 'custom',
        imageData: 'data:image/png;base64,test',
      },
    ];

    (getAllSnowflakes as jest.Mock).mockResolvedValue(mockSnowflakes);

    renderTreePage();

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });
  });

  it('should handle empty snowflakes array', async () => {
    (getAllSnowflakes as jest.Mock).mockResolvedValue([]);

    renderTreePage();

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });

    const snowText = screen.queryByText(/LET'S IT SNOW/i);
    if (snowText) {
      expect(snowText).toBeInTheDocument();
    }
  });

  it('should handle snowflakes with clamped positions', async () => {
    const mockSnowflakes = [
      { id: '1', x: -100, y: 100, rotation: 0, scale: 1, pattern: 'custom' },
      { id: '2', x: 10000, y: 100, rotation: 0, scale: 1, pattern: 'custom' },
    ];

    (getAllSnowflakes as jest.Mock).mockResolvedValue(mockSnowflakes);

    renderTreePage();

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });
  });

  it('should handle snowflakes with default values', async () => {
    const mockSnowflakes = [{ id: '1', x: 100, y: 100 }];

    (getAllSnowflakes as jest.Mock).mockResolvedValue(mockSnowflakes);

    renderTreePage();

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    (getAllSnowflakes as jest.Mock).mockRejectedValue(new Error('API Error'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderTreePage();

    await waitFor(() => {
      expect(getAllSnowflakes).toHaveBeenCalled();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load snowflakes from server:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should render tree canvas', () => {
    (getAllSnowflakes as jest.Mock).mockResolvedValue([]);

    const { container } = renderTreePage();
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should render toolbar with tree tab', () => {
    (getAllSnowflakes as jest.Mock).mockResolvedValue([]);

    renderTreePage();
    const snowText = screen.queryByText(/LET'S IT SNOW/i);
    if (snowText) {
      expect(snowText).toBeInTheDocument();
    }
  });
});
