import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3001/api',
      },
    },
  },
  writable: true,
  configurable: true,
});

global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test');
global.URL.revokeObjectURL = jest.fn();

global.ClipboardItem = jest.fn((items: Record<string, Blob>) => {
  return {
    types: Object.keys(items),
    getType: jest.fn((type: string) => Promise.resolve(items[type])),
  } as unknown as ClipboardItem;
}) as unknown as typeof ClipboardItem;

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn((_sx, _sy, sw, sh) => {
      const data = new Uint8ClampedArray((sw || 1) * (sh || 1) * 4);
      return new ImageData(data, sw || 1, sh || 1);
    }),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
    })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
    createRadialGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
    ellipse: jest.fn(),
  })),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: jest.fn(() => 'data:image/png;base64,test'),
  writable: true,
  configurable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: jest.fn(function (callback) {
    if (callback) {
      const blob = new Blob(['test'], { type: 'image/png' });
      callback(blob);
    }
  }),
  writable: true,
  configurable: true,
});

global.requestAnimationFrame = jest.fn((cb) => {
  if (typeof cb === 'function') {
    setTimeout(cb, 0);
  }
  return 1;
});

global.cancelAnimationFrame = jest.fn();

global.requestIdleCallback = jest.fn((cb) => {
  if (typeof cb === 'function') {
    setTimeout(cb, 0);
  }
  return 1;
});

global.cancelIdleCallback = jest.fn();

if (typeof ImageData === 'undefined') {
  global.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight?: number,
      height?: number
    ) {
      if (typeof dataOrWidth === 'number') {
        this.width = dataOrWidth;
        this.height = widthOrHeight || dataOrWidth;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        this.data = dataOrWidth;
        this.width = widthOrHeight || 0;
        this.height = height || 0;
      }
    }
  } as typeof ImageData;
}
