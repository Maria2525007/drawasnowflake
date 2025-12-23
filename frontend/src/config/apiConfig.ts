import { API_CONFIG } from './constants';

export const getApiUrl = (): string => {
  const viteUrl = import.meta?.env?.VITE_API_URL;
  if (viteUrl) {
    return viteUrl;
  }
  return API_CONFIG.DEFAULT_URL;
};
