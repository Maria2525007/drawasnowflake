import { API_CONFIG } from './constants';

export const getApiUrl = (): string => {
  try {
    const viteUrl = import.meta?.env?.VITE_API_URL;
    if (viteUrl) {
      return viteUrl;
    }
  } catch {
  }
  return API_CONFIG.DEFAULT_URL;
};
