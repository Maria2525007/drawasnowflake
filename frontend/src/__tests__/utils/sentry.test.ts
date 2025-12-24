jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  browserTracingIntegration: jest.fn(() => ({})),
  replayIntegration: jest.fn(() => ({})),
}));

import { initSentry, captureException } from '../../utils/sentry';

describe('sentry utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initSentry', () => {
    it('should initialize Sentry with DSN', async () => {
      const sentry = await import('@sentry/react');

      initSentry('https://test@sentry.io/test');

      expect(sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/test',
        })
      );
    });

    it('should not initialize Sentry without DSN', async () => {
      const sentry = await import('@sentry/react');

      initSentry(undefined);

      expect(sentry.init).not.toHaveBeenCalled();
    });

    it('should use process.env.NODE_ENV when available', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const sentry = await import('@sentry/react');

      initSentry('https://test@sentry.io/test');

      expect(sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'production',
          tracesSampleRate: 0.1,
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should use development mode when process.env.NODE_ENV is not production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const sentry = await import('@sentry/react');

      initSentry('https://test@sentry.io/test');

      expect(sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'development',
          tracesSampleRate: 1.0,
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should use fallback when process.env.NODE_ENV is not set', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      const sentry = await import('@sentry/react');

      initSentry('https://test@sentry.io/test');

      expect(sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'development',
          tracesSampleRate: 1.0,
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('captureException', () => {
    it('should capture exception', async () => {
      const sentry = await import('@sentry/react');
      const error = new Error('Test error');

      captureException(error);

      expect(sentry.captureException).toHaveBeenCalled();
      const calls = (sentry.captureException as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe(error);
      expect(calls[0][1]).toEqual({ extra: undefined });
    });

    it('should capture exception with context', async () => {
      const sentry = await import('@sentry/react');
      const error = new Error('Test error');
      const context = { key: 'value' };

      captureException(error, context);

      expect(sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });
  });
});
