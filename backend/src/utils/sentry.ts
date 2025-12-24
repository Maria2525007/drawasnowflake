import * as Sentry from '@sentry/node';

export const initSentry = (dsn?: string) => {
  if (!dsn) return;

  Sentry.init({
    dsn,
    sendDefaultPii: true,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
    ],
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

export { Sentry };
