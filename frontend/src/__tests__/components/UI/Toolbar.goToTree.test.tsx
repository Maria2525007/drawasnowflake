import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';
import { createRef } from 'react';
import type { CanvasHandle } from '../../../components/Canvas/Canvas';

jest.mock('../../../utils/export', () => ({
  exportCanvasAsImage: jest.fn(),
  copyCanvasToClipboard: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../utils/analytics', () => ({
  trackImageExported: jest.fn(),
  trackToolUsed: jest.fn(),
}));

describe('Toolbar GoToTree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onGoToTree when provided', async () => {
    const user = userEvent.setup();
    const onGoToTree = jest.fn();
    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        return canvas;
      }),
      getImageData: jest.fn(() => 'data:image/png;base64,test'),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    render(
      <Provider store={store}>
        <Toolbar
          drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
          currentTab={0}
          onGoToTree={onGoToTree}
        />
      </Provider>
    );

    const goToTreeButton = screen.getByText(/go on tree/i);
    await user.click(goToTreeButton);

    expect(onGoToTree).toHaveBeenCalled();
  });

  it('should show error when drawCanvasRef is null', async () => {
    const user = userEvent.setup();
    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: null });

    render(
      <Provider store={store}>
        <Toolbar
          drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
          currentTab={0}
        />
      </Provider>
    );

    const goToTreeButton = screen.getByText(/go on tree/i);
    await user.click(goToTreeButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });
  });

  it('should show error when canvas is empty', async () => {
    const user = userEvent.setup();
    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        return canvas;
      }),
      getImageData: jest.fn(() => null),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    render(
      <Provider store={store}>
        <Toolbar
          drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
          currentTab={0}
        />
      </Provider>
    );

    const goToTreeButton = screen.getByText(/go on tree/i);
    await user.click(goToTreeButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });
  });

  it('should show error when canvas has no content', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, 100, 100);
    }

    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => canvas),
      getImageData: jest.fn(() => canvas.toDataURL()),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    render(
      <Provider store={store}>
        <Toolbar
          drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
          currentTab={0}
        />
      </Provider>
    );

    const goToTreeButton = screen.getByText(/go on tree/i);
    await user.click(goToTreeButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });
  });

  it('should create snowflake when canvas has content', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(50, 50, 10, 10);
    }

    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => canvas),
      getImageData: jest.fn(() => canvas.toDataURL()),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    // Mock Image.onload
    const originalImage = window.Image;
    window.Image = jest.fn().mockImplementation(() => {
      const img = new originalImage();
      setTimeout(() => {
        if (img.onload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          img.onload(new Event('load') as any);
        }
      }, 0);
      return img;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    render(
      <Provider store={store}>
        <Toolbar
          drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
          currentTab={0}
        />
      </Provider>
    );

    const goToTreeButton = screen.getByText(/go on tree/i);
    await user.click(goToTreeButton);

    await waitFor(
      () => {
        const snackbar = screen.queryByRole('alert');
        expect(snackbar).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    window.Image = originalImage;
  });

  it('should handle snackbar close', async () => {
    const user = userEvent.setup();
    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        return canvas;
      }),
      getImageData: jest.fn(() => null),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    render(
      <Provider store={store}>
        <Toolbar
          drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
          currentTab={0}
        />
      </Provider>
    );

    const goToTreeButton = screen.getByText(/go on tree/i);
    await user.click(goToTreeButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });

    const closeButton = screen.queryByRole('button', { name: /close/i });
    if (closeButton) {
      await user.click(closeButton);
    }
  });
});
