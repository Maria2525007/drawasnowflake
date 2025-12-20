import {
  initAnalytics,
  trackEvent,
  trackSnowflakeCreated,
  trackWorkSaved,
  trackImageExported,
  trackToolUsed,
} from '../../utils/analytics';

describe('analytics', () => {
  beforeEach(() => {
    // Clear window.gtag and dataLayer
    delete (window as { gtag?: unknown }).gtag;
    delete (window as { dataLayer?: unknown }).dataLayer;
    document.head.innerHTML = '';
  });

  describe('initAnalytics', () => {
    it('should initialize analytics with measurement ID', () => {
      initAnalytics('GA_TEST_ID');
      
      // Check if script was added to head
      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);
      
      // Check if gtag function was created
      expect(window.gtag).toBeDefined();
      expect(typeof window.gtag).toBe('function');
    });

    it('should create dataLayer array', () => {
      initAnalytics('GA_TEST_ID');
      expect(window.dataLayer).toBeDefined();
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });

    it('should not initialize if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing window undefined scenario
      delete global.window;
      
      // Should not throw
      expect(() => initAnalytics('GA_TEST_ID')).not.toThrow();
      
      global.window = originalWindow;
    });

    it('should append scripts to document head', () => {
      const initialScriptCount = document.head.querySelectorAll('script').length;
      initAnalytics('GA_TEST_ID');
      const finalScriptCount = document.head.querySelectorAll('script').length;
      
      expect(finalScriptCount).toBeGreaterThan(initialScriptCount);
    });

    it('should configure gtag with measurement ID', () => {
      const mockDataLayer: unknown[] = [];
      window.dataLayer = mockDataLayer;
      
      initAnalytics('GA_TEST_ID');
      
      // Check if config was called
      expect(mockDataLayer.length).toBeGreaterThan(0);
    });

    it('should set script async attribute', () => {
      initAnalytics('GA_TEST_ID');
      const scripts = document.head.querySelectorAll('script');
      const gtagScript = Array.from(scripts).find((s) =>
        s.src.includes('googletagmanager.com')
      );
      
      expect(gtagScript?.async).toBe(true);
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should call gtag with event name', () => {
      trackEvent('test_event');
      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', undefined);
    });

    it('should call gtag with event name and params', () => {
      const params = { key: 'value' };
      trackEvent('test_event', params);
      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', params);
    });

    it('should not throw if gtag is not defined', () => {
      delete (window as { gtag?: unknown }).gtag;
      expect(() => trackEvent('test_event')).not.toThrow();
    });

    it('should handle undefined params', () => {
      trackEvent('test_event', undefined);
      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', undefined);
    });

    it('should handle empty params object', () => {
      trackEvent('test_event', {});
      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', {});
    });

    it('should not throw if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing window undefined scenario
      delete global.window;
      
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
      expect(window.gtag).toHaveBeenCalledWith('event', 'snowflake_created', undefined);
    });

    it('should not throw if gtag is not defined', () => {
      delete (window as { gtag?: unknown }).gtag;
      expect(() => trackSnowflakeCreated()).not.toThrow();
    });
  });

  describe('trackWorkSaved', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should track work_saved event', () => {
      trackWorkSaved();
      expect(window.gtag).toHaveBeenCalledWith('event', 'work_saved', undefined);
    });

    it('should not throw if gtag is not defined', () => {
      delete (window as { gtag?: unknown }).gtag;
      expect(() => trackWorkSaved()).not.toThrow();
    });
  });

  describe('trackImageExported', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should track image_exported event', () => {
      trackImageExported();
      expect(window.gtag).toHaveBeenCalledWith('event', 'image_exported', undefined);
    });

    it('should not throw if gtag is not defined', () => {
      delete (window as { gtag?: unknown }).gtag;
      expect(() => trackImageExported()).not.toThrow();
    });
  });

  describe('trackToolUsed', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    it('should track tool_used event with tool name', () => {
      trackToolUsed('pencil');
      expect(window.gtag).toHaveBeenCalledWith('event', 'tool_used', {
        tool_name: 'pencil',
      });
    });

    it('should track tool_used event with different tool names', () => {
      trackToolUsed('eraser');
      expect(window.gtag).toHaveBeenCalledWith('event', 'tool_used', {
        tool_name: 'eraser',
      });
    });

    it('should not throw if gtag is not defined', () => {
      delete (window as { gtag?: unknown }).gtag;
      expect(() => trackToolUsed('pencil')).not.toThrow();
    });
  });
});