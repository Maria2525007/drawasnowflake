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

describe('Toolbar Extract Width Height', () => {
  it('should handle extractSnowflake when width <= 0', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => canvas),
      getImageData: jest.fn(() => canvas.toDataURL()),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    const originalImage = window.Image;
    let imageOnLoad: (() => void) | null = null;
    window.Image = jest.fn().mockImplementation(() => {
      const img = new originalImage();
      Object.defineProperty(img, 'onload', {
        get: () => imageOnLoad,
        set: (fn) => {
          imageOnLoad = fn;
          setTimeout(() => {
            if (fn) {
              fn();
            }
          }, 0);
        },
        configurable: true,
      });
      Object.defineProperty(img, 'width', { value: 200, configurable: true });
      Object.defineProperty(img, 'height', { value: 200, configurable: true });
      return img;
    }) as unknown as typeof Image;

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

  it('should handle extractSnowflake with edge coordinates', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillRect(199, 199, 1, 1);
    }

    const mockCanvasHandle: Partial<CanvasHandle> = {
      getCanvas: jest.fn(() => canvas),
      getImageData: jest.fn(() => canvas.toDataURL()),
      clear: jest.fn(),
    };

    const drawCanvasRef = createRef<CanvasHandle>();
    Object.assign(drawCanvasRef, { current: mockCanvasHandle });

    const originalImage = window.Image;
    let imageOnLoad: (() => void) | null = null;
    window.Image = jest.fn().mockImplementation(() => {
      const img = new originalImage();
      Object.defineProperty(img, 'onload', {
        get: () => imageOnLoad,
        set: (fn) => {
          imageOnLoad = fn;
          setTimeout(() => {
            if (fn) {
              fn();
            }
          }, 0);
        },
        configurable: true,
      });
      Object.defineProperty(img, 'width', { value: 200, configurable: true });
      Object.defineProperty(img, 'height', { value: 200, configurable: true });
      return img;
    }) as unknown as typeof Image;

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
});
