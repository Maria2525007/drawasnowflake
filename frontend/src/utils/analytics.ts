declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export const initAnalytics = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  const gtag = function (...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag = gtag as Window['gtag'];

  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
  });
};

export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackSnowflakeCreated = () => {
  trackEvent('snowflake_created');
};

export const trackWorkSaved = () => {
  trackEvent('work_saved');
};

export const trackImageExported = () => {
  trackEvent('image_exported');
};

export const trackToolUsed = (toolName: string) => {
  trackEvent('tool_used', { tool_name: toolName });
};
