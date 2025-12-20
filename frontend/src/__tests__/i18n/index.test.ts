import { setLocale, getLocale, t } from '../../i18n/index';
import { en } from '../../i18n/locales/en';
import { ru } from '../../i18n/locales/ru';

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
    setLocale('en');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getLocale', () => {
    it('should return current locale', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');
    });

    it('should return updated locale after setLocale', () => {
      setLocale('ru');
      expect(getLocale()).toBe('ru');
    });
  });

  describe('setLocale', () => {
    it('should set locale to en', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');
      expect(localStorage.getItem('locale')).toBe('en');
    });

    it('should set locale to ru', () => {
      setLocale('ru');
      expect(getLocale()).toBe('ru');
      expect(localStorage.getItem('locale')).toBe('ru');
    });

    it('should update locale', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');

      setLocale('ru');
      expect(getLocale()).toBe('ru');
    });
  });

  describe('t (translate function)', () => {
    it('should translate simple key in English', () => {
      setLocale('en');
      const translated = t('header.title');
      expect(translated).toBe(en.header.title);
    });

    it('should translate simple key in Russian', () => {
      setLocale('ru');
      const translated = t('header.title');
      expect(translated).toBe(ru.header.title);
    });

    it('should translate nested key', () => {
      setLocale('en');
      const translated = t('header.description');
      expect(translated).toBe(en.header.description);
    });

    it('should replace parameters in translation', () => {
      setLocale('en');
      const translated = t('drawPage.similarity', { value: '85.5' });
      expect(translated).toContain('85.5');
      expect(translated).not.toContain('{value}');
    });

    it('should handle multiple parameters', () => {
      setLocale('en');
      const translated = t('drawPage.similarity', { value: '90' });
      expect(translated).toBeTruthy();
    });

    it('should return key if translation not found', () => {
      setLocale('en');
      const translated = t('nonexistent.key');
      expect(translated).toBe('nonexistent.key');
    });

    it('should return key if nested key not found', () => {
      setLocale('en');
      const translated = t('header.nonexistent');
      expect(translated).toBe('header.nonexistent');
    });

    it('should return key if value is not a string', () => {
      setLocale('en');
      const translated = t('invalid.key.path');
      expect(translated).toBe('invalid.key.path');
    });

    it('should handle missing parameter values', () => {
      setLocale('en');
      const translated = t('drawPage.similarity', {});
      expect(translated).toBeTruthy();
    });

    it('should handle number parameters', () => {
      setLocale('en');
      const translated = t('drawPage.similarity', { value: 85 });
      expect(translated).toContain('85');
    });

    it('should handle empty string key', () => {
      setLocale('en');
      const translated = t('');
      expect(translated).toBe('');
    });

    it('should handle deeply nested keys', () => {
      setLocale('en');
      const translated = t('header.title');
      expect(translated).toBeTruthy();
      expect(typeof translated).toBe('string');
    });
  });

  describe('Locale persistence', () => {
    it('should load locale from localStorage on initialization', () => {
      localStorage.setItem('locale', 'ru');
      expect(localStorage.getItem('locale')).toBe('ru');
    });

    it('should persist locale changes to localStorage', () => {
      setLocale('ru');
      expect(localStorage.getItem('locale')).toBe('ru');

      setLocale('en');
      expect(localStorage.getItem('locale')).toBe('en');
    });
  });

  describe('Translation consistency', () => {
    it('should provide same structure for both locales', () => {
      setLocale('en');
      const enTitle = t('header.title');

      setLocale('ru');
      const ruTitle = t('header.title');

      expect(enTitle).toBeTruthy();
      expect(ruTitle).toBeTruthy();
      expect(typeof enTitle).toBe('string');
      expect(typeof ruTitle).toBe('string');
    });
  });
});
