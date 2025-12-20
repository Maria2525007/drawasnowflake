import * as Sentry from '@sentry/react';
import { initSentry, captureException } from '../../utils/sentry';

jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  browserTracingIntegration: jest.fn(() => 'browserTracingIntegration'),
  replayIntegration: jest.fn(() => 'replayIntegration'),
  captureException: jest.fn(),
}));

describe('sentry utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initSentry', () => {
    it('should initialize Sentry with DSN', () => {
      const dsn = 'https://test@sentry.io/test';
      initSentry(dsn);

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn,
        integrations: ['browserTracingIntegration', 'replayIntegration'],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    });

    it('should not initialize Sentry if DSN is undefined', () => {
      initSentry(undefined);

      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should not initialize Sentry if DSN is empty string', () => {
      initSentry('');

      initSentry(undefined);
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should include browserTracingIntegration', () => {
      const dsn = 'https://test@sentry.io/test';
      initSentry(dsn);

      expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          integrations: expect.arrayContaining(['browserTracingIntegration']),
        })
      );
    });

    it('should include replayIntegration', () => {
      const dsn = 'https://test@sentry.io/test';
      initSentry(dsn);

      expect(Sentry.replayIntegration).toHaveBeenCalled();
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          integrations: expect.arrayContaining(['replayIntegration']),
        })
      );
    });

    it('should set correct sample rates', () => {
      const dsn = 'https://test@sentry.io/test';
      initSentry(dsn);

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        })
      );
    });
  });

  describe('captureException', () => {
    it('should capture exception with error', () => {
      const error = new Error('Test error');
      captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
    });

    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      captureException(error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });

    it('should capture exception without context', () => {
      const error = new Error('Test error');
      captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
    });

    it('should handle different error types', () => {
      const typeError = new TypeError('Type error');
      captureException(typeError);

      expect(Sentry.captureException).toHaveBeenCalledWith(typeError, {
        extra: undefined,
      });
    });

    it('should handle context with various data types', () => {
      const error = new Error('Test error');
      const context = {
        string: 'value',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
      };
      captureException(error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });
  });
});