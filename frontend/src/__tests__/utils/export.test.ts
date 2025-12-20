import { exportCanvasAsImage, copyCanvasToClipboard } from '../../utils/export';

describe('export utilities', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockBlob: Blob;
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 100;
    mockCanvas.height = 100;

    mockBlob = new Blob(['test'], { type: 'image/png' });

    mockLink = document.createElement('a');
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    mockCanvas.toBlob = jest.fn((callback) => {
      if (callback) {
        callback(mockBlob);
      }
    });

    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return document.createElement(tagName);
    });

    mockLink.click = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('exportCanvasAsImage', () => {
    it('should export canvas as image with default filename', () => {
      exportCanvasAsImage(mockCanvas);

      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('snowflake-tree.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should export canvas with custom filename', () => {
      exportCanvasAsImage(mockCanvas, 'custom-name.png');

      expect(mockLink.download).toBe('custom-name.png');
    });

    it('should handle null blob from toBlob', () => {
      mockCanvas.toBlob = jest.fn((callback) => {
        if (callback) {
          callback(null);
        }
      });

      exportCanvasAsImage(mockCanvas);

      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should create and remove link element', () => {
      exportCanvasAsImage(mockCanvas);

      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should use image/png format', () => {
      exportCanvasAsImage(mockCanvas);

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png'
      );
    });

    it('should revoke object URL after export', () => {
      exportCanvasAsImage(mockCanvas);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('copyCanvasToClipboard', () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, 'clipboard', {
        value: {
          write: jest.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      });

      global.ClipboardItem = jest.fn((items: Record<string, Blob>) => {
        return {
          types: Object.keys(items),
          getType: jest.fn((type: string) => Promise.resolve(items[type])),
        } as unknown as ClipboardItem;
      }) as unknown as typeof ClipboardItem;
    });

    it('should copy canvas to clipboard successfully', async () => {
      const result = await copyCanvasToClipboard(mockCanvas);

      expect(result).toBe(true);
      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(ClipboardItem).toHaveBeenCalledWith({
        'image/png': mockBlob,
      });
      expect(navigator.clipboard.write).toHaveBeenCalled();
    });

    it('should return false if blob is null', async () => {
      mockCanvas.toBlob = jest.fn((callback) => {
        if (callback) {
          callback(null);
        }
      });

      const result = await copyCanvasToClipboard(mockCanvas);

      expect(result).toBe(false);
      expect(navigator.clipboard.write).not.toHaveBeenCalled();
    });

    it('should return false if clipboard write fails', async () => {
      Object.defineProperty(global.navigator, 'clipboard', {
        value: {
          write: jest.fn().mockRejectedValue(new Error('Clipboard error')),
        },
        writable: true,
        configurable: true,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await copyCanvasToClipboard(mockCanvas);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy to clipboard:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle toBlob promise rejection', async () => {
      mockCanvas.toBlob = jest.fn((callback) => {
        if (callback) {
          setTimeout(() => callback(null), 0);
        }
      });

      const result = await copyCanvasToClipboard(mockCanvas);

      expect(result).toBe(false);
    }, 5000);

    it('should create ClipboardItem with correct blob', async () => {
      await copyCanvasToClipboard(mockCanvas);

      expect(ClipboardItem).toHaveBeenCalledWith({
        'image/png': mockBlob,
      });
    });

    it('should handle clipboard API errors gracefully', async () => {
      const error = new Error('Clipboard API not available');
      Object.defineProperty(global.navigator, 'clipboard', {
        value: {
          write: jest.fn().mockRejectedValue(error),
        },
        writable: true,
        configurable: true,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await copyCanvasToClipboard(mockCanvas);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy to clipboard:',
        error
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
