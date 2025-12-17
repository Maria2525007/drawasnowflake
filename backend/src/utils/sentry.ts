import * as Sentry from '@sentry/node';

export const initSentry = (dsn?: string) => {
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
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
