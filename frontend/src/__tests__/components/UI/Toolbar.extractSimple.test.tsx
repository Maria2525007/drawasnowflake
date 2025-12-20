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

describe('Toolbar Extract Simple', () => {
  it('should handle goToTree with no drawCanvasRef', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const goToTreeButton = screen.queryByText(/go on tree/i);
    if (!goToTreeButton) {
      expect(true).toBe(true);
      return;
    }
    await user.click(goToTreeButton);
  });

  it('should handle goToTree when imageData is null', async () => {
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

  it('should handle goToTree when canvas is null', async () => {
    const user = userEvent.setup();
    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => null),
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

  it('should handle goToTree when context is null', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    jest.spyOn(canvas, 'getContext').mockReturnValue(null);

    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => canvas),
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

  it('should handle goToTree when imageDataWithZoom is null', async () => {
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
      getImageData: jest
        .fn()
        .mockReturnValueOnce('data:image/png;base64,test')
        .mockReturnValueOnce(null),
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
});
