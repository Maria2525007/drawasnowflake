import * as Sentry from '@sentry/react';

const getEnv = (): { MODE: string; PROD: boolean } => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return {
      MODE: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      PROD: process.env.NODE_ENV === 'production',
    };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const metaEnv = eval('typeof import.meta !== "undefined" ? import.meta.env : undefined');
    if (metaEnv) {
      return {
        MODE: metaEnv.MODE || 'development',
        PROD: metaEnv.PROD === true,
      };
    }
  } catch {
    // Fallback for test environment
  }
  return { MODE: 'development', PROD: false };
};

export const initSentry = (dsn?: string) => {
  if (!dsn) return;

  const env = getEnv();

  Sentry.init({
    dsn,
    environment: env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
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
