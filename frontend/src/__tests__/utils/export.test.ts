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

  it('should export canvas as image', (done) => {
    const linkClickSpy = jest.fn();
    const appendChildSpy = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => {
        const link = document.createElement('a');
        link.click = linkClickSpy;
        return link;
      });
    const removeChildSpy = jest
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => {
        return {} as Node;
      });

    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      if (callback) {
        callback(new Blob(['test'], { type: 'image/png' }));
      }
    };

    exportCanvasAsImage(canvas);

    setTimeout(() => {
      expect(appendChildSpy).toHaveBeenCalled();
      expect(linkClickSpy).toHaveBeenCalled();
      HTMLCanvasElement.prototype.toBlob = originalToBlob;
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      done();
    }, 100);
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
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      if (callback) {
        callback(new Blob(['test'], { type: 'image/png' }));
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
