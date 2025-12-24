import * as Sentry from '@sentry/node';

export const initSentry = (dsn?: string) => {
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
};

export const captureException = (
  error: Error,
  context?: Record<string, unknown>
) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Экспортируем Sentry для использования setupExpressErrorHandler
export { Sentry };
