import * as Sentry from '@sentry/react';
import { initSentry, captureException } from '../../utils/sentry';

jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  browserTracingIntegration: jest.fn(() => ({})),
  replayIntegration: jest.fn(() => ({})),
}));

describe('sentry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize sentry with dsn', () => {
    const dsn = 'https://test@sentry.io/123';
    initSentry(dsn);
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn,
      })
    );
  });

  it('should not initialize sentry without dsn', () => {
    initSentry();
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('should capture exception', () => {
    const error = new Error('Test error');
    const context = { url: '/test', method: 'GET' };

    captureException(error, context);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: context,
    });
  });
});
