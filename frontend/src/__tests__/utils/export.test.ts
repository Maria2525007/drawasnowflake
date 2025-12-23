import { exportCanvasAsImage, copyCanvasToClipboard } from '../../utils/export';

describe('export utilities', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockBlob: Blob;
  let mockLink: HTMLAnchorElement;
  let createElementSpy: jest.SpyInstance;

  beforeEach(() => {
    mockBlob = new Blob(['test'], { type: 'image/png' });
    mockLink = document.createElement('a');
    Object.defineProperty(mockLink, 'click', {
      value: jest.fn(),
      writable: true,
    });
    Object.defineProperty(mockLink, 'href', {
      value: '',
      writable: true,
    });
    Object.defineProperty(mockLink, 'download', {
      value: '',
      writable: true,
    });

    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 100;
    mockCanvas.height = 100;
    mockCanvas.toBlob = jest.fn((callback) => {
      if (callback) {
        callback(mockBlob);
      }
    });

    global.URL.createObjectURL = jest.fn(() => 'blob:test');
    global.URL.revokeObjectURL = jest.fn();

    createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return document.createElement(tagName);
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
    createElementSpy.mockRestore();
  });

  describe('exportCanvasAsImage', () => {
    it('should export canvas as image', () => {
      exportCanvasAsImage(mockCanvas);

      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe('blob:test');
      expect(mockLink.download).toBe('snowflake-tree.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
    });

    it('should handle null blob', () => {
      mockCanvas.toBlob = jest.fn((callback) => {
        if (callback) {
          callback(null);
        }
      });

      exportCanvasAsImage(mockCanvas);

      expect(mockCanvas.toBlob).toHaveBeenCalled();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('should use custom filename', () => {
      exportCanvasAsImage(mockCanvas, 'custom.png');

      expect(mockLink.download).toBe('custom.png');
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

    it('should copy canvas to clipboard', async () => {
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

      const result = await copyCanvasToClipboard(mockCanvas);

      expect(result).toBe(false);
    });
  });
});
