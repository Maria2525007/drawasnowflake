import { render, screen, waitFor, act } from '@testing-library/react';
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

describe('Toolbar Export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle export with canvasRef', async () => {
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

    const exportButton = screen.getByLabelText(/export/i);
    await user.click(exportButton);

    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).toBeInTheDocument();
    });
  });

  it('should not export when canvasRef is null', async () => {
    const user = userEvent.setup();
    const canvasRef = createRef<HTMLCanvasElement>();
    Object.assign(canvasRef, { current: null });

    render(
      <Provider store={store}>
        <Toolbar canvasRef={canvasRef} currentTab={1} />
      </Provider>
    );

    const exportButton = screen.getByLabelText(/export/i);
    await user.click(exportButton);

    // Should not show snackbar when canvasRef is null
    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      expect(snackbar).not.toBeInTheDocument();
    }, { timeout: 500 });
  });
});
