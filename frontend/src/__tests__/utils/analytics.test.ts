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
    delete (window as any).gtag;
    delete (window as any).dataLayer;
  });

  it('should initialize analytics', () => {
    const measurementId = 'G-XXXXXXXXXX';
    initAnalytics(measurementId);
    
    expect(window.dataLayer).toBeDefined();
    expect(window.gtag).toBeDefined();
  });

  it('should track event', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;
    
    trackEvent('test_event', { key: 'value' });
    expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { key: 'value' });
  });

  it('should track snowflake created', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;
    
    trackSnowflakeCreated();
    expect(mockGtag).toHaveBeenCalledWith('event', 'snowflake_created', undefined);
  });

  it('should track work saved', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;
    
    trackWorkSaved();
    expect(mockGtag).toHaveBeenCalledWith('event', 'work_saved', undefined);
  });

  it('should track image exported', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;
    
    trackImageExported();
    expect(mockGtag).toHaveBeenCalledWith('event', 'image_exported', undefined);
  });

  it('should track tool used', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;
    
    trackToolUsed('pencil');
    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_used', { tool_name: 'pencil' });
  });

  it('should not fail if gtag is not available', () => {
    delete (window as any).gtag;
    expect(() => trackEvent('test')).not.toThrow();
  });
});

