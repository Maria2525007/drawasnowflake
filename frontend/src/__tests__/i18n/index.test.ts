import { setLocale, getLocale, t } from '../../i18n/index';

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setLocale', () => {
    it('should set locale', () => {
      setLocale('ru');
      expect(getLocale()).toBe('ru');
    });

    it('should persist locale to localStorage', () => {
      setLocale('en');
      expect(localStorage.getItem('locale')).toBe('en');

      setLocale('ru');
      expect(localStorage.getItem('locale')).toBe('ru');
    });
  });

  describe('getLocale', () => {
    it('should return default locale', () => {
      localStorage.removeItem('locale');
      setLocale('en');
      expect(getLocale()).toBe('en');
    });

    it('should return locale from localStorage', () => {
      setLocale('ru');
      expect(getLocale()).toBe('ru');

      setLocale('en');
      expect(getLocale()).toBe('en');
    });
  });

  describe('t', () => {
    it('should translate key', () => {
      setLocale('en');
      expect(t('header.title')).toBe('Draw a Snowflake');
    });

    it('should translate nested key', () => {
      setLocale('en');
      expect(t('toolbar.ariaLabels.pencil')).toBe('pencil');
    });

    it('should replace parameters', () => {
      setLocale('en');
      expect(t('drawPage.similarity', { value: 85 })).toBe(
        'Snowflake similarity: 85%'
      );
    });

    it('should return key if translation not found', () => {
      setLocale('en');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(t('nonexistent.key' as any)).toBe('nonexistent.key');
    });

    it('should return key if value is not string', () => {
      setLocale('en');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(t('toolbar' as any)).toBe('toolbar');
    });

    it('should work with different locales', () => {
      setLocale('en');
      const enTitle = t('header.title');
      expect(enTitle).toBe('Draw a Snowflake');

      setLocale('ru');
      const ruTitle = t('header.title');
      expect(ruTitle).toBe('Нарисуй Снежинку');
    });
  });
});
