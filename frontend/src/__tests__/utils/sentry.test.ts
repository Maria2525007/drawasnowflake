import { initSentry, captureException } from '../../utils/sentry';

jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
}));

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
  });

  describe('captureException', () => {
    it('should capture exception', async () => {
      const sentry = await import('@sentry/react');
      const error = new Error('Test error');

      captureException(error);

      expect(sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
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
