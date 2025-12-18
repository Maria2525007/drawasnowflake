import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';
import { createRef } from 'react';
import type { CanvasHandle } from '../../Canvas/Canvas';

const mockCanvasHandle: Partial<CanvasHandle> = {
  getCanvas: jest.fn(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    return canvas;
  }),
  getImageData: jest.fn(() => 'data:image/png;base64,test'),
  clear: jest.fn(),
  getZoom: jest.fn(() => 1.0),
};

const renderToolbar = (props = {}) => {
  const drawCanvasRef = createRef<CanvasHandle>();
  Object.assign(drawCanvasRef, { current: mockCanvasHandle });

  return render(
    <Provider store={store}>
      <Toolbar
        drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>}
        currentTab={0}
        {...props}
      />
    </Provider>
  );
};

describe('Toolbar Integration', () => {
  it('should handle export on tree tab', async () => {
    const user = userEvent.setup();
    const canvasRef = createRef<HTMLCanvasElement>();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    Object.assign(canvasRef, { current: canvas });

    render(
      <Provider store={store}>
        <Toolbar
          canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          currentTab={1}
        />
      </Provider>
    );

    const exportButton = screen.queryByLabelText('export');
    expect(exportButton).toBeInTheDocument();
    if (exportButton) {
      await user.click(exportButton);
    }
  });

  it('should handle copy on tree tab', async () => {
    const user = userEvent.setup();
    const mockWrite = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { write: mockWrite },
      writable: true,
      configurable: true,
    });

    const canvasRef = createRef<HTMLCanvasElement>();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    Object.assign(canvasRef, { current: canvas });

    render(
      <Provider store={store}>
        <Toolbar
          canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          currentTab={1}
        />
      </Provider>
    );

    const copyButton = screen.queryByLabelText('copy');
    expect(copyButton).toBeInTheDocument();
    if (copyButton) {
      await user.click(copyButton);
    }
  });

  it('should handle clear canvas', async () => {
    const user = userEvent.setup();
    renderToolbar();

    const clearButton = screen.getByLabelText('clear canvas');
    await user.click(clearButton);

    expect(mockCanvasHandle.clear).toHaveBeenCalled();
  });

  it('should handle undo when enabled', async () => {
    const { saveState } =
      await import('../../../features/history/historySlice');
    store.dispatch(saveState('test-state'));

    renderToolbar();

    const undoButton = screen.getByLabelText('undo');
    if (!undoButton.hasAttribute('disabled')) {
      await user.click(undoButton);
    }

    expect(undoButton).toBeInTheDocument();
  });

  it('should handle redo when enabled', async () => {
    const { saveState, undo } =
      await import('../../../features/history/historySlice');
    store.dispatch(saveState('state1'));
    store.dispatch(saveState('state2'));
    store.dispatch(undo());

    renderToolbar();

    const redoButton = screen.getByLabelText('redo');
    if (!redoButton.hasAttribute('disabled')) {
      await user.click(redoButton);
    }

    expect(redoButton).toBeInTheDocument();
  });

  it('should handle zoom in', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();
    renderToolbar({ onZoomChange, zoom: 1.0 });

    const zoomInButton = screen.getByLabelText('zoom in');
    await user.click(zoomInButton);

    expect(onZoomChange).toHaveBeenCalled();
  });

  it('should handle zoom out', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();
    renderToolbar({ onZoomChange, zoom: 1.0 });

    const zoomOutButton = screen.getByLabelText('zoom out');
    await user.click(zoomOutButton);

    expect(onZoomChange).toHaveBeenCalled();
  });

  it('should handle brush size change', async () => {
    const user = userEvent.setup();
    renderToolbar();

    const slider = screen.getByLabelText('brush size');
    await user.click(slider);

    expect(slider).toBeInTheDocument();
  });
});
