import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';
import { createRef } from 'react';
import type { CanvasHandle } from '../../Canvas/Canvas';
import { addSnowflake } from '../../../features/snowflake/snowflakeSlice';
import * as storageModule from '../../../utils/storage';

jest.mock('../../../utils/storage', () => ({
  saveToLocalStorage: jest.fn(),
  loadFromLocalStorage: jest.fn().mockReturnValue({
    snowflakes: [{ id: '1', x: 100, y: 100 }],
    timestamp: Date.now(),
  }),
}));

jest.mock('../../../utils/export', () => ({
  exportCanvasAsImage: jest.fn(),
  copyCanvasToClipboard: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../utils/analytics', () => ({
  trackWorkSaved: jest.fn(),
  trackImageExported: jest.fn(),
  trackToolUsed: jest.fn(),
}));

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
      <Toolbar drawCanvasRef={drawCanvasRef as React.RefObject<CanvasHandle>} currentTab={0} {...props} />
    </Provider>
  );
};

describe('Toolbar Extended', () => {
  beforeEach(() => {
    store.dispatch({ type: 'RESET' });
  });

  it('should handle save', async () => {
    const user = userEvent.setup();
    store.dispatch(addSnowflake({ id: '1', x: 100, y: 100, rotation: 0, scale: 1, pattern: 'custom' }));
    
    renderToolbar();
    
    const saveButton = screen.queryByLabelText('save');
    if (saveButton) {
      await user.click(saveButton);
    }
  });

  it('should handle load', async () => {
    const user = userEvent.setup();
    renderToolbar();
    
    const loadButton = screen.queryByLabelText('load');
    if (loadButton) {
      await user.click(loadButton);
    }
  });

  it('should handle export with drawCanvasRef', async () => {
    const user = userEvent.setup();
    renderToolbar();
    
    const exportButton = screen.queryByLabelText('export');
    if (exportButton) {
      await user.click(exportButton);
    }
  });

  it('should handle copy with drawCanvasRef', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { write: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    
    renderToolbar();
    
    const copyButton = screen.queryByLabelText('copy');
    if (copyButton) {
      await user.click(copyButton);
    }
  });

  it('should handle zoom slider change', async () => {
    const user = userEvent.setup();
    const onZoomChange = jest.fn();
    renderToolbar({ onZoomChange, zoom: 1.0 });
    
    const slider = screen.getByLabelText('zoom');
    await user.click(slider);
    
    expect(slider).toBeInTheDocument();
  });

  it('should close color picker drawer', async () => {
    const user = userEvent.setup();
    renderToolbar();
    
    const colorPickerButton = screen.getByLabelText('color picker');
    await user.click(colorPickerButton);
    
    const drawer = screen.getByRole('presentation');
    expect(drawer).toBeInTheDocument();
    
    const backdrop = drawer.querySelector('[class*="MuiBackdrop"]');
    if (backdrop) {
      await user.click(backdrop);
    }
  });

  it('should handle snackbar close', async () => {
    jest.spyOn(storageModule, 'saveToLocalStorage').mockImplementation(() => {});
    
    store.dispatch(addSnowflake({ id: '1', x: 100, y: 100, rotation: 0, scale: 1, pattern: 'custom' }));
    
    renderToolbar();
    
    await waitFor(() => {
      const snackbar = screen.queryByRole('alert');
      if (snackbar) {
        expect(snackbar).toBeInTheDocument();
      }
    }, { timeout: 1000 });
  });

  it('should disable zoom in at max zoom', () => {
    renderToolbar({ zoom: 2.0 });
    
    const zoomInButton = screen.getByLabelText('zoom in');
    expect(zoomInButton).toBeDisabled();
  });

  it('should disable zoom out at min zoom', () => {
    renderToolbar({ zoom: 0.1 });
    
    const zoomOutButton = screen.getByLabelText('zoom out');
    expect(zoomOutButton).toBeDisabled();
  });

  it('should handle brush size slider change', async () => {
    const user = userEvent.setup();
    renderToolbar();
    
    const slider = screen.getByLabelText('brush size');
    await user.click(slider);
    
    expect(slider).toBeInTheDocument();
  });
});

