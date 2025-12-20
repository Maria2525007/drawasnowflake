import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';
import { createRef } from 'react';

jest.mock('../../../utils/export', () => ({
  exportCanvasAsImage: jest.fn(),
  copyCanvasToClipboard: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../utils/analytics', () => ({
  trackImageExported: jest.fn(),
  trackToolUsed: jest.fn(),
}));

describe('Toolbar Copy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { write: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('should handle copy success', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const canvasRef = createRef<HTMLCanvasElement>();
    Object.assign(canvasRef, { current: canvas });

    render(
      <Provider store={store}>
        <Toolbar canvasRef={canvasRef} currentTab={1} />
      </Provider>
    );

    const copyButton = screen.getByLabelText(/copy/i);
    await user.click(copyButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });
  });

  it('should handle copy failure', async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { copyCanvasToClipboard } = require('../../../utils/export');
    copyCanvasToClipboard.mockResolvedValue(false);

    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const canvasRef = createRef<HTMLCanvasElement>();
    Object.assign(canvasRef, { current: canvas });

    render(
      <Provider store={store}>
        <Toolbar canvasRef={canvasRef} currentTab={1} />
      </Provider>
    );

    const copyButton = screen.getByLabelText(/copy/i);
    await user.click(copyButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });
  });

  it('should not copy when canvasRef is null', async () => {
    const user = userEvent.setup();
    const canvasRef = createRef<HTMLCanvasElement>();
    Object.assign(canvasRef, { current: null });

    render(
      <Provider store={store}>
        <Toolbar canvasRef={canvasRef} currentTab={1} />
      </Provider>
    );

    const copyButton = screen.getByLabelText(/copy/i);
    await user.click(copyButton);

    // Should not show snackbar when canvasRef is null
    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).not.toBeInTheDocument();
    }, { timeout: 500 });
  });
});
