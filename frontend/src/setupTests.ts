import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock import.meta.env for Vite
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

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/test');
global.URL.revokeObjectURL = jest.fn();

// Mock ClipboardItem
global.ClipboardItem = jest.fn((items: Record<string, Blob>) => {
  return {
    types: Object.keys(items),
    getType: jest.fn((type: string) => Promise.resolve(items[type])),
  } as unknown as ClipboardItem;
}) as unknown as typeof ClipboardItem;

// Mock HTMLCanvasElement methods
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
    })),
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

// Mock toDataURL
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: jest.fn(() => 'data:image/png;base64,test'),
  writable: true,
  configurable: true,
});

// Mock toBlob
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
