import { en } from './locales/en';
import { ru } from './locales/ru';

export type Locale = 'en' | 'ru';
export type Translations = typeof en;

const translations: Record<Locale, Translations> = {
  en,
  ru,
};

let currentLocale: Locale = (localStorage.getItem('locale') as Locale) || 'en';

export const setLocale = (locale: Locale): void => {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
};

export const getLocale = (): Locale => currentLocale;

export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey]?.toString() || `{${paramKey}}`;
    });
  }
  
  return value;
};
