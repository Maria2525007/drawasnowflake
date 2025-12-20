import { exportCanvasAsImage, copyCanvasToClipboard } from '../../utils/export';

describe('export', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 100, 100);
    }
  });

  it('should export canvas as image', () => {
    const linkClickSpy = jest.fn();
    let createdLink: HTMLAnchorElement | null = null;

    const appendChildSpy = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => {
        createdLink = node as HTMLAnchorElement;
        createdLink.click = linkClickSpy;
        return node;
      });
    const removeChildSpy = jest
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => {
        return {} as Node;
      });

    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.revokeObjectURL = jest.fn();

    const mockBlob = new Blob(['test'], { type: 'image/png' });
    // Mock toBlob to call callback synchronously
    const toBlobSpy = jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function (callback) {
        if (callback) {
          // Call synchronously
          callback(mockBlob);
        }
      });

    exportCanvasAsImage(canvas);

    expect(toBlobSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(createdLink).not.toBeNull();
    expect(linkClickSpy).toHaveBeenCalled();

    toBlobSpy.mockRestore();
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    URL.revokeObjectURL = originalRevokeObjectURL;
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should handle copy to clipboard', async () => {
    const mockClipboard = {
      write: jest.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      if (callback) {
        callback(mockBlob);
      }
    };

    const result = await copyCanvasToClipboard(canvas);
    expect(result).toBe(true);
    expect(mockClipboard.write).toHaveBeenCalled();

    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  it('should return false if blob is null', async () => {
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      if (callback) {
        callback(null);
      }
    };

    const result = await copyCanvasToClipboard(canvas);
    expect(result).toBe(false);

    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });
});
