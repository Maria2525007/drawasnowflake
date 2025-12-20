import { API_CONFIG } from './constants';

// Get API URL - works in both browser (Vite) and Jest (Node)
export const getApiUrl = (): string => {
  // In browser/Vite, use import.meta.env
  // In Jest, this will throw and we'll catch it
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta is not available in Jest
    const viteUrl = import.meta?.env?.VITE_API_URL;
    if (viteUrl) {
      return viteUrl;
    }
  } catch {
    // Fallback for Jest - will use API_CONFIG.DEFAULT_URL
  }
  return API_CONFIG.DEFAULT_URL;
};
