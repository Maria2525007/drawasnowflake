import {
  initAnalytics,
  trackEvent,
  trackSnowflakeCreated,
  trackWorkSaved,
  trackImageExported,
} from '../../utils/analytics';

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

describe('analytics utilities', () => {
  beforeEach(() => {
    delete (window as { gtag?: unknown }).gtag;
    document.head.innerHTML = '';
    if (window.dataLayer) {
      window.dataLayer = [];
    }
  });

  describe('initAnalytics', () => {
    it('should initialize analytics with measurement ID', () => {
      initAnalytics('GA_TEST_ID');

      expect(window.gtag).toBeDefined();
      expect(typeof window.gtag).toBe('function');
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      delete (global as { window?: Window }).window;

      expect(() => initAnalytics('GA_TEST_ID')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should call gtag with event name', () => {
      trackEvent('test_event');

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'test_event',
        undefined
      );
    });

    it('should call gtag with event name and params', () => {
      const params = { category: 'test', value: 100 };

      trackEvent('test_event', params);

      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', params);
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      delete (global as { window?: Window }).window;

      expect(() => trackEvent('test_event')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('trackSnowflakeCreated', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should track snowflake_created event', () => {
      trackSnowflakeCreated();

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'snowflake_created',
        undefined
      );
    });
  });

  describe('trackWorkSaved', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should track work_saved event', () => {
      trackWorkSaved();

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'work_saved',
        undefined
      );
    });
  });

  describe('trackImageExported', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should track image_exported event', () => {
      trackImageExported();

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'image_exported',
        undefined
      );
    });
  });
});
